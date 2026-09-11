---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["invitation.css", "invitation.js", "venue-drawing.js"]
---

# Wedding Invitation Surface

## Scope and mode

Experience: one responsive champagne-gold and off-white invitation with continuous native scrolling. The latest user request replaces page flips and explicitly asks for a demo before final details arrive.

## Audience, job, action, content, constraints

A wedding guest receives the invitation, checks when and where, explores the proposed programme, and prepares a reply. Naveen and Dulanjani, 4 December 2026, and Avenra Gardens Hotel in Negombo are confirmed. Exact times, final agenda, real photographs, and RSVP contact remain intentionally provisional. The date is real; calendars are all-day and the countdown targets midnight in Sri Lanka. RSVP is prepared and unsent.

## Current direction and reference authority

The Ivory Garden: floral courtyard welcome, centered names, off-white letters, champagne rules, and photographic storytelling in one long document. Latest user pins: .qa/inspiration-0068.jpg and .qa/inspiration-0071.jpg. No separate comp was approved for this request. The earlier .impeccable/mocks/champagne-ribbon-procession.png is historical, not current authority.

The first viewport is a pair of sculpted ivory-and-gold doors with only Tap to open, no names or seal. Separate arched door panels hinge at the jambs while the floral surround stays stationary; the camera then advances through the doorway. The 4.8-second sequence reveals names only on arrival at the welcome. Skip is available during playback or keyboard focus; Escape, footer replay, focus containment, and instant reduced-motion opening are supported. The underlying six sections remain one naturally scrolling document. Without JavaScript the hidden entrance is bypassed. Scratch foil and automatically drawn Avenra architecture remain the other signature interactions.

## Section inventory

| Section | Current expression and behavior |
| --- | --- |
| Welcome | Full-height floral courtyard, calligraphic names, confirmed date and venue, native anchor cue. |
| Invitation | Couple background with visible lead-in, outlined translucent invitation letter, three framed sample photographs and disclosure. |
| Date | Scratch foil, keyboard/tap reveal, Google Calendar, downloaded iCalendar, countdown, pending ceremony time. |
| Agenda | Five proposed acts, each with time to follow, and explicit proposed-programme disclosure. |
| Venue | Automatic 6.5-second centerline drawing, finished engraving, replay, actual-photo toggle, Google Maps directions and place link. |
| RSVP | Name, attendance, guest count, optional note, prepared reply, copy control, no-send/no-store disclosure. |

## Layout and behavior

All six sections participate in ordinary document scrolling. No fixed book, wheel interception, page turn, or inactive hidden section exists. At 700px the agenda and calendar controls stack and spacing tightens. The gallery retains three columns with a taller center image. Reduced motion removes decoration and resolves venue drawing immediately. Without JavaScript the date, six sections, and directions remain readable; interaction-only controls are hidden.

## Shipping assets and provenance

- assets/garden-interior.jpg and assets/garden-interior-mobile.jpg: reused floral courtyard artwork.
- assets/gallery-garden.webp: sample background and center photograph.
- assets/couple-portrait.png and assets/gallery-dance.png: flanking sample photographs.
- assets/avenra-lineart-transparent.png: finished engraving; avenra-strokes.js supplies centerline paths.
- assets/avenra-original.png: actual venue photograph supplied by the user.
- assets/fonts/greatvibes.ttf, italiana-regular.ttf, and manrope-regular.ttf: local typography.
- assets/materials/brass-seal-512.png: favicon only.

Preserve original asset records, including assets/garden-art-provenance.json, .qa/pre-garden-DESIGN.md, and recoverable .impeccable/archive/superseded-assets history. No new generation or comp approval is implied by reuse. garden.css, grand.css, and garden.js are historical and are not loaded.

## Validation and verdict

.qa/scroll-check.cjs passed four viewport sizes without reported errors or horizontal overflow; offline, reduced-motion, and no-JavaScript checks retained all six visible sections. .qa/scroll-interactions.cjs passed scratch, venue drawing, and actual-photo toggle checks in Chrome and Edge. Independent review of six sampled screenshots reported no material visual finding and requested this stale surface brief be refreshed. Final reviewer verdict: ship the demo once documentation is updated; no implementation or timing changes required.

Detector results were advisory champagne-shade findings in degraded regex mode, not a full parser verdict. No physical iOS/Android or Safari test was performed.

## Remaining launch inputs

Replace sample photographs, confirm ceremony time and final programme, and connect the RSVP delivery destination before using this as the final guest invitation. These are unsupplied future inputs, not omitted supplied facts.
