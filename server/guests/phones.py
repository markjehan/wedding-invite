"""Phone numbers as WhatsApp wants them: the country code and the number, digits only, no leading 0.

Numbers are typed every way there is, so the common Sri Lankan forms are all accepted:
077 128 1561, 0771281561, 771281561, +94 77 128 1561, 0094771281561, and the +94 077... slip.
"""
import re


def normalise_phone(value):
    """The number in WhatsApp's form, '' for an empty one, or ValueError if it cannot be a number."""
    value = (value or '').strip()
    if not value:
        return ''
    if re.search(r'[^\d\s+().-]', value):
        raise ValueError(value)
    digits = re.sub(r'\D', '', value)
    if value.startswith('00'):
        digits = digits[2:]
    elif not value.startswith('+'):
        if len(digits) == 10 and digits.startswith('0'):
            digits = '94' + digits[1:]
        elif len(digits) == 9 and digits.startswith('7'):
            digits = '94' + digits
    if len(digits) == 12 and digits.startswith('940'):
        digits = '94' + digits[3:]
    if not 10 <= len(digits) <= 15 or digits.startswith('0'):
        raise ValueError(value)
    return digits
