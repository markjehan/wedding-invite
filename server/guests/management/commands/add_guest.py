from django.core.management.base import BaseCommand

from guests.models import Guest


class Command(BaseCommand):
    help = 'Add a guest and print their personal link.'

    def add_arguments(self, parser):
        parser.add_argument('name', help='As the invitation greets them, e.g. "Nimal" or "Sunil & Kamala".')
        parser.add_argument('--si', default='', help='Their name in Sinhala.')
        parser.add_argument('--seats', type=int, default=1)
        parser.add_argument('--phone', default='', help='With the country code and no leading 0, e.g. 94771234567.')
        parser.add_argument('--side', choices=['bride', 'groom'], default='')
        parser.add_argument('--site', default='http://127.0.0.1:8000', help='The address the link starts with.')

    def handle(self, *args, name, si, seats, phone, side, site, **options):
        guest = Guest.objects.create(name=name, name_si=si, seats=max(1, seats), phone=phone, side=side)
        self.stdout.write(f'{guest.name}: {site.rstrip("/")}/{guest.code}')
