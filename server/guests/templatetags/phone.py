"""A phone number as people read it: +94 77 128 1561 rather than 94771281561."""
from django import template

register = template.Library()


@register.filter
def phone(value):
    digits = str(value or '')
    if not digits.isdigit():
        return digits
    if len(digits) == 11 and digits.startswith('94'):
        return f'+94 {digits[2:4]} {digits[4:7]} {digits[7:]}'
    return f'+{digits}'
