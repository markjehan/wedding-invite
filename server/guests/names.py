"""Guests found by the name in their link: yoursite/?name=Sunil+and+Kamala.

The link carries the name rather than the guest's code, and the server looks the name up in the guest
list. Found, the page is that guest's own invitation, exactly as their code link gives it: their seats,
their side's WhatsApp number, their saved reply, and "opened" when they open it. Names are compared
loosely - small or capital letters, "&" or "and", stray full stops and spaces are all the same - so a
link typed by hand still finds them.

Two guests whose names read the same cannot both be found this way, so each of them is sent their code
link instead (see paths), and a name link that matches both shows the invitation without anyone's
details.
"""
import re
from collections import Counter
from urllib.parse import quote_plus, unquote_plus

from .models import Guest


def key(name):
    """A name as compared: small letters, & read as "and", full stops and commas ignored, single spaces."""
    return ' '.join(re.sub(r'[.,]', ' ', (name or '').casefold().replace('&', ' and ')).split())


def _keys(guest):
    return {key(guest.name), key(guest.name_si)} - {''}


def from_query(query):
    """The name in a link's query string, as written, or ''.

    A name with a bare & in it - typed by hand as ?name=Sunil+&+Kamala - arrives cut in two, because & is
    what separates one setting from the next in a link. The pieces after it that are not settings of
    their own (they have no =) are put back, so the guest is still Sunil & Kamala.
    """
    pairs = query.split('&')
    for at, pair in enumerate(pairs):
        field, _, value = pair.partition('=')
        if field in ('name', 'guest'):
            pieces = [value]
            for rest in pairs[at + 1:]:
                if '=' in rest:
                    break
                pieces.append(rest)
            return ' '.join(unquote_plus('&'.join(pieces)).split())[:100]
    return ''


def find(name):
    """The one guest this name belongs to, or None when it is no one's or more than one guest's."""
    wanted = key(name)
    if not wanted:
        return None
    found = [guest.pk for guest in Guest.objects.only('pk', 'name', 'name_si') if wanted in _keys(guest)]
    return Guest.objects.get(pk=found[0]) if len(found) == 1 else None


def paths():
    """Each guest's link after the site's address: /?name=Their+Name, or /<code> when another guest's
    name reads the same, since a name link could not tell the two apart."""
    shared = Counter()
    for guest in Guest.objects.only('name', 'name_si'):
        shared.update(_keys(guest))

    def path(guest):
        if any(shared[k] > 1 for k in _keys(guest)):
            return f'/{guest.code}'
        # "&" is written as "and": a bare & would cut the link short, and %26 is unreadable in a chat.
        return '/?name=' + quote_plus(' '.join(guest.name.replace('&', ' and ').split()))
    return path
