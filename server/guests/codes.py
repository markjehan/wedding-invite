"""The code at the end of each guest's link: yourdomain.com/k7m2p9qa.

Eight characters from 31, with 0, 1, i, l and o left out so a code read aloud or typed from a
screenshot cannot be mistaken. That is about 850 billion possible codes for a few hundred guests,
so one guest's link gives no way to find another's.
"""
import secrets

ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'
LENGTH = 8
# For the URL patterns. Capitals are accepted and read as lower case.
PATTERN = f'[{ALPHABET}{ALPHABET[8:].upper()}]{{{LENGTH}}}'


def new_code():
    return ''.join(secrets.choice(ALPHABET) for _ in range(LENGTH))
