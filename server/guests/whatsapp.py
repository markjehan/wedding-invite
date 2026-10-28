"""The WhatsApp messages each guest is sent with their link: the invitation, and a reminder.

Both are written in both languages because the guest chooses theirs on the invitation's first page;
a message never chooses for them. Change the wording here.
"""
from urllib.parse import quote

INVITATION = (
    'Dear {name},\n'
    'Naveen & Dulanjani warmly invite you to their wedding on Friday, 4 December 2026, '
    'at Avenra Gardens, Negombo.\n'
    '\n'
    'ආදරණීය {name_si},\n'
    'නවීන් සහ දුලාංජනී, 2026 දෙසැම්බර් 4 වන සිකුරාදා මීගමුව ඇවන්රා ගාඩන්ස් හිදී පැවැත්වෙන '
    'සිය විවාහ මංගල්‍යයට ඔබට සාදරයෙන් ආරාධනා කරති.\n'
    '\n'
    'Your invitation · ඔබගේ ආරාධනාව:\n'
    '{link}'
)

REMINDER = (
    'Dear {name},\n'
    'A gentle reminder: Naveen & Dulanjani would love to know whether you can join them '
    'on Friday, 4 December 2026. You can reply on your invitation.\n'
    '\n'
    'ආදරණීය {name_si},\n'
    'නවීන් සහ දුලාංජනී, 2026 දෙසැම්බර් 4 වන සිකුරාදා සිය විවාහ මංගල්‍යයට ඔබට සහභාගී විය '
    'හැකිදැයි දැන ගැනීමට කැමැත්තෙන් සිටිති. ඔබගේ ආරාධනාවේ පිළිතුර යැවිය හැක.\n'
    '\n'
    'Your invitation · ඔබගේ ආරාධනාව:\n'
    '{link}'
)


def message(guest, link, reminder=False):
    return (REMINDER if reminder else INVITATION).format(name=guest.name, name_si=guest.name_si or guest.name, link=link)


def chat_url(guest, link, reminder=False):
    """WhatsApp, open on a chat with the guest and the message already written."""
    return f'https://wa.me/{guest.phone}?text={quote(message(guest, link, reminder))}'
