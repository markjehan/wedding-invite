from allauth.account.adapter import DefaultAccountAdapter


class ClosedAccountAdapter(DefaultAccountAdapter):
    """Admin accounts are made on the server with `manage.py createsuperuser`. Nobody signs up."""

    def is_open_for_signup(self, request):
        return False
