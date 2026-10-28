from allauth.mfa.models import Authenticator
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = ("Turn off someone's two-step sign-in when they have lost their phone and their backup codes. "
            'They set it up again, with a new QR code, the next time they sign in.')

    def add_arguments(self, parser):
        parser.add_argument('username')

    def handle(self, *args, username, **options):
        user = User.objects.filter(username=username).first()
        if user is None:
            raise CommandError(f'There is no account called "{username}".')
        Authenticator.objects.filter(user=user).delete()
        self.stdout.write(f'Two-step sign-in is off for {username}. They will set it up again when they next sign in.')
