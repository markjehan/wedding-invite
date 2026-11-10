from allauth.mfa.models import Authenticator
from allauth.mfa.utils import is_mfa_enabled
from django.conf import settings
from django.http import HttpResponsePermanentRedirect
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


class MovedForGood(HttpResponsePermanentRedirect):
    """A permanent move that keeps a form being sent as a form (301 would turn it into a plain visit)."""
    status_code = 308


class MainAddress:
    """Every page opens only on the site's own domain.

    On the live site, a visit to any other address Vercel answers to (the .vercel.app names, old and
    new, and each deployment's own frozen one) goes to the same page on settings.SITE_HOST, securely.
    An old bookmark or link therefore always lands on the real domain and the newest version.

    Elsewhere (a preview deployment), a visit to the deployment's own address goes to the project's
    main address, as before.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0].lower()
        if settings.SITE_HOST:
            if host != settings.SITE_HOST:
                return MovedForGood(f'https://{settings.SITE_HOST}{request.get_full_path()}')
            return self.get_response(request)
        own, main = settings.VERCEL_OWN_HOST, settings.VERCEL_MAIN_HOST
        if own and main and own != main and host == own:
            return redirect(f'https://{main}{request.get_full_path()}')
        return self.get_response(request)
