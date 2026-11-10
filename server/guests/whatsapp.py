"""The WhatsApp messages each guest is sent with their link: the invitation, and a reminder.

On 10 November 2026 the couple asked for the message to say nothing but whose wedding it is: with the
date and place written out, a guest has no reason to open the link, and the link is where they see
their invitation and reply. On 11 November 2026 the couple gave the final wording below, greeting each
guest by the name on their invitation. The reminder says the same. {link} is the guest's own invitation.
"""
from urllib.parse import quote

INVITATION = (
    'Dear {name},\n'
    '\n'
    'With joyful hearts, we invite you to celebrate one of the most cherished moments of our lives '
    'as we begin our forever together. ✨💍\n'
    '\n'
    'Your personal invitation is waiting for you below. We would be delighted for you to open it, '
    "explore all the details, and let us know if you'll be joining us on our special day.\n"
    '\n'
    'Your invitation 👇\n'
    '{link}\n'
    '\n'
    'Your presence would mean more to us than words can express. 🤍\n'
    '\n'
    'With love and excitement,\n'
    'Naveen & Dulanjani 🌸'
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
