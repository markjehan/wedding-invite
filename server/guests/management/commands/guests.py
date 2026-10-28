from django.core.management.base import BaseCommand
from django.utils import timezone

from guests.models import Guest


class Command(BaseCommand):
    help = 'List every guest with their link, whether they have opened it, and their reply.'

    def add_arguments(self, parser):
        parser.add_argument('--site', default='http://127.0.0.1:8000', help='The address the links start with.')

    def handle(self, *args, site, **options):
        guests = list(Guest.objects.all())
        if not guests:
            self.stdout.write('No guests yet. Add one with: python manage.py add_guest "Name"')
            return
        for guest in guests:
            opened = timezone.localtime(guest.first_opened_at).strftime('%d %b %H:%M') if guest.first_opened_at else 'not opened'
            answer = guest.get_reply_display() + (f', {guest.people} of {guest.seats}' if guest.reply == 'yes' else '')
            self.stdout.write(f'{guest.name:<28} {site.rstrip("/")}/{guest.code}   {opened:<12}  {answer}')
            if guest.message:
                self.stdout.write(f'{"":<28} "{guest.message}"')
        coming = sum(guest.people for guest in guests if guest.reply == 'yes')
        waiting = sum(1 for guest in guests if not guest.reply)
        self.stdout.write(f'\n{len(guests)} invitations, {coming} people coming, {waiting} not replied yet')
