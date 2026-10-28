from allauth.mfa.models import Authenticator
from allauth.mfa.utils import is_mfa_enabled
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
