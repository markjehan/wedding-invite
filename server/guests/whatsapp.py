"""The WhatsApp messages each guest is sent with their link: the invitation, and a reminder.

They are written in English, as the couple asked on 30 October 2026. The invitation itself still opens
on its language page, where every guest chooses English or Sinhala for themselves. Change the wording
here; {name} is the name the invitation greets them by.
"""
from urllib.parse import quote

INVITATION = (
    '💌 Dear {name},\n'
    '\n'
    'With joy in our hearts, we would love you to be part of the most special day of our lives. '
    'Please join us as we begin our forever together. 💍✨\n'
    '\n'
    '📅 Monday, 7 December 2026\n'
    '📍 Avenra Gardens, Negombo\n'
    '\n'
    'Your own invitation is waiting for you here 👇\n'
    '{link}\n'
    '\n'
    'Open it to see all the details, and let us know if you can come. '
    'Having you there would mean the world to us. 🤍\n'
    '\n'
    'With love,\n'
    'Naveen & Dulanjani 🌸'
)

REMINDER = (
    '🌸 Dear {name},\n'
    '\n'
    'A gentle reminder from Naveen & Dulanjani: we would love to know whether you can celebrate '
    'with us on Monday, 7 December 2026. 💍\n'
    '\n'
    'It only takes a moment to reply on your invitation 👇\n'
    '{link}\n'
    '\n'
    'We truly hope to see you there. 🤍\n'
    'Naveen & Dulanjani'
)


def message(guest, link, reminder=False):
    return (REMINDER if reminder else INVITATION).format(name=guest.name, link=link)


def chat_url(guest, link, reminder=False):
    """WhatsApp, open on a chat with the guest and the message already written."""
    return f'https://wa.me/{guest.phone}?text={quote(message(guest, link, reminder))}'
