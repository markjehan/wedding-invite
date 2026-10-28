from django.core.exceptions import ValidationError
from django.db import IntegrityError, models, transaction

from .codes import new_code
from .phones import normalise_phone


class Guest(models.Model):
    """One invitation: a person, a couple or a family, with the seats kept for them and their reply."""

    REPLIES = [('', 'No reply yet'), ('yes', 'Coming'), ('no', 'Not coming')]
    SIDES = [('', '—'), ('bride', "Bride's side"), ('groom', "Groom's side")]

    code = models.CharField(max_length=8, unique=True, editable=False)
    name = models.CharField(max_length=100, help_text='As the invitation greets them, e.g. "Nimal" or "Sunil & Kamala".')
    name_si = models.CharField('name in Sinhala', max_length=100, blank=True,
                               help_text='Used when they read the invitation in Sinhala. Left empty, the English name is used.')
    phone = models.CharField(max_length=20, blank=True, help_text='With the country code and no leading 0, e.g. 94771234567.')
    seats = models.PositiveSmallIntegerField(default=1)
    side = models.CharField(max_length=5, choices=SIDES, blank=True)
    notes = models.TextField(blank=True, help_text='Only for you. Guests never see this.')
    created_at = models.DateTimeField(auto_now_add=True)
    # When their invitation was first sent from the admin pages, and when they were last reminded.
    sent_at = models.DateTimeField(null=True, blank=True)
    reminded_at = models.DateTimeField(null=True, blank=True)

    # Filled in by the invitation itself. "Opened" is reported by the page once it is open in a
    # browser, not when the link is fetched, so a WhatsApp link preview does not count as opening it.
    first_opened_at = models.DateTimeField(null=True, blank=True)
    last_opened_at = models.DateTimeField(null=True, blank=True)
    times_opened = models.PositiveIntegerField(default=0)

    reply = models.CharField(max_length=3, choices=REPLIES, blank=True)
    people = models.PositiveSmallIntegerField(default=0, help_text='How many of their seats they will use.')
    message = models.TextField(blank=True)
    reply_language = models.CharField(max_length=2, blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    # Where each guest is on the way from being added to replying. Every guest is in exactly one;
    # dashboard.STAGES holds the same five as database filters.
    @property
    def stage(self):
        if self.reply == 'yes':
            return 'coming'
        if self.reply == 'no':
            return 'declined'
        if self.first_opened_at:
            return 'opened'
        return 'sent' if self.sent_at else 'unsent'

    def clean(self):
        try:
            self.phone = normalise_phone(self.phone)
        except ValueError:
            raise ValidationError({'phone': 'This does not look like a phone number. Try 0771234567 or +94 77 123 4567.'})
        if self.seats < 1:
            raise ValidationError({'seats': 'Keep at least one seat.'})

    def save(self, *args, **kwargs):
        if self.code:
            return super().save(*args, **kwargs)
        # Two guests drawing the same code is vanishingly unlikely; if it happens, draw again.
        for _ in range(5):
            self.code = new_code()
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                continue
        raise IntegrityError('Could not find a free guest code.')
