import json
from pathlib import Path
import re
from datetime import timedelta

from django.conf import settings
from django.test import TestCase, override_settings
from django.utils import timezone

from .codes import ALPHABET, LENGTH, new_code
from .models import Guest, ReplyTo


def invite_data(response):
    found = re.search(r'<script id="invite-data" type="application/json">(.*?)</script>', response.content.decode())
    return json.loads(found.group(1))


class CodeTests(TestCase):
    def test_codes_avoid_look_alike_characters(self):
        for _ in range(200):
            code = new_code()
            self.assertEqual(len(code), LENGTH)
            self.assertTrue(set(code) <= set(ALPHABET))
        self.assertFalse(set('01ilo') & set(ALPHABET))

    def test_every_guest_gets_their_own_code(self):
        codes = {Guest.objects.create(name=f'Guest {n}').code for n in range(50)}
        self.assertEqual(len(codes), 50)


class PageTests(TestCase):
    def setUp(self):
        self.guest = Guest.objects.create(name='Sunil & Kamala', name_si='සුනිල් සහ කමලා', seats=2)

    def test_general_page_cannot_reply(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(invite_data(response), {'mode': 'general'})
        self.assertEqual(response['Cache-Control'], 'no-store')

    def test_personal_page_knows_the_guest(self):
        response = self.client.get(f'/{self.guest.code}')
        self.assertEqual(response.status_code, 200)
        data = invite_data(response)
        self.assertEqual(data['mode'], 'guest')
        self.assertEqual(data['name'], 'Sunil & Kamala')
        self.assertEqual(data['nameSi'], 'සුනිල් සහ කමලා')
        self.assertEqual(data['seats'], 2)
        self.assertEqual(data['reply'], '')
        self.assertTrue(data['open'])
        self.assertEqual(response['Cache-Control'], 'no-store')
        self.assertEqual(response['Referrer-Policy'], 'same-origin')

    def test_a_reply_goes_to_its_side(self):
        numbers = ReplyTo.current()
        numbers.bride, numbers.groom = '94770000101', '94770000202'
        numbers.save()
        for side, number in [('bride', '94770000101'), ('groom', '94770000202'), ('', ReplyTo.MAIN)]:
            guest = Guest.objects.create(name=f'Guest of {side or "nobody"}', side=side)
            self.assertEqual(invite_data(self.client.get(f'/{guest.code}'))['whatsapp'], number, side)

    def test_a_side_without_a_number_uses_the_main_one(self):
        guest = Guest.objects.create(name='Ruwan', side='groom')
        self.assertEqual(invite_data(self.client.get(f'/{guest.code}'))['whatsapp'], ReplyTo.MAIN)

    def test_the_link_card_shows_the_couple(self):
        page = self.client.get(f'/{self.guest.code}').content.decode()
        self.assertIn('<meta property="og:image" content="http://testserver/assets/couple/naveen-dulanjani-preview.jpg">', page)
        self.assertEqual(self.client.get('/assets/couple/naveen-dulanjani-preview.jpg').status_code, 200)

    def test_code_in_capitals_still_works(self):
        self.assertEqual(self.client.get(f'/{self.guest.code.upper()}').status_code, 200)

    def test_unknown_code_shows_the_plain_invitation(self):
        unused = next(code for code in iter(new_code, None) if code != self.guest.code)
        response = self.client.get(f'/{unused}')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(invite_data(response), {'mode': 'general'})

    def test_a_name_cannot_break_out_of_the_page_data(self):
        guest = Guest.objects.create(name='</script><script>alert(1)</script>')
        response = self.client.get(f'/{guest.code}')
        self.assertNotIn('<script>alert(1)', response.content.decode())
        self.assertEqual(invite_data(response)['name'], '</script><script>alert(1)</script>')


class ReplyTests(TestCase):
    def setUp(self):
        self.guest = Guest.objects.create(name='Sunil & Kamala', seats=2)
        self.url = f'/{self.guest.code}/reply'

    def send(self, **body):
        return self.client.post(self.url, json.dumps(body), content_type='application/json')

    def test_accepting_saves_the_reply(self):
        response = self.send(attendance='yes', people=2, note='  See you there!  ', lang='si')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'reply': 'yes', 'people': 2, 'message': 'See you there!'})
        self.guest.refresh_from_db()
        self.assertEqual((self.guest.reply, self.guest.people, self.guest.reply_language), ('yes', 2, 'si'))
        self.assertIsNotNone(self.guest.replied_at)
        # And the page shows it the next time the link is opened.
        data = invite_data(self.client.get(f'/{self.guest.code}'))
        self.assertEqual((data['reply'], data['people'], data['message']), ('yes', 2, 'See you there!'))

    def test_a_reply_can_be_changed(self):
        self.send(attendance='yes', people=2)
        self.send(attendance='no', people=2)
        self.guest.refresh_from_db()
        self.assertEqual((self.guest.reply, self.guest.people), ('no', 0))

    def test_no_more_people_than_seats(self):
        self.assertEqual(self.send(attendance='yes', people=3).status_code, 400)
        self.assertEqual(self.send(attendance='yes', people=0).status_code, 400)

    def test_only_yes_or_no(self):
        self.assertEqual(self.send(attendance='maybe').status_code, 400)
        self.assertEqual(self.send(people=1).status_code, 400)
        self.assertEqual(self.send(attendance='no', note='x' * 1001).status_code, 400)

    def test_only_json(self):
        response = self.client.post(self.url, {'attendance': 'yes', 'people': 1})
        self.assertEqual(response.status_code, 415)
        response = self.client.post(self.url, 'not json', content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_unknown_code(self):
        unused = next(code for code in iter(new_code, None) if code != self.guest.code)
        response = self.client.post(f'/{unused}/reply', '{"attendance":"no"}', content_type='application/json')
        self.assertEqual(response.status_code, 404)

    def test_replies_close_after_the_deadline(self):
        with override_settings(RSVP_CLOSES=timezone.now() - timedelta(minutes=1)):
            self.assertEqual(self.send(attendance='yes', people=1).status_code, 403)
            self.assertFalse(invite_data(self.client.get(f'/{self.guest.code}'))['open'])
        self.guest.refresh_from_db()
        self.assertEqual(self.guest.reply, '')

    def test_reading_the_reply_address_does_nothing(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)


class OpenedTests(TestCase):
    def test_opening_is_counted(self):
        guest = Guest.objects.create(name='Nimal')
        self.assertEqual(self.client.post(f'/{guest.code}/opened').status_code, 204)
        guest.refresh_from_db()
        first = guest.first_opened_at
        self.assertEqual(guest.times_opened, 1)
        self.client.post(f'/{guest.code}/opened')
        guest.refresh_from_db()
        self.assertEqual(guest.times_opened, 2)
        self.assertEqual(guest.first_opened_at, first)
        self.assertGreaterEqual(guest.last_opened_at, first)

    def test_fetching_the_link_is_not_opening_it(self):
        guest = Guest.objects.create(name='Nimal')
        self.client.get(f'/{guest.code}')
        guest.refresh_from_db()
        self.assertEqual(guest.times_opened, 0)


class FileTests(TestCase):
    def test_the_invitation_files_are_served(self):
        for name, kind in [('invitation.css', 'text/css'), ('invitation.js', 'text/javascript'),
                           ('wedding.ics', 'text/calendar'), ('assets/magnolia-suite/doors.webp', 'image/webp')]:
            response = self.client.get(f'/{name}')
            self.assertEqual(response.status_code, 200, name)
            self.assertEqual(response['Content-Type'], kind, name)
            response.close()

    def test_google_search_consoles_proof_is_served(self):
        proof = Path(settings.SITE_DIR) / 'google0123456789abcdef.html'
        proof.write_text('google-site-verification: google0123456789abcdef.html', encoding='utf-8')
        try:
            self.assertContains(self.client.get('/google0123456789abcdef.html'), 'google-site-verification')
            self.assertEqual(self.client.get('/google-anything.html').status_code, 404)
        finally:
            proof.unlink()

    def test_nothing_else_in_the_project_folder_is(self):
        for name in ['.git/config', '.gitignore', 'DESIGN.md', 'README.md', 'share.py', 'server/manage.py',
                     'server/data/invite.sqlite3', 'server/data/dev-secret-key', '.claude/launch.json',
                     'assets/../DESIGN.md', 'assets/..%2FDESIGN.md', '..%2Fserver/manage.py', 'assets/.hidden']:
            self.assertEqual(self.client.get(f'/{name}').status_code, 404, name)
