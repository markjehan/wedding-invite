"""The couple's pages: the overview, the guest list, one guest, and adding guests from Excel.

Every page here needs an account made on the server, signed in with its password and its
authenticator code. They live under /admin/.
"""
from datetime import date
from functools import wraps

from django import forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST

from . import spreadsheet, whatsapp
from .middleware import has_two_step
from .models import Guest, ReplyTo

WEDDING = date(2026, 12, 7)
XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

# The five places a guest can be, in the order they move through them (see Guest.stage).
STAGES = [
    ('unsent', 'Not sent yet', Q(reply='', first_opened_at__isnull=True, sent_at__isnull=True)),
    ('sent', 'Not opened yet', Q(reply='', first_opened_at__isnull=True, sent_at__isnull=False)),
    ('opened', 'Opened, no reply', Q(reply='', first_opened_at__isnull=False)),
    ('coming', 'Coming', Q(reply='yes')),
    ('declined', 'Not coming', Q(reply='no')),
]
STAGE = {key: (label, where) for key, label, where in STAGES}
# The guest list's tabs: the two in-between stages read as one, "waiting for a reply", which is all
# most people checking the list want to know. ?show=sent and ?show=opened still work on their own.
WAITING = STAGE['sent'][1] | STAGE['opened'][1]
SHOWS = {key: where for key, (_, where) in STAGE.items()} | {'waiting': WAITING}
TABS = [('unsent', 'Not sent yet'), ('waiting', 'Waiting for a reply'), ('coming', 'Coming'), ('declined', 'Not coming')]
SIDES = [('bride', "Bride's side"), ('groom', "Groom's side")]


def couple_only(view):
    """Signed in, an admin, and with an authenticator app: anything less never reaches these pages.

    Nothing they show is kept by the browser either: the pages carry names and phone numbers, and a
    stored copy outlives signing out on a shared computer.
    """
    @never_cache
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return redirect_to_login(request.get_full_path())
        if not (user.is_active and user.is_staff):
            raise PermissionDenied
        if not has_two_step(user):
            return redirect('mfa_activate_totp')
        return view(request, *args, **kwargs)
    return wrapped


def link_of(request, guest):
    """The guest's link as they receive it."""
    return f'{settings.SITE_URL or request.build_absolute_uri("/").rstrip("/")}/{guest.code}'


def _counts(guests):
    return guests.aggregate(
        invited=Count('id'),
        seats=Sum('seats', default=0),
        people=Sum('people', filter=Q(reply='yes'), default=0),
        **{key: Count('id', filter=where) for key, _, where in STAGES},
    )


@couple_only
def overview(request):
    counts = _counts(Guest.objects.all())
    waiting = counts['sent'] + counts['opened']

    def invitations(n):
        return f'{n} invitation{"s" * (n != 1)}'

    # Each part of the list: its number, what it is, and its share of the invitations, which sets
    # its length on the home page's champagne rule.
    tiles = [
        {'key': 'coming', 'value': counts['people'], 'share': counts['coming'],
         'label': 'person coming' if counts['people'] == 1 else 'people coming',
         'note': f'from {invitations(counts["coming"])}'},
        {'key': 'declined', 'value': counts['declined'], 'share': counts['declined'], 'label': "can't come",
         'note': f'{invitations(counts["declined"])} said no'},
        {'key': 'waiting', 'value': waiting, 'share': waiting, 'label': 'waiting for a reply',
         'note': f'{counts["sent"]} not opened yet' if counts['sent'] else 'all of them opened it'},
        {'key': 'unsent', 'value': counts['unsent'], 'share': counts['unsent'], 'label': 'not sent yet',
         'note': 'send these first' if counts['unsent'] else 'everyone has theirs'},
    ]

    sides, reply_to = [], ReplyTo.current()
    for key, label in SIDES + [('', 'No side set')]:
        row = _counts(Guest.objects.filter(side=key))
        if key or row['invited']:
            sides.append({'key': key, 'label': label, **row, 'waiting': row['unsent'] + row['sent'] + row['opened'],
                          'reply_to': reply_to.for_side(key)})

    return render(request, 'couple/overview.html', {
        'section': 'overview',
        'counts': counts,
        'tiles': tiles,
        'sides': sides,
        'needs': [
            {'key': 'unsent', 'label': 'Send their invitation', 'total': counts['unsent'],
             'guests': Guest.objects.filter(STAGE['unsent'][1]).order_by('name')[:6]},
            {'key': 'waiting', 'label': 'Remind them', 'total': waiting,
             'guests': Guest.objects.filter(WAITING).order_by('sent_at')[:6]},
        ],
        'latest': Guest.objects.exclude(reply='').order_by('-replied_at')[:8],
        'days': (WEDDING - timezone.localdate()).days,
        'replies_close': settings.RSVP_CLOSES,
    })


@couple_only
def guest_list(request):
    show, side, query = request.GET.get('show', ''), request.GET.get('side', ''), request.GET.get('q', '').strip()
    guests = Guest.objects.all()
    if side in dict(SIDES):
        guests = guests.filter(side=side)
    if query:
        found = (Q(name__icontains=query) | Q(name_si__icontains=query) | Q(phone__icontains=query)
                 | Q(notes__icontains=query) | Q(code__iexact=query))
        # Numbers are kept as 94771234567, but people type 077 123 4567 or the last few digits.
        digits = ''.join(c for c in query if c.isdigit()).lstrip('0')
        if len(digits) >= 3:
            found |= Q(phone__contains=digits)
        guests = guests.filter(found)
    # The tabs count within the search and the side, so they always add up to what "All" shows.
    counts = _counts(guests)
    counts['waiting'] = counts['sent'] + counts['opened']
    if show in SHOWS:
        guests = guests.filter(SHOWS[show])
    tabs = [{'key': '', 'label': 'Everyone', 'count': counts['invited']}] + [
        {'key': key, 'label': label, 'count': counts[key]} for key, label in TABS]
    return render(request, 'couple/guests.html', {
        'section': 'guests', 'guests': guests.order_by('name'), 'tabs': tabs, 'show': show if show in SHOWS else '',
        # ?show=sent or ?show=opened (from the home page) has no tab of its own, so the page says it.
        'show_label': STAGE[show][0] if show in ('sent', 'opened') else '',
        'side': side if side in dict(SIDES) else '', 'sides': SIDES, 'query': query, 'counts': counts,
    })


class GuestForm(forms.ModelForm):
    class Meta:
        model = Guest
        fields = ['name', 'name_si', 'phone', 'seats', 'side', 'notes']
        labels = {'name': 'Name on the invitation', 'name_si': 'Name in Sinhala', 'phone': 'WhatsApp number',
                  'seats': 'Seats kept for them', 'side': 'Side', 'notes': 'Notes'}
        help_texts = {'name': 'How the invitation greets them: "Nimal", "Sunil & Kamala", "The Perera family".',
                      'name_si': 'Shown when they read it in Sinhala. Left empty, the name above is used.',
                      'phone': 'Any way it is written: 077 123 4567, +94 77 123 4567.',
                      'seats': '', 'notes': 'Only for the two of you. Guests never see this.'}
        widgets = {'notes': forms.Textarea(attrs={'rows': 3}), 'seats': forms.NumberInput(attrs={'min': 1, 'max': 50})}


@couple_only
def guest_new(request):
    form = GuestForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        guest = form.save()
        messages.success(request, f'{guest.name} is on the list. Their link is ready to send.')
        return redirect('couple:guest', guest.pk)
    return render(request, 'couple/guest.html', {'section': 'guests', 'form': form, 'guest': None})


@couple_only
def guest_page(request, pk):
    guest = get_object_or_404(Guest, pk=pk)
    form = GuestForm(request.POST or None, instance=guest)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Saved.')
        return redirect('couple:guest', guest.pk)
    return render(request, 'couple/guest.html', {'section': 'guests', 'form': form, 'guest': guest,
                                                 'link': link_of(request, guest), 'stage': STAGE[guest.stage][0],
                                                 'seat_choices': range(1, guest.seats + 1)})


@require_POST
@couple_only
def guest_fix(request, pk):
    """Putting a guest right by hand: a reply given by phone or in person, a reply to undo so they
    can answer again, or a send that did or did not really happen."""
    guest = get_object_or_404(Guest, pk=pk)
    do, now = request.POST.get('do'), timezone.now()
    if do == 'coming':
        try:
            people = int(request.POST.get('people') or 0)
        except ValueError:
            people = 0
        if not 1 <= people <= guest.seats:
            messages.error(request, f'Choose how many are coming, from 1 to {guest.seats}. '
                                    'For more than that, change "Seats kept for them" first.')
            return redirect('couple:guest', guest.pk)
        guest.reply, guest.people, guest.replied_at = 'yes', people, now
        done = f'Saved: {guest.name}, coming, {people} of {guest.seats}.'
    elif do == 'not-coming':
        guest.reply, guest.people, guest.replied_at = 'no', 0, now
        done = f"Saved: {guest.name}, can't come."
    elif do == 'clear':
        guest.reply, guest.people, guest.message, guest.reply_language, guest.replied_at = '', 0, '', '', None
        done = f'The reply for {guest.name} is cleared. They can answer again on their link.'
    elif do == 'sent':
        guest.sent_at = guest.sent_at or now
        done = f'Marked as sent to {guest.name}.'
    elif do == 'unsent':
        guest.sent_at = guest.reminded_at = None
        done = f'Marked as not sent to {guest.name}.'
    else:
        messages.error(request, 'Nothing was changed. Please try again.')
        return redirect('couple:guest', guest.pk)
    guest.save(update_fields=['reply', 'people', 'message', 'reply_language', 'replied_at', 'sent_at', 'reminded_at'])
    messages.success(request, done)
    return redirect('couple:guest', guest.pk)


@couple_only
def help_page(request):
    return render(request, 'couple/help.html', {'section': 'help', 'replies_close': settings.RSVP_CLOSES})


@require_POST
@couple_only
def guest_delete(request, pk):
    guest = get_object_or_404(Guest, pk=pk)
    guest.delete()
    messages.success(request, f'{guest.name} was taken off the list. Their link no longer opens their invitation.')
    return redirect('couple:guests')


@require_POST
@couple_only
def send(request, pk):
    """WhatsApp, on a chat with the guest, with their invitation (or a reminder) written."""
    guest = get_object_or_404(Guest, pk=pk)
    if not guest.phone:
        messages.error(request, f'{guest.name} has no WhatsApp number yet. Add it here first.')
        return redirect('couple:guest', guest.pk)
    reminder = request.POST.get('kind') == 'reminder'
    now = timezone.now()
    if reminder:
        guest.reminded_at = now
    elif guest.sent_at is None:
        guest.sent_at = now
    guest.save(update_fields=['reminded_at', 'sent_at'])
    return redirect(whatsapp.chat_url(guest, link_of(request, guest), reminder))


@couple_only
def import_sheet(request):
    context = {'section': 'import'}
    if request.method == 'POST' and 'confirm' in request.POST:
        rows = request.session.pop('guest_import', None)
        if not rows:
            messages.error(request, 'Nothing was waiting to be added. Please choose the sheet again.')
            return redirect('couple:import')
        added, updated = spreadsheet.apply(rows)
        messages.success(request, f'{added} guest{"s" * (added != 1)} added and {updated} updated.')
        return redirect('couple:guests')
    if request.method == 'POST':
        upload = request.FILES.get('sheet')
        if upload is None:
            context['error'] = 'Choose an Excel file first.'
        elif upload.size > 4 * 1024 * 1024:  # Vercel turns away anything over 4.5 MB
            context['error'] = 'That file is larger than 4 MB, far more than a guest list needs. Is it the right one?'
        else:
            try:
                rows, used = spreadsheet.read(upload)
            except ValueError as error:
                context['error'] = str(error)
            else:
                if not rows:
                    context['error'] = 'The sheet has a Name column but no names under it.'
                else:
                    request.session['guest_import'] = rows
                    context.update(preview=True, rows=rows, used=used, file_name=upload.name,
                                   adding=sum(row['action'] == 'add' for row in rows),
                                   updating=sum(row['action'] == 'update' for row in rows),
                                   skipping=sum(row['action'] == 'skip' for row in rows))
    return render(request, 'couple/import.html', context)


def _download(content, name):
    response = HttpResponse(content, content_type=XLSX)
    response['Content-Disposition'] = f'attachment; filename="{name}"'
    return response


@couple_only
def blank_sheet(request):
    return _download(spreadsheet.blank(), 'guest-list.xlsx')


@couple_only
def export_sheet(request):
    sheet = spreadsheet.write(Guest.objects.all(), lambda guest: link_of(request, guest))
    return _download(sheet, f'guests-{timezone.localdate():%Y-%m-%d}.xlsx')


class ReplyToForm(forms.ModelForm):
    class Meta:
        model = ReplyTo
        fields = ['bride', 'groom', 'everyone']
        labels = {'bride': "Bride's side replies go to", 'groom': "Groom's side replies go to",
                  'everyone': 'Everyone else'}
        help_texts = {'bride': "Dulanjani's WhatsApp, or whoever looks after the bride's side. Left empty, they go to the main number.",
                      'groom': "Naveen's WhatsApp, or whoever looks after the groom's side. Left empty, they go to the main number.",
                      'everyone': 'For guests with no side set, and for a side left empty above.'}
        widgets = {field: forms.TextInput(attrs={'inputmode': 'tel', 'autocomplete': 'off', 'placeholder': '077 123 4567'})
                   for field in ('bride', 'groom', 'everyone')}
        error_messages = {'everyone': {'required': 'Keep a main number, so a reply always has somewhere to go.'}}


@couple_only
def reply_numbers(request):
    """Whose WhatsApp each guest's reply opens addressed to."""
    form = ReplyToForm(request.POST or None, instance=ReplyTo.current())
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Saved. Replies from now on go to these numbers.')
        return redirect('couple:numbers')
    return render(request, 'couple/numbers.html', {'section': 'numbers', 'form': form})
