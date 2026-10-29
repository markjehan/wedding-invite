---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["invitation.css","magnolia.css","language.css","i18n.js","invitation.js","venue-drawing.js"]
---

# Wedding Invitation Surface

## Scope and mode

Experience: one responsive champagne-gold and off-white invitation with continuous native scrolling, written in two complete languages, English and Sinhala. The Sinhala invitation is entirely Sinhala, names and monogram included; only the photographed wax seal keeps N&D. The latest user request (14 September 2026) asked for a same-theme language page before everything else, and for the translation to change words only, never imagery, animation or timing.

## Audience, job, action, content, constraints

A wedding guest, often a Sinhala-reading family member on a phone, receives the invitation, chooses a language, checks when and where, explores the proposed programme, and prepares a reply. Naveen and Dulanjani (නවීන් සහ දුලාංජනී), 7 December 2026, and Avenra Gardens Hotel in Negombo are confirmed. Exact times, final agenda, real photographs, and RSVP contact remain intentionally provisional. The date is real; calendars are all-day and the countdown targets midnight in Sri Lanka. RSVP is prepared and unsent. The Sinhala spelling of the names and the venue transliteration (ඇවන්රා ගාඩන්ස්) should be confirmed by the couple before sending.

## Current direction and reference authority

The Ivory Garden: floral courtyard welcome, centered names, off-white letters, champagne rules, and photographic storytelling in one long document. Latest user pins: .qa/inspiration-0068.jpg and .qa/inspiration-0071.jpg. No separate comp was approved. This is an extension inside the established world, so no concept roll was run and no new FORM or seed key exists; it inherits the Ivory Garden's form (new-work: extend an existing surface). The language page was drafted on a design canvas (https://claude.ai/code/artifact/21b78956-641c-4fed-a419-4ed71cc55774) and built code-led inside the established world.

The first viewport is the language page: the compact crest, Welcome and ආයුබෝවන් held apart by the programme's diamond, the question asked once in each language, and two identical arched stationery panels (English / සිංහල) that echo the date card and the carved doors. It doubles as the loading screen with a hairline that fills as the door art, score and fonts arrive. Choosing warms that panel, switches every word immediately (the crest's initials become න ◇ දු under the finger), and dissolves into the doors. The doors, 4.8-second entrance, arrival figure and all timings are then identical in both languages. `?lang=si|en` skips the page; return visits are asked again with the last answer warmed; the footer switches language in place.

## Section inventory

| Section | Current expression and behavior |
| --- | --- |
| Language page | Two arched panels, bilingual greeting and question, load hairline, keyboard (Tab/arrows) contained, reduced motion instant, hidden without JavaScript. |
| Welcome | Full-height floral courtyard, hand-inscribed names (Pinyon outlines in English, Gurulugomi calligraphic outlines in Sinhala), drawing medallion, native anchor cue. |
| Invitation | Couple background with visible lead-in, outlined translucent invitation letter, three framed sample photographs and disclosure. |
| Date | Scratch foil struck with the language's monogram, keyboard/tap reveal, Google Calendar, iCalendar (wedding-si.ics in Sinhala), countdown, pending ceremony time. |
| Agenda | Five proposed acts, each with time to follow, and explicit proposed-programme disclosure. |
| Venue | Automatic centerline drawing, finished engraving, replay, actual-photo toggle, Google Maps directions and place link. |
| RSVP | Name, attendance, optional note; the button opens WhatsApp to the couple's number with the reply in the guest's language; prepared panel with WhatsApp, email and copy as fallbacks; no-store disclosure. |
| Closing | Drawing medallion, names, replay, and the language switch offered in the other language. |

## Layout and behavior

All six sections participate in ordinary document scrolling. At 700px the agenda and calendar controls stack and spacing tightens. Sinhala type pairs by role: UN-Gurulugomi (classic Sinhala calligraphy) wherever the English writes by hand (Pinyon Script names and monogram, Great Vibes headings); Noto Serif Sinhala Light wherever it sets Italiana; Noto Sans Sinhala Light wherever it sets Manrope; no capitals, no tracking, nothing under 12px. The language page compacts for phones held sideways and for short upright phones. Reduced motion removes decoration. Without JavaScript the language page is hidden and the English invitation reads in full.

## Shipping assets and provenance

- assets/magnolia-suite/: doors, garden, portrait and paper artwork (prompts in PROMPTS.md).
- assets/gallery-garden.webp, couple-portrait.webp, gallery-dance.webp: disclosed sample photographs.
- assets/avenra-lineart-transparent.webp and avenra-strokes.js: finished engraving and centerline paths; assets/avenra-original.webp: actual venue photograph supplied by the user.
- assets/materials/brass-seal-monogram-512.webp: the wax seal (N&D struck in; unchanged in Sinhala).
- assets/fonts/: Pinyon Script, Great Vibes, Italiana, Julius Sans One, Manrope; sinhala-script.woff, noto-serif-sinhala-light.woff and noto-sans-sinhala-light.woff are Sinhala-block subsets of UN-Gurulugomi (Pushpananda Ekanayaka, The FontMaster; free for personal use, see Gurulugomi-NOTICE.txt) and Google Fonts' OFL Noto Serif Sinhala and Noto Sans Sinhala (both instanced at wght 300), cut by build_sinhala.py.

## Validation and verdict

.qa/language-check.cjs (headless Chrome, 1440x900, 390x844, 320x568, 844x390) walks the language page, the Sinhala doors and arrival, every section, the date reveal, the Sinhala reply and calendar file, the footer switch to English and back, ?lang=si, a return visit, reduced motion with a shared #venue link, keyboard choice, and no JavaScript: no page errors and no horizontal overflow. Sinhala name outlines were overlaid on Chrome's own shaping of the same words and match exactly. No physical iOS/Android or Safari test was performed.

## Remaining launch inputs

Replace sample photographs, confirm ceremony time and final programme, add the RSVP email address (WhatsApp is connected), and have a Sinhala reader confirm the names' spelling, the venue transliteration and the translation before sending.
