from allauth.mfa.models import Authenticator
from allauth.mfa.utils import is_mfa_enabled
from django.conf import settings
from django.shortcuts import redirect


def has_two_step(user):
    return is_mfa_enabled(user, [Authenticator.Type.TOTP])


class RequireTwoStep:
    """Nobody reaches the admin pages on a password alone.

    An account without an authenticator app is sent to add one first. Once it has one, signing in
    asks for the app's code as well as the password, so every visit to the guest list has taken both.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/') and request.user.is_authenticated and not has_two_step(request.user):
            return redirect('mfa_activate_totp')
        return self.get_response(request)


class MainAddress:
    """A visit to this deployment's own Vercel address goes on to the project's main address.

    Once a newer version is published, this one's own address still answers with this version, frozen.
    Sending its visitors to the main address means that, from now on, an old bookmark or an old link
    lands on whatever is newest.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        own, main = settings.VERCEL_OWN_HOST, settings.VERCEL_MAIN_HOST
        if own and main and own != main and request.get_host().split(':')[0] == own:
            return redirect(f'https://{main}{request.get_full_path()}')
        return self.get_response(request)
