from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from guests.models import Guest

MARK = 'Made-up guest for testing.'
# Twelve made-up guests, one or more at every step: not sent, sent but not opened, opened but not
# replied, coming, not coming; with and without Sinhala names, one without a number. Days are
# counted back from today. The phone numbers are not real.
DEMO = [
    dict(name='Nimal', name_si='නිමල්', seats=1, side='groom', phone='94770000001'),
    dict(name='Ruwan', seats=1, side='bride', phone='94770000002'),
    dict(name='Chamath', name_si='චමත්', seats=1, side='groom'),
    dict(name='Amali & Kasun', name_si='අමාලි සහ කසුන්', seats=2, side='bride', phone='94770000003', sent=2),
    dict(name='Tharushi', name_si='තරුෂි', seats=1, side='bride', phone='94770000004', sent=6, reminded=1),
    dict(name='The Jayasinghe family', name_si='ජයසිංහ පවුල', seats=4, side='groom', phone='94770000005', sent=5, opened=4, times=3),
    dict(name="Naveen's office team", seats=6, side='groom', phone='94770000006', sent=4, opened=3),
    dict(name='Sunil & Kamala', name_si='සුනිල් සහ කමලා', seats=2, side='bride', phone='94770000007', sent=6, opened=6,
         reply='yes', people=2, message="We wouldn't miss it for the world!", replied=5),
    dict(name='Dilshan', name_si='දිල්ශාන්', seats=1, side='groom', phone='94770000008', sent=5, opened=5,
         reply='yes', people=1, message='Congratulations to you both. See you there!', replied=4),
    dict(name='Priyanka', seats=2, side='bride', phone='94770000009', sent=5, opened=4, reply='yes', people=1, replied=3),
    dict(name='Malini Aunty', name_si='මාලිනී නැන්දා', seats=3, side='bride', phone='94770000010', sent=6, opened=5,
         reply='yes', people=3, message='ඔබ දෙදෙනාට සුබ පැතුම්!', language='si', replied=1),
    dict(name='Uncle Bandara', name_si='බණ්ඩාර මාමා', seats=2, side='groom', phone='94770000011', sent=6, opened=6,
         reply='no', message="So sorry, we'll be abroad. Wishing you both every happiness.", replied=2),
]


class Command(BaseCommand):
    help = 'Add twelve made-up guests at every step to try the pages with, or take them out again with --remove.'

    def add_arguments(self, parser):
        parser.add_argument('--remove', action='store_true')
        parser.add_argument('--site', default='http://127.0.0.1:8000', help='The address the links start with.')

    def handle(self, *args, remove, site, **options):
        if remove:
            count, _ = Guest.objects.filter(notes=MARK).delete()
            self.stdout.write(f'Removed {count} made-up guests.')
            return
        now = timezone.now()
        ago = lambda days: now - timedelta(days=days, hours=days * 3 % 7) if days is not None else None
        for fields in DEMO:
            fields = dict(fields)
            sent, reminded, opened, replied = (fields.pop(key, None) for key in ('sent', 'reminded', 'opened', 'replied'))
            times, language = fields.pop('times', 1 if opened is not None else 0), fields.pop('language', 'en' if replied is not None else '')
            guest = Guest.objects.create(
                notes=MARK, sent_at=ago(sent), reminded_at=ago(reminded), first_opened_at=ago(opened),
                last_opened_at=ago(opened), times_opened=times, replied_at=ago(replied), reply_language=language, **fields)
            self.stdout.write(f'{guest.name:<24} {site.rstrip("/")}/{guest.code}')
