"""The WhatsApp messages each guest is sent with their link: the invitation, and a reminder.

On 10 November 2026 the couple asked for the message to say nothing but whose wedding it is: with the
date and place written out, a guest has no reason to open the link, and the link is where they see
their invitation and reply. The reminder says the same. {link} is the guest's own invitation.
"""
from urllib.parse import quote

INVITATION = (
    'The Wedding of Naveen & Dulanjani\n'
    '\n'
    '{link}'
)

REMINDER = INVITATION


def message(guest, link, reminder=False):
    return (REMINDER if reminder else INVITATION).format(name=guest.name, link=link)


def chat_url(guest, link, reminder=False):
    """WhatsApp, open on a chat with the guest and the message already written.

    api.whatsapp.com rather than the shorter wa.me: wa.me redirects there, and on the way it replaces
    every emoji with a "?" box, so the guest received the message without a single one of them.
    """
    return f'https://api.whatsapp.com/send?phone={guest.phone}&text={quote(message(guest, link, reminder))}'
