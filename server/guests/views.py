import json

from django.conf import settings
from django.core.handlers.wsgi import get_str_from_wsgi
from django.db import DatabaseError
from django.db.models import F
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_safe

from . import names, site
from .models import Guest, ReplyTo


def _page(request, data, status=200):
    base = settings.SITE_URL or request.build_absolute_uri('/').rstrip('/')
    response = HttpResponse(site.page(data, base), status=status)
    # A personal page carries the guest's name and reply: never kept by a browser or a proxy, never
    # listed by a search engine.
    response['Cache-Control'] = 'no-store'
    response['X-Robots-Tag'] = 'noindex, nofollow'
    return response


def _replies_open():
    return settings.RSVP_CLOSES is None or timezone.now() <= settings.RSVP_CLOSES


def _reply_of(guest):
    return {'reply': guest.reply, 'people': guest.people, 'message': guest.message}


@require_safe
def general(request):
    """The invitation without a name: everything to read, nothing to reply with.

    With a name in the link instead (/?name=Chamini) that is on the guest list, it is their own
    invitation, the same as their code link (see names.py). A name that is not on the list is still
    greeted, and their reply opens in WhatsApp, written to the couple, but nothing is saved.
    """
    # Read as UTF-8, as Django reads its own form data, so a Sinhala name typed straight into a link works.
    name = names.from_query(get_str_from_wsgi(request.environ, 'QUERY_STRING', ''))
    if not name:
        return _page(request, {'mode': 'general'})
    # If the guest list cannot be reached (the free database asleep, full or down), the guest still
    # gets the invitation with their name on it, and their reply goes by WhatsApp.
    try:
        guest = names.find(name)
        if guest:
            return _guest_page(request, guest)
    except DatabaseError:
        pass
    return _page(request, {'mode': 'named', 'name': name})


@require_safe
def personal(request, code):
    try:
        guest = Guest.objects.filter(code=code.lower()).first()
        # A mistyped or retired link still shows the invitation, just not anyone's details.
        if guest is None:
            return _page(request, {'mode': 'general'}, status=404)
        return _guest_page(request, guest)
    except DatabaseError:
        # The guest list cannot be reached: the invitation itself must still open.
        return _page(request, {'mode': 'general'})


def _guest_page(request, guest):
    return _page(request, {
        'mode': 'guest',
        'code': guest.code,
        'name': guest.name,
        'nameSi': guest.name_si,
        'seats': guest.seats,
        'open': _replies_open(),
        # Their reply opens in WhatsApp addressed to their side: the bride's number or the groom's.
        'whatsapp': ReplyTo.current().for_side(guest.side),
        **_reply_of(guest),
    })


# The guest's code in the address is what lets them in; there is no login and no cookie to borrow,
# which is what Django's CSRF check guards. Asking for JSON keeps another site's plain form from
# posting here.
@csrf_exempt
@require_POST
def reply(request, code):
    guest = Guest.objects.filter(code=code.lower()).first()
    if guest is None:
        raise Http404
    if request.content_type != 'application/json':
        return JsonResponse({'error': 'json'}, status=415)
    if not _replies_open():
        return JsonResponse({'error': 'closed'}, status=403)
    try:
        sent = json.loads(request.body)
        answer = sent['attendance']
        note = str(sent.get('note') or '').strip()
        language = sent.get('lang')
    except (ValueError, TypeError, KeyError, AttributeError):
        return JsonResponse({'error': 'unreadable'}, status=400)
    if answer not in {'yes', 'no'} or len(note) > 1000:
        return JsonResponse({'error': 'invalid'}, status=400)
    guest.reply = answer
    # A guest who accepts takes the seats kept for them. They cannot choose a number: whatever their
    # page sends is ignored, and only the couple change seats or how many are coming, on their pages.
    guest.people = guest.seats if answer == 'yes' else 0
    guest.message = note
    guest.reply_language = language if language in {'en', 'si'} else ''
    guest.replied_at = timezone.now()
    guest.save(update_fields=['reply', 'people', 'message', 'reply_language', 'replied_at'])
    return JsonResponse(_reply_of(guest))


@csrf_exempt
@require_POST
def opened(request, code):
    # The couple looking at a guest's page from the admin pages is not the guest opening it.
    if request.user.is_authenticated:
        return HttpResponse(status=204)
    now = timezone.now()
    found = Guest.objects.filter(code=code.lower())
    found.filter(first_opened_at__isnull=True).update(first_opened_at=now)
    found.update(last_opened_at=now, times_opened=F('times_opened') + 1)
    return HttpResponse(status=204)


@require_safe
def site_file(request, name):
    path = site.public_file(name)
    if path is None:
        raise Http404
    response = FileResponse(path.open('rb'), content_type=site.content_type(path))
    # Artwork, fonts and music are large and rarely change; the page's own code changes while the
    # invitation is still being made, so a guest asked to look again sees the current version.
    response['Cache-Control'] = 'public, max-age=86400' if name.startswith('assets/') else 'no-cache'
    # Vercel's own cache (other servers ignore this header) keeps every file until the next deploy,
    # which starts with an empty one, so the 90 MB of artwork and music is not sent through Python
    # for every guest.
    response['Vercel-CDN-Cache-Control'] = 'max-age=31536000'
    response['X-Robots-Tag'] = 'noindex, nofollow'
    return response
