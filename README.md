# Naveen & Dulanjani — wedding invitation

A digital wedding invitation in English and Sinhala, with a personal link for every guest and a
private page where the bride and groom keep the guest list and see the replies.

**Wedding:** Monday 7 December 2026, Centrium Ballroom, Avenra Gardens, Negombo, Sri Lanka
(Sinhala: සෙන්ට්‍රියම් බෝල් රූම්, ඇවෙන්රා ගාර්ඩ්න්ස්, මීගමුව).

**Live site:** https://naveenwedsdulanjani.com
Every page — the invitation, `/admin/` and everything under them — opens only on this domain:
any Vercel address (`…vercel.app`, old or new) sends the visitor to the same page here
(`MainAddress` in `server/guests/middleware.py`).
**Couple's pages:** https://naveenwedsdulanjani.com/admin/
**Code:** https://github.com/markjehan/wedding-invite — the `main` branch is the live site.

This file is the hand-over: what exists, how it fits together, how to change it, and the rules that
were agreed along the way. Read **Working rules** before changing anything.

---

## 1. What a guest sees

1. **Language page** — the guest picks English or සිංහල. It doubles as the loading screen (a thin
   line fills while the art, music and fonts arrive; never held more than 4 seconds). The language is
   **never** preset per guest; every guest chooses for themselves.
2. **The doors** — a wax seal; pressing it starts the music and swings the doors open.
3. **The welcome** — the couple's names written by a pen, "Welcome, <name>, to the wedding of" on
   personal links, and a pencil portrait of the couple that draws itself in.
4. **The letter** — "Dear <name>," and the invitation wording, then a photo slideshow/gallery.
5. **The date** — a gold foil to scratch off, "Add to calendar" (Google / iPhone .ics), countdown.
6. **The programme** — 9.00 am arrival of the couple → 9.30 → 11.45 → 12.30 → 3.45 pm going away.
7. **The venue** — a drawing of Avenra Gardens that draws itself, plus Google Maps directions
   (latitude 7.2175792, longitude 79.8554087).
8. **Reply (RSVP)** — coming / not coming, the seats kept for them (shown, only the couple can change it), a note.

The footer has *Back to the beginning*, *Replay the opening* and an English | සිංහල switch.

### The three kinds of link

| Link | What happens |
|---|---|
| `/?name=Chamini` or `/?name=Sunil+and+Kamala` | **The kind the couple sends.** The server looks the name up in the guest list (ignores capitals, `&`/`and`, spaces; matches Sinhala names too). If found, it is that guest's own page. If not found, the guest is still greeted by name and the reply opens WhatsApp, but nothing is saved. |
| `/k7m2p9qa` (8-character code) | A guest's own page by code. Used automatically when two guests have the same name (e.g. three "Mr & Mrs Perera"). Still works for everyone. |
| `/` (plain address) | The whole invitation, read-only: no reply form, just a note to reply from their own link. |

On a guest's own page the reply is **saved on the server** *and* WhatsApp opens with the reply
written to the right number (bride's side → bride's number, groom's side → groom's number, otherwise
the main number; set on the admin page "Where replies go"). Opening the invitation is recorded once,
by the page itself in a browser — WhatsApp's link preview and `curl` don't count.

Trade-off the couple accepted: anyone who knows a listed guest's name can open their invitation and
change their reply.

---

## 2. The couple's pages (`/admin/`)

Sign-in needs a password **and** a 6-digit code from an authenticator app (plus 10 one-time backup
codes). Nobody can sign up. Live account: `naveen`.

- **Home** — the journey Invited → Sent → Opened → Replied, days to go, how many people are coming
  by side, "Needs you" lists with WhatsApp buttons, latest replies. Refreshes itself every 15 s.
- **Guests** — search and filter; each row has **Send** / **Remind** (opens WhatsApp to that guest
  with the message and their link, and marks them sent), copy link.
- **One guest** — edit details, seats, side, Sinhala name, phone; see dates sent/opened/replied;
  "Send the invitation again"; remove.
- **Add from Excel** — preview row by row, nothing changes until **Go ahead**; same number (or else
  same name) updates rather than duplicates. **Download Excel** exports everyone with links and replies.
- **Where replies go** — the bride's, groom's and main WhatsApp numbers.
- **Help** page.

The WhatsApp message is deliberately short and English-only (`server/guests/whatsapp.py`):

```
The Wedding of Naveen & Dulanjani

<link>
```

Phone numbers are tidied into WhatsApp form however they're typed (`077 123 4567`, `+94 77…`).
The couple declined the WhatsApp Business API; sending is one tap per guest.

---

## 3. How it's built

Two halves in one repository:

### The invitation (plain HTML/CSS/JS, no framework)

| File | Role |
|---|---|
| `index.html` | The whole invitation, English wording lives here |
| `i18n.js` | Sinhala wording (same keys), the language switch and the language page |
| `invitation.js` | Doors, music, scratch foil, countdown, calendar, RSVP, personal greeting (`?name=`), slideshow |
| `invitation.css`, `magnolia.css` | The ivory/champagne-gold look |
| `language.css` | Language page and Sinhala typefaces |
| `devices.css` | Per-device tuning; `<html data-device="phone|tablet|laptop|desktop">` is set before first paint |
| `couple-drawing.js` + `couple-strokes.js` | Draws the couple's pencil portrait along traced pen paths |
| `venue-drawing.js` + `avenra-strokes.js` | Draws the venue |
| `wedding.ics`, `wedding-si.ics` | Calendar files (English / Sinhala) |
| `assets/` | Art, photos (`assets/couple/`), fonts, music (`assets/audio/invitation.mp3`) |

Not loaded any more (kept from earlier designs): `script.js`, `styles.css`, `garden.*`, `grand.css`,
`elevation.css`, `experience.js`.

Wording keys: elements carry `data-i18n` (whole contents), `data-i18n-text` (own text only) or
`data-i18n-attr` (`attribute:key`). To change a line, change it in `index.html` **and** the same key
in `i18n.js`.

### The server (`server/`, Python + Django)

| File | Role |
|---|---|
| `server/config/settings.py` | Settings; reads the environment variables below |
| `server/config/urls.py` | `/`, `/<code>`, `/<code>/reply`, `/<code>/opened`, `/admin/…`, `/accounts/…`, everything else = invitation files |
| `server/guests/models.py` | `Guest` (name, Sinhala name, seats, side, phone, code, sent/reminded/opened/replied, reply) and `ReplyNumbers` |
| `server/guests/views.py` | Serves the invitation with the guest's details written in; saves replies; serves only the invitation's own files (never `.git`, notes, etc.) |
| `server/guests/names.py` | The `?name=` lookup |
| `server/guests/dashboard.py` + `server/templates/couple/` + `static/guests/couple.css/.js` | The couple's pages |
| `server/guests/spreadsheet.py` | Excel in/out |
| `server/guests/whatsapp.py`, `phones.py`, `codes.py` | Messages, phone tidying, 8-char codes (no look-alike characters) |
| `server/guests/management/commands/` | `add_guest`, `guests`, `demo_guests`, `reset_two_step` |
| `server/guests/tests.py`, `tests_admin.py` | Automatic checks |

Sign-in/MFA is `django-allauth[mfa]`. Static files via WhiteNoise. Packages are listed twice —
`server/requirements.txt` (laptop) and `pyproject.toml` (Vercel) — change both together.

### Hosting

- **Vercel** (team `mark-6689`) builds from GitHub: every push to `main` goes live in a minute or two.
  Region Singapore (`vercel.json`). Each build runs the database migrations (`pyproject.toml`).
- **Neon Postgres** database "guests", Singapore, connected through Vercel (gives `DATABASE_URL`).
- **Domain** `naveenwedsdulanjani.com`: DNS at GoDaddy, managed by a friend of the user (the user has
  no GoDaddy login). Records: `A @ 216.198.79.1`, `www` → apex. SSL by Vercel automatically
  (renews itself). `www` redirects to the bare domain.
- Step-by-step dashboard instructions: [VERCEL.md](VERCEL.md).

Environment variables on Vercel:

| Name | Value / purpose |
|---|---|
| `DATABASE_URL` | Added by Neon. The secret key is derived from it unless `DJANGO_SECRET_KEY` is set |
| `INVITE_SITE_URL` | `https://naveenwedsdulanjani.com` — the address put in WhatsApp messages and Excel |
| `INVITE_RSVP_DEADLINE` | Optional `YYYY-MM-DD`; replies close at the end of that day (Sri Lanka time) |
| `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` | Optional |

Known Vercel quirks: redeploying from the dashboard can hit an email-code challenge; pushing a commit
(even an empty one) to `main` always works. Old deployment-specific URLs (`…-3f8iv4ffm-…`) are
frozen old versions — never send those. The old host `wedding-invite-mark-6689.vercel.app` was once
falsely flagged by Google Safe Browsing; don't use it for guests.

---

## 4. Running it on the laptop (Windows)

First time:

```bash
python -m venv server/.venv
server/.venv/Scripts/python.exe -m pip install -r server/requirements.txt
server/.venv/Scripts/python.exe server/manage.py migrate
server/.venv/Scripts/python.exe server/manage.py createsuperuser
```

Then:

| Command (prefix `server/.venv/Scripts/python.exe server/manage.py`) | What it does |
|---|---|
| `runserver 8000` | Full site with guest links and admin at http://127.0.0.1:8000/ |
| `runserver 0.0.0.0:8000` | Same, reachable from a phone on the same Wi-Fi |
| `add_guest "Sunil & Kamala" --si "සුනිල් සහ කමලා" --seats 2 --phone 94771234567 --side bride` | Add a guest, print link |
| `guests` | List everyone with links, opened, replies, totals |
| `demo_guests` / `demo_guests --remove` | Add / remove 12 made-up guests |
| `test guests` | Run the automatic checks |
| `reset_two_step <name>` | Someone lost phone and backup codes |
| `changepassword <name>` | Forgotten password |

The laptop's guest list is `server/data/invite.sqlite3` — **never committed** (names and phone
numbers). To work on the live database from the laptop, set `$env:DATABASE_URL` to Neon's
*unpooled* address in a fresh PowerShell window, run the command, close the window.

Invitation only (no server): `python serve.py` → http://127.0.0.1:4173/. Claude's preview config is
`.claude/launch.json` (`nw-invitation`, `nw-server`).

Other scripts: `build_bundle.py` (offline single-file copy `invitation-bundled.html`),
`build_sinhala.py` (re-draws the Sinhala names in Gurulugomi — only if their spelling changes),
`share.py` (old temporary Cloudflare quick-tunnel share links; superseded by the real domain),
`build_assets/` (gitignored helpers, e.g. `trace_drawing.py` for the portrait strokes).

---

## 5. Working rules (agreed with the user — please keep to them)

1. **Change both languages.** Any wording change in Sinhala must be mirrored in English and back —
   including the calendar files/links, the RSVP WhatsApp text and anywhere else the same fact is
   repeated. Search both `index.html` and `i18n.js` before saying it's done.
2. **Commit and push every session.** `main` = the live site. Only push finished, checked work to
   `main`. Write commit messages in plain English.
3. **Several sessions may edit this folder at once.** Before committing, look at `git diff` and stage
   only your own changes; don't sweep someone's half-done work live.
4. **A replaced image/font/audio needs a new file name.** Files under `assets/` are cached by browsers
   for a day; overwriting under the same name means guests keep the old one (e.g. the portrait is
   `couple-drawing-<hash>.webp`). Pages and root scripts are not cached.
5. **Plain English.** The user forwards explanations to the groom: short steps, no jargon.
6. **Be practical.** Build one good version directly; no "pick a direction" rounds. Stock-looking UI
   gets rejected — everything should match the invitation's ivory and gold.
7. **Couple artwork** must look like a real artist's pencil portrait, made with an AI image model
   (Weave in Figma; Nano Banana Pro edit, 2K, 3:4). Code-made drawings were rejected. Ask for
   approval of the credit cost before every run. Original photos are in the user's Google Drive.
8. **Never preset the language** for a guest.
9. **Testing devices:** the browser pane's custom sizes don't report touch/screen, so force
   `document.documentElement.dataset.device = 'tablet'` (or `'phone'`) to check those layouts.

---

## 6. Where things stand (10 November 2026)

Done and live:
- The invitation in both languages, on the real domain with SSL.
- Personal `?name=` links joined to the guest list; replies saved + sent to WhatsApp per side.
- Couple's pages with MFA, Excel import/export, Send/Remind buttons.
- Bride's side loaded: 51 guests imported from "Digital Invitation guest list.xlsx". Bride's replies
  go to 94766129055; main RSVP number 94771281561.
- Venue wording: "Centrium Ballroom, Avenra Gardens, Negombo, Sri Lanka" everywhere, both languages.

Still open:
- **Seats for the bride's 51 guests were guessed** (1 person, 2 couple, 4 "and Family") — the couple
  should confirm real numbers.
- **Sinhala names** of those guests were written by Claude and need a Sinhala reader's check; same
  for the Sinhala reply texts.
- Groom's side guest list not loaded yet (as far as this file knows).
- Rotate the Neon database password (it was once pasted in a chat), then check Vercel picks it up.
- No physical iPhone/Android test of every feature has been recorded beyond the couple's own phones.

Branches: `main` is current. `monogram-arrival` and `music-score` are older working branches
(behind `main`) and can be ignored.

---

## 7. Design notes, for reference

### Music and timing

`assets/audio/invitation.mp3` starts on the seal press (never autoplays), loops seamlessly from
60.000 s to 98.400 s (sixteen bars), and is played quietly (about −29 LUFS; `CEILING` in
`invitation.js`). The recording is a steady 100 bpm, so the animations are cut to it: a beat is
0.6 s, a bar 2.4 s (`TEMPO` in `invitation.js`). Door swing 3 beats, walk-through 5 beats, venue
drawing 3 bars. The CSS durations are literal numbers, so a different recording means updating
`TEMPO`, `LOOP` and those durations together. The mute button's choice is remembered per browser.

### Fonts

| English | Sinhala | Used for |
|---|---|---|
| Pinyon Script, Great Vibes | UN-Gurulugomi (calligraphy) | names, monogram, headings |
| Italiana | Noto Serif Sinhala Light | welcome, letter, programme, labels |
| Manrope | Noto Sans Sinhala Light | body, buttons, form |

Sinhala fonts are subsets in `assets/fonts/` loaded only when Sinhala is on screen. Licences sit next
to them (Gurulugomi is free for personal use). The wax seal keeps "N&D" in both languages.

### Gallery photos

In the `memory-gallery` block of `index.html`. To swap photos: save as WebP in `assets/` (new
names!), update `src`, `width`, `height`, `alt` (and the Sinhala `photo.` key in `i18n.js`); move the
crop with `--focus` on the `<figure>`. Keep the count a multiple of six.

### Other documents in this folder

- [VERCEL.md](VERCEL.md) — setting up Vercel + Neon from scratch.
- [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) — original product brief and design system
  (partly out of date: there is now a backend and confirmed times).
- [VIDEO-REVIEW.md](VIDEO-REVIEW.md) — analysis of the reference videos the design was based on.
- `assets/*/PROMPTS.md`, `PROVENANCE.md` — how each artwork was generated.
- `.impeccable/` — design-tool notes.
