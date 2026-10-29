# Naveen & Dulanjani — wedding invitation demo

The current design uses a newly generated ivory magnolia and champagne artwork suite throughout the opening and all six sections. `magnolia.css` extends the base styles. Artwork originals, optimized assets, and the complete built-in ImageGen prompts are saved in `assets/magnolia-suite/`. After changing either stylesheet, rebuild the offline copy with `python build_bundle.py`.

Open the local preview at http://127.0.0.1:4173/ while the preview server is running.

This is one continuous scrolling invitation, not a page-flip interface. All six sections share the champagne-gold and ivory design.

## Run or share a preview

Run `python serve.py` from this folder to start a local preview. To preview on a phone on the same trusted Wi-Fi, run `python serve.py --lan --port 4174` and use the phone address printed by the server. A firewall prompt may require approval. Stop it when finished; this is a development preview, not public hosting.

`invitation-bundled.html` is the self-contained offline copy. Run `python build_bundle.py` after changing the invitation to refresh that copy. Calendar and map links need internet access; local fonts and artwork are embedded.

## The server: a personal link for every guest

`server/` is a small Django program that gives each guest their own link, such as
`http://127.0.0.1:8000/k7m2p9qa`. It serves the same invitation, with three differences:

- **A guest's own link** greets them by name at the top of the letter (in Sinhala too, from their
  Sinhala name), and the reply form already knows who they are. It asks only whether they are coming,
  how many of the seats kept for them will be used, and for a note. The reply is saved in the guest
  list, and it is there again, ready to change, whenever they open the link.
- **The plain address**, with no code, shows the whole invitation but no reply form, only a note to
  reply from their own link. So does a mistyped or deleted code.
- **Opening is recorded** once per visit, by the page after it has opened in a browser, so the link
  preview WhatsApp makes when a link is pasted does not count.

Opened any other way (`serve.py`, the share link, the offline copy), the invitation behaves exactly
as before and replies go to WhatsApp.

The guest list is `server/data/invite.sqlite3`. It holds names and phone numbers, so `server/data/`
is never committed. Only the invitation's own files are served (index.html, what it links to, the
calendar files and `assets/`); the rest of this folder is refused.

First time, from this folder:

1. `python -m venv server/.venv`
2. `server/.venv/Scripts/python.exe -m pip install -r server/requirements.txt`
3. `server/.venv/Scripts/python.exe server/manage.py migrate`

Then (`server/.venv/Scripts/python.exe server/manage.py` is shortened to `manage.py` here):

| Command | What it does |
|---|---|
| `manage.py runserver 8000` | Start it on this laptop: http://127.0.0.1:8000/ |
| `manage.py runserver 0.0.0.0:8000` | Also reachable from a phone on the same Wi-Fi, at the laptop's address (Windows may ask to allow it through the firewall) |
| `manage.py add_guest "Sunil & Kamala" --si "සුනිල් සහ කමලා" --seats 2 --phone 94771234567 --side bride` | Add a guest and print their link |
| `manage.py guests` | Every guest, their link, when they first opened it and their reply, with totals |
| `manage.py demo_guests` | Add twelve made-up guests, at every step from not sent to replied, to try it with; `--remove` takes them out again |
| `manage.py test guests` | Run the automatic checks |

Replies close at the end of the day named in `INVITE_RSVP_DEADLINE` (`YYYY-MM-DD`, Sri Lanka time);
unset, they stay open.

### The couple's pages (/admin/)

http://127.0.0.1:8000/admin/ is where the bride and groom keep the guest list. It is built for this
wedding, in the invitation's ivory and gold (`server/templates/couple/`, `server/guests/dashboard.py`,
`server/guests/static/guests/couple.css`), and works on a phone as well as a laptop.

- **Overview**: the guests' journey as one gold line, Invited, Sent, Opened, Replied, each with
  how many are still to go there; the days to the wedding; **how many people are coming**, by bride's
  and groom's side, with seats kept, not coming and waiting; **Needs you**, the guests still to send,
  the ones who have not opened it and the ones who opened it but have not replied, each with its
  WhatsApp button; and the latest replies with what the guests wrote.
- **Guests**: everyone, searchable by name, number or note, filtered by side and by where they are
  (To send, Not opened, Opened no reply, Coming, Not coming). Each row has the guest's step, their
  note, a copy-link button and the next thing to do: **Send** (WhatsApp opens on a chat with them,
  the invitation written in English and Sinhala with their link, and they are marked sent) or
  **Remind** (the same with a gentle reminder). A guest with no number says "Add their number".
- **One guest**: their details to change, their link to copy or open, Call, Send or Remind, the
  dates they were added, sent, reminded, opened and replied, what they wrote, and taking them off
  the list.
- **Add from Excel**: reads a sheet, shows row by row what it will add, update or leave out (and
  why), and changes nothing until **Go ahead**. A guest already on the list (same number, or else
  same name) is updated, not added twice, and an empty cell leaves what is there alone. There is an
  empty sheet to fill in on that page. **Download Excel** gives every guest with their link, when it
  was sent, reminded and opened, and their reply.

Phone numbers are tidied into WhatsApp's form whichever way they are typed (`077 123 4567`,
`+94 77 123 4567`, ...). The two WhatsApp messages are in `server/guests/whatsapp.py`. Looking at a
guest's invitation while signed in does not count as them opening it. The pages are never stored by
the browser, because they hold names and numbers.

Signing in takes a password and a 6-digit code from an authenticator app (Google Authenticator,
Microsoft Authenticator, ...). Nobody can sign up; each person's account is made with:

```
manage.py createsuperuser
```

The first sign-in asks for the password once more, then shows a QR code to scan into the app and the
code it gives, and then 10 backup codes, each usable once, for a lost phone. Keep those somewhere safe.
Until the app is set up the guest list cannot be opened. The key icon at the top right shows the
backup codes again or makes new ones. Someone who loses both the phone and the backup codes is reset
with `manage.py reset_two_step <name>` and sets it up again on their next sign-in. A forgotten
password is reset with `manage.py changepassword <name>`.

Once the real address is known, set `INVITE_SITE_URL` (e.g. `https://naveenanddulanjani.com`) so
the WhatsApp messages and the Excel download carry it; until then they use the address the admin
pages were opened at.

## Two languages

The invitation is written in English and in Sinhala, and a guest chooses on the first screen, before
the doors. Everything after that choice is shared: the doors, the score, the arrival figure, every
timing. Only the words change, and the two places where words have a drawn shape of their own:

- **The inscribed names** on the first screen are font outlines traced by a pen. The Sinhala names
  (නවීන් / දුලාංජනී) are set in Gurulugomi, classic Sinhala calligraphy, generated by
  `build_sinhala.py` into `<template id="names-si">` in `index.html` and boxed exactly like the
  English letters, so the same pen and ink animation writes them.
- **The monogram** (the hero medallion, the closing medallion, every section crest and the stamp on the
  scratch foil) changes to large calligraphic න and දු with the invitation's gold diamond
  between them (where the English has its ampersand), positioned by measured ink.

Each English face has a Sinhala partner that plays the same part:

| English | Sinhala | Used for |
|---|---|---|
| Pinyon Script, Great Vibes | UN-Gurulugomi (calligraphy) | names, monogram initials, section headings |
| Italiana | Noto Serif Sinhala Light | welcome line, letter, programme, address, small labels |
| Manrope | Noto Sans Sinhala Light | body copy, buttons, the form |

The wax seal on the doors and the letter is a photograph with N&D struck into it, so it stays as it is
in both languages.

| File | Role |
|---|---|
| `i18n.js` | The Sinhala dictionary, the language switch, and the language page's logic. The English is read from the markup itself. |
| `language.css` | The language page, and the Sinhala type in each role the English faces fill. |
| `build_sinhala.py` | Shapes the Sinhala names into outlines, places the initials, and cuts the three Sinhala web fonts. |
| `assets/fonts/sinhala-script.woff`, `noto-serif-sinhala-light.woff`, `noto-sans-sinhala-light.woff` | Sinhala-only subsets, loaded only when Sinhala text is on screen. The Noto files are OFL; Gurulugomi is free for personal use (see `Gurulugomi-NOTICE.txt`). |
| `wedding-si.ics` | The calendar file iPhones are handed in Sinhala. |

Elements carry the key of their words in `data-i18n` (whole contents), `data-i18n-text` (only the
element's own text, so an icon or an input inside survives) or `data-i18n-attr` (`attribute:key`
pairs). To change a line, change it in `index.html` for English and under the same key in `i18n.js`
for Sinhala. The font subsets cover the whole Sinhala block, so new wording never needs a rebuild;
the names only need `python build_sinhala.py` if their spelling changes (sources are listed at the top
of that script).

- **Links:** `?lang=si` or `?lang=en` skips the question and opens straight onto the doors in that
  language. A plain link always asks, with the guest's last choice warmed.
- **Switching later:** the footer carries a two-language control (English | සිංහල) beneath *Back to the
  beginning* and *Replay the opening*. The words swap in place and nothing replays: the names on the
  first screen appear already written, and the other language's fonts are fetched as the footer comes
  near, so the switch is instant.
- **The wait:** the language page doubles as the loading screen. A hairline fills as the door art,
  the score and the fonts arrive, and the page dissolves into the doors once they have (never held more
  than four seconds).

Please have a Sinhala reader confirm the spelling of the names and of the venue transliteration
(ඇවන්රා ගාඩන්ස්) before the invitation is sent.

## The score

`assets/audio/invitation.mp3` is the invitation's music. It begins on the seal press — the guest's
own gesture, which is what browsers require before any sound — and never autoplays. The control at
the right of the masthead stops and restarts it, and the choice is remembered per browser.

Two candidate recordings were supplied. The one in use was chosen because it holds a metronomic
100bpm across its whole length (the other is freely timed and drifts between roughly 59 and 178bpm
window to window, so nothing can be cut to it), because it contains a sixteen-bar section that
splices into a seamless loop, and because its own opening is exactly two bars of thin texture before
the full arrangement enters — which is the length of the door sequence.

Everything visual is cut to that grid: a beat is 0.6s and a bar 2.4s.

| | |
|---|---|
| Door swing | 3 beats (1.8s) |
| Walk-through | 5 beats (3.0s), ending on the two-bar downbeat as the arrangement enters |
| Venue drawing | 3 bars (7.2s), begun on the next beat |
| Reveal fades / movement | 1 beat / 1.5 beats |
| Staggered cascades | a sixteenth (0.15s) per item, never longer than one beat in total |
| Foil sheen, scroll cue | 2 bars, 1 bar |
| Petal drift | swells once a bar, sways once every eight |
| Loop | 60.000s to 98.400s — sixteen bars |
| Playback level | -29.1 LUFS, peak -16.3 dBFS |

### Level

The recording arrived as a -14.6 LUFS master with only 4.6 LU of range — commercial loudness, which
under an invitation reads as music playing at you rather than behind you. It is held down twice:
ten decibels are baked into the file, so the asset is quiet even at full scale and no failure of the
controls here can make it shout, and a `CEILING` in `invitation.js` takes the remaining four and a
half. Playback lands at **-29.1 LUFS, peak -16.3 dBFS** — against -14 LUFS for Spotify's
normalisation and -33 to -38 LUFS for broadcast music under dialogue. Audible on a phone in a quiet
room, and never competing with the page. `CEILING` is the ceiling, not a starting point; nothing
asks for more, and `atMost()` clamps anything that tried.

The file is trimmed to its own first downbeat so t=0 is beat one, and trimmed again just past the
loop end, since nothing after it is ever played; that keeps the decode short enough to be ready
before the seal is pressed. It is decoded through Web Audio, which is what makes the loop gapless —
a looping `<audio>` element gaps at the seam, and is kept only as a fallback.

Because the press and the first note are not simultaneous (a context that has never run has to wake
its output device), the entrance waits for sound rather than for the click, and hands the CSS a
`--sync` offset for whatever the music covered meanwhile. Measured on this machine the entrance
lands within about 80ms of the two-bar downbeat. If the sound has not arrived within a beat, the
doors go anyway: a beat behind the score is recoverable, drifting against it is not.

To use a different recording, re-derive the tempo, loop points and trim, then update `TEMPO` and
`LOOP` in `invitation.js` and the durations above. The CSS durations are literal values, not
variables, so they have to be changed with them.

## Demo details

- Confirmed names: Naveen and Dulanjani.
- Confirmed date: Monday, 7 December 2026.
- Venue: Avenra Gardens, Negombo, with the supplied Google Maps location.
- Exact ceremony times and agenda remain provisional. Calendars use an all-day event; the countdown targets the start of 7 December in Sri Lanka.
- All couple photographs are labelled illustrative demo assets.
- RSVP replies go to WhatsApp +94 77 128 1561: pressing the button opens WhatsApp with the reply written and addressed, and the guest presses send. Email and copy stay as fallbacks. Nothing is stored. The number is `RSVP_WHATSAPP` in `invitation.js`.

## The gallery

Six photographs sit below the letter, in the `memory-gallery` block of `index.html`. The 1st and 4th
are the tall arched ones; the rest are the shorter rounded ones. Until the couple's own photographs
arrive, the three samples each appear twice.

To put the real photographs in:

1. Save them as WebP in `assets/` (upright photographs suit the arches best).
2. Change each `src` to the new file, and its `width` and `height` to the photograph's own size.
3. Write a short description in each `alt`, and the Sinhala one in `i18n.js` under a matching
   `photo.` key; the repeats' empty `alt=""` go once every photograph is different.
4. If someone's face is cut off, change `--focus` on that `<figure>`: the first number moves the
   crop left and right, the second up and down (`50% 20%` keeps the top of the photograph).
5. Delete the "Sample imagery" line beneath the gallery, and its `photo.note` in `i18n.js`.

Keep the count to a multiple of six so both the phone and the computer layouts close evenly.

## Implementation and checks

Live files: `index.html`, `invitation.css`, `magnolia.css`, `language.css`, `i18n.js`, `invitation.js`, `venue-drawing.js`, `avenra-strokes.js`, `wedding.ics`, `wedding-si.ics`, `assets/audio/invitation.mp3`, and referenced assets. Earlier garden/page-turn files remain preserved but are not loaded.

Current checks cover Chrome at desktop, 390px phone, 320px phone and landscape sizes, actual pointer scratching, calendar file contents, RSVP accept/decline flows, reduced motion, direct section links, and no-JavaScript reading. See .qa/reference-check-results.json. WebKit 26.5 also passed mobile checks for the opening, scratching, calendar download, RSVP and venue drawing (see .qa/webkit-results.json). Physical iOS and Android devices have not been tested.

The score was checked in Chrome and WebKit at 390 x 844 with touch: no sound before the guest's
gesture, the first note arriving on the seal press, the entrance landing within about 80ms of the
two-bar downbeat, the control muting and restarting and remembering its state, reduced motion
skipping the seal and still starting the music on the first tap, and no page errors. The sixteen-bar
loop was rendered offline through the real file and its real loop points: the audio after the splice
is sample-identical to the loop start, and the step across the seam is within 7% of an ordinary
sample-to-sample step, so there is no click. `.qa/hinge-check.cjs` passes in both engines after the
retiming. Playwright's Windows WebKit build has no Web Audio at all, so that run exercised the
`<audio>` fallback rather than the decoded path — useful proof the fallback works, but it means the
decoded path has been verified in Chrome only. Real iOS Safari has Web Audio and would take the
decoded path; no physical device has been tested.

The door hinge fix was checked separately against the 12 September phone recording: both leaves now swing outward continuously instead of briefly rotating behind the garden. `.qa/hinge-check.cjs` passes in Chrome and WebKit at 1440 × 900, 390 × 844, 320 × 568 and 844 × 390, with sampled animation geometry and door coverage, tap/keyboard opening, replay, Escape, focus restoration, direct section links, reduced motion, no JavaScript, and the rebuilt offline copy. Results and frames are in `.qa/hinge-after/`; `.qa/hinge-comparison.jpg` shows the original flash beside the fix.

## Reference review

See VIDEO-REVIEW.md for the frame sequence analysis, HTML/video feasibility and outstanding content. The live site loads no video and no external fonts. The supplied map location has been resolved and verified. `wedding.ics` also provides a calendar download when JavaScript is disabled.
