---
name: Naveen & Dulanjani — The Ivory Garden
description: One champagne-gold and off-white invitation with continuous native scrolling.
colors:
  paper: "#f7f2e8"
  light: "#fffcf5"
  gold: "#ac8b51"
  ink: "#58452c"
  muted: "#776247"
  action: "#796035"
  line: "#cab991"
typography:
  display:
    fontFamily: "Symphonie, cursive"
    fontWeight: 400
    fontSize: "clamp(72px,7.6vw,104px)"
    lineHeight: 1.02
  headline:
    fontFamily: "Calligraphy, cursive"
    fontWeight: 400
    fontSize: "clamp(44px,5vw,66px)"
    lineHeight: 1.2
  numeral:
    fontFamily: "Zaslia, serif"
    fontWeight: 400
    fontSize: "60px"
    lineHeight: 1.2
  prose:
    fontFamily: "Italiana, serif"
    fontWeight: 400
    fontSize: "24px"
    lineHeight: 1.55
  body:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 400
    fontSize: "15px"
    lineHeight: 1.8
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.light}"
    padding: "12px 23px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "12px 23px"
---
# Design System: The Ivory Magnolia Garden

## Current artwork suite

The latest user instruction extends the entrance theme through the entire invitation. `assets/magnolia-suite/` is the current visual authority: newly generated magnolia-relief doors, matching landscape and portrait garden arrivals, and embossed botanical stationery. Fine champagne stems, magnolia flowers, cream roses, matte ivory relief, and pale paper recur across every section. `magnolia.css` is loaded after the base stylesheet and owns this suite's typography refinements, page backgrounds, photo mats, date stationery, programme, venue surround and reply letter. Earlier entrance artwork is preserved but not loaded.

The rectangular door leaves use exactly aligned regions of the new doors image; the arch stays stationary. The garden continues the same architectural materials. Later sections use lighter botanical paper to keep long text and forms legible. The actual Avenra drawing and real-venue photo remain factual venue content within the decorative suite. Couple images remain disclosed placeholders. All four generated original PNGs and compressed WebP assets are saved with their full prompts in `assets/magnolia-suite/PROMPTS.md`.

## Timing

The invitation has a score, and it is the timing authority. The chosen recording runs at a fixed
100bpm, so a beat is 0.6s and a bar 2.4s, and every duration in the interface is a whole number of
one or the other. Before this, each animation had picked its own interval — 0.55s here, 0.62s and
0.72s and 0.78s there, staggers of 55, 60, 65, 70, 80 and 90ms — so nothing agreed with anything
else. Now the reveals fade in a beat and move in a beat and a half, cascades step by a sixteenth and
never run longer than a beat, the foil sheen and the scroll cue breathe on the bar, and the venue
drawing takes three of them.

The entrance is the piece that matters most. The recording opens with two bars of thin texture
before the full arrangement enters, and the door sequence is two bars long: three beats of swing,
five walking through. The guest arrives in the garden on the downbeat the arrangement lands on.

Sound starts on the seal press and only on the seal press. A control in the masthead stops it, and
that choice is remembered. It plays quietly on purpose: the supplied recording is a -14.6 LUFS
commercial master, and the invitation holds it to -29.1 LUFS — present enough to hear in a quiet
room, far enough back that reading is never a competition with it. That figure is a ceiling rather
than a default, and half of it is baked into the asset so nothing can undo it by accident. Nothing in the invitation depends on the music playing: with it muted, or
on a browser that will not play it, every duration above is still what it was, just uncounted.

## Overview

**Creative North Star: "The Ivory Garden"**

One continuous invitation pairs floral garden imagery with champagne linework and off-white stationery. Calligraphic names, framed photographs, and softly lifted letters create a ceremonial but readable demo. The user's latest request replaces page flips with native scrolling; no separate comp was approved for this new composition.

**Key Characteristics:**

- One champagne and off-white template.
- Calligraphic names and framed photographic storytelling.
- Native scrolling with optional scratch foil and architectural drawing.

## Colors

Warm ivory dominates. Champagne accents belong to names, architectural strokes, and active controls. Deep warm ink carries readable text; the darker action tone supports white button lettering. Photography retains its natural colors as content, not as a new UI palette.

## Typography

Pinyon Script, hosted locally as `Script`, is reserved for the two names — the welcome, the letter's centrepiece, the crest's initials and the foil stamp. It is the invitation's only script voice: the letter's sentiment line and the closing names step back into Italiana so nothing competes with the names. It was chosen over Symphonie Calligraphy after a rendered side-by-side of six faces: it is a true engraved copperplate with distinctive capitals, it does not overrun its advance width the way Symphonie's swashes did, and it is OFL rather than personal-use-only. Every ampersand in a name lockup is Italiana, never the script, so the two names stay the only script on the page. Julius Sans One carries the ceremonial figures: the hero date, the revealed day, and the countdown. It is an art-deco sans, and the deliberate contrast against three serif/script faces is what makes the figures read as figures. It was chosen from a rendered sheet of eighteen candidates after two misses in the other direction — Zaslia's hairlines vanished at countdown size, Prata had weight but too little contrast to feel elegant. Its geometric caps also sit naturally beside Italiana. Great Vibes, locally hosted as Calligraphy, remains on section headings. Italiana supplies invitation prose, the ampersands, and small-caps detail. Manrope supplies labels, controls, and forms. Mobile form inputs use 16px text to avoid focus zoom.

Every face is OFL: licences ship beside the files as `assets/fonts/PinyonScript-OFL.txt`, `assets/fonts/JuliusSansOne-OFL.txt` and `assets/fonts/GreatVibes-OFL.txt`. There is no personal-use-only restriction on this project.

## Entrance performance

The door swing must start within a frame or two of the press. Three things were making it stall, and all three are easy to reintroduce:

1. The `<link rel=preload>` pointed at `assets/entrance-v2/doors.webp` while the CSS drew `assets/magnolia-suite/doors.webp`. The real entrance art was never preloaded and a legacy file was downloaded for nothing. The three images the doors actually use are now preloaded, two at `fetchpriority="high"`; they start at ~64ms and finish by ~780ms, before the page is interactive.
2. The document sat at `visibility:hidden` behind the entrance and flipped to visible on the same class change that started the animation, so the whole page laid out and painted on frame one of the swing. The entrance is opaque and covers the viewport, so the page now paints underneath it at load instead; `inert` still holds accessibility and `overflow:hidden` still holds scroll.
3. `will-change:transform` was applied only by `.opening`, so the compositor promoted the camera and both leaves at the moment the animation began. It is now set up front on the elements themselves, which only exist during the entrance anyway.

Fix 2 has a consequence worth understanding before touching any of this: because the document now paints behind the entrance rather than being hidden, anything that promotes `.door-intro` to a new layer mid-press shows the page straight through the closed doors for one frame — it reads as the open door flashing before the swing. The dissolve is an opacity animation added with `.opening`, which does exactly that, so `.door-intro` carries `will-change:opacity` up front and `.door-leaf::before` carries it too. Those two declarations are load-bearing, not micro-optimisation: remove either and the flash returns.

The swing additionally waits on a JS `decode()` of the same three images, so it can never begin part-way through a decode; the seal takes a pressed state immediately, keeping the press readable as instant. Measured after the fix: press-to-swing 27–30ms, median frame 16.6ms.

The 12 September phone recording exposed a separate geometry bug: the doors vanished, returned shut, and then opened. With `preserve-3d`, the initial 3° inward nudge sent both leaves behind the room's z=0 plane. Pausing the animation at 120, 200, 266 and 400ms reproduced the occlusion even with fully loaded artwork; it was not a decode delay. The hinge keyframes now move only outward (left 0° to −81°, right 0° to +81°), keeping the free edges in front of the room. Preserve that direction: preload and layer promotion cannot fix a door rotating behind the backdrop. The 114ms seal acknowledgement, 1.9s hinge stage and subsequent camera move remain intact.

The sequence is now two strictly sequential stages rather than one blended 4.8s move, which is also how it was asked for: shut, then the swing, then the opened scene coming towards you. Stage one runs 0–1.8s with the camera pinned at `scale(1)` while only the leaves turn; the last 10% of the hinge fades the two remaining 81° slivers and takes them out of rendering with `visibility:hidden`. Stage two runs 1.8–4.8s on a delayed `walk-through`, so the camera advances 1× to 4.8× with no leaf layer left in the scene — nothing has to be rasterised at seventeen times its natural size mid-move. Keep the two stages disjoint; overlapping them reads as one muddled gesture and puts the leaves back under the camera's scale.

Two smaller guards support the same thing. `.door-room` is `visibility:hidden` until 6% of the hinge, so during the closed hold the only thing behind the leaves is the camera's own closed-door art in exact registration: anything that goes wrong with a leaf while the doors are shut reads as a closed door rather than as the invitation already open. And `.door-leaf` declares `transform:rotateY(0deg)` in its base rule so a leaf never takes its first transform matrix on the same class change that starts the hinge. Neither of these cured the vanishing leaves — the rotation direction did — but both narrow what a future mistake can look like.

## Layout

Six sections occupy one ordinary document flow: welcome, invitation and three photographs, scratch date and calendars/countdown, agenda, venue, and RSVP. The welcome fills the small viewport height. Sections use 95px vertical and 7% side padding within 1600px; at 700px they use 65px and 24px. The agenda and calendar actions stack on phones; the three-photo gallery retains three columns and a taller center photograph. A fixed ivory masthead provides ordinary anchors and marks the section currently being read. Wide screens adjust at 1600px; desktop heights below 650px receive a taller welcome. No section is gated or independently paginated.

## Elevation & Depth

Depth comes from separate opening-door planes, stationary architectural surround, recessed courtyard, translucent invitation letter, framed photographs, and a shared soft paper shadow. The closed entrance carries no buttons at all: a brass wax seal straddles the door join, and pressing it is the only invitation to enter. Each half of the seal lives inside its own leaf, so the seal breaks and parts with the doors rather than being animated separately. The leaves are genuinely dimensional: the camera carries `transform-style: preserve-3d` at 950px perspective, each leaf has a perpendicular strip at its free edge that shows the door's thickness as it turns, and a warm shading plane darkens the face as it swings out of the light. The hinge stops at 81°, not 88°, so that edge stays visible instead of going flat-on. A press anywhere on the doors also opens them; Escape skips the sequence, the seal's accessible name says so, and reduced motion bypasses the entrance entirely. The 4.8-second sequence hinges the two rectangular door leaves at their jambs, then advances the camera through the arch and reveals the welcome names. No page-turn navigation remains. The exact paper shadow value is recorded in the sidecar.

## Shapes

An arched outline frames the welcome. Thin champagne outlines connect rectangular invitation paper, photo mats, and the reply letter. Agenda nodes are small diamonds on a vertical rule. Form fields use square corners and bottom rules.

## Components

- Welcome: full-height floral courtyard, centered names, confirmed date and venue, and native scroll anchor. No opening ritual blocks reading.
- Navigation: ordinary anchors in a fixed masthead. Mobile hides the first navigation item to preserve space. All sections remain visible in document flow.
- Buttons: solid warm action fill or transparent secondary, 50px minimum height. Hover darkens the primary or tints the secondary. Focus uses a 2px action outline and 5px offset. Underlined text actions have 44px minimum height.
- Invitation: a visible background-photo lead-in precedes the letter. The letter is pressed stationery — outline plus an inner hairline frame, a tracked small-caps opening line, the names set large in Symphonie with the ampersand as a centred ornament between them, a place line held between tapered gold rules, and the brass wax seal pressed at its foot. The date and ceremony time are deliberately absent: the foil card owns that reveal. Three framed sample photographs and a disclosure follow.
- Closing: two linked bands drawn as one open path — the left band breaks where the right passes in front, so they read as interlocked without relying on paint order. They draw themselves in on reveal, and the names sit small and tracked beneath them in Italiana.
- Scratch date: an arched die-cut keepsake, not a gold slab. The card and its revealed face both carry the site's dome, echoing the welcome frame and the couple photograph. The foil is pale champagne on pearl, engraved with a fine guilloche lattice, ruled with two arched pressed lines that follow the die-cut, and struck with the house crest itself — the same magnolia, wreath and initials that mark every section, drawn from the symbol's own path geometry with `Path2D` rather than a bitmap, so it stays a hairline engraving at any card size and erodes with the leaf as it is scratched. A specular sheen sweeps the unscratched card and retires the moment a guest starts. Pointer scratching and a separate keyboard-accessible reveal both work; on reveal the date blooms once in warm gold. The date is also printed outside the interaction and remains readable without JavaScript.
- Calendar/countdown: Google Calendar and downloadable iCalendar save the confirmed date as an all-day event until time is confirmed. Four ruled numerals count down to midnight in Sri Lanka.
- Agenda: five proposed acts with each time explicitly pending.
- Venue: 6,118 centerline paths extracted from the existing Avenra engraving are rendered progressively to canvas over 6.5 seconds, then resolve to the detailed raster artwork. This is a traced engraving, not live tracing of the original photograph. Replay and original-photo toggle remain available. Reduced motion shows the finished image.
- RSVP: full name, attendance choice, optional note. No guest count. Submitting composes the reply and offers it to WhatsApp and to the mail client as well as the clipboard. `RSVP_WHATSAPP` and `RSVP_EMAIL` at the top of that block in invitation.js are the only things to fill in when the couple supply a number and address; left blank the links still work, opening the app with the message written so the guest picks the recipient. Nothing is stored, and the copy says so.
- Motion: restrained entrance animation, scroll cue, scratch fade, and venue drawing decorate visible content. Past the welcome, every section reveals on scroll — headings, letter lines, photographs, countdown numerals and form rise or settle into place, staggered within each group. The programme highlights the act nearest the middle of the viewport: its diamond fills and enlarges, its panel lifts onto a lighter ground, neighbouring acts soften, and the champagne connector draws downward as each act is passed. A hairline progress rule sits on the masthead edge and the invitation photograph pans gently inside its own frame. Timing is the load-bearing part. Reveals fire as an element's top reaches the lower edge of the viewport, resolve in about 0.7s, and stagger in steps of 55–90ms capped at the sixth item. An earlier build triggered at 88% of the viewport with up to 665ms of stagger on a 0.95s transition, which left half-empty cards on screen for well over a second at normal scroll speed and read as broken rather than graceful; if these numbers are ever lengthened again, re-test by scrolling at roughly 460px/s and confirming nothing above the middle of the viewport is still below full opacity. Reveals run in both directions: an element that has fully left the viewport is re-armed to return from whichever side it went out, carried by a `--dir` custom property that flips the sign of the travel and the card tilt. The reveal boundary pre-triggers on both edges (35% above, 4% below) because coming back up an element enters from the top and would otherwise only start once its foot cleared the edge; the re-arm boundary sits well outside both, since without that hysteresis it flickers at the threshold. `--dir` is read from a live `getBoundingClientRect`, not the observer entry's snapshot, which a fast jump can deliver stale. Text and cards resolve out of a soft focus — a blur that clears as they settle — while large media only scales, keeping the blur cheap. The three big cards (foil, venue drawing, reply) tilt up out of the page on a real `rotateX` under perspective. Each section divider draws its own hairlines in, the countdown rolls a numeral whenever it changes, and magnolia petals drift over the whole document once the doors are open, tying the sections into one garden. Reduced motion, or a browser without the individual `translate`/`scale` properties, receives the whole document at rest with nothing hidden, no petals and no sheen. Reveals use `translate`/`scale` so existing `transform` tilts survive. No wheel or page-flip controller is used.
- Crest: one drawn mark carries the identity everywhere — a five-petal magnolia over an open wreath of leaves, with the initials engraved inside the wreath. It is the same `#crest` symbol in the masthead and above every section, only at two sizes; earlier the masthead and the divider were two different marks, which read as an inconsistency. Its hairlines draw themselves in on reveal. The two initials are positioned by measured ink, not advance width: Pinyon's N carries a trailing swash that runs to 1.39em against a 0.72em advance, so advance-based centring throws the pair off the wreath's axis and a tightly-set ampersand lands inside the swash. The gap between the initials is sized to hold the ampersand clear, and the ampersand is lifted above the baseline so the swash passes beneath it. The ampersand is required — do not remove it to solve a spacing problem; widen the gap instead.
- Seam: the marble arrival dissolves into the stationery through a gradient at the foot of the welcome, and the invitation's botanical border eases in under a mask rather than starting at a hard edge. The closing does the same in reverse: its garden imagery sits on the pseudo-element so a mask can fade it up from the paper — masking `.closing` itself would fade the rings and the names with it — and the extra top padding keeps them clear of the fade.

## Do's and Don'ts

- Do preserve the confirmed names, venue, gold/ivory palette, and truthful demo labeling.
- Do preserve the confirmed date, 4 December 2026, and continuous native scrolling.
- Do retain three disclosed sample photographs and actual venue evidence.
- Do confirm times, final agenda, real photographs, and RSVP destination before real distribution.
- Keep the opening doors as a separate entrance before natural scrolling; do not restore fixed book stages or page-flip navigation.
- Don't treat the historical ribbon comp as approval for the current composition.
- Don't describe emulated browser checks as physical iOS/Android certification.
- Don't treat raster mask wipes as literal line tracing.

Implementation: index.html, invitation.css, invitation.js, venue-drawing.js, avenra-strokes.js. Historical garden.css, grand.css, and garden.js are not loaded. Existing asset provenance remains alongside original assets, including assets/garden-art-provenance.json; the older design record remains at .qa/pre-garden-DESIGN.md. User venue photo: assets/avenra-original.png. Current QA: .qa/scroll-check.cjs and .qa/scroll-interactions.cjs. Current reference authority and validation limits are recorded in .impeccable/surfaces/index-html.md.


## Reference comparison — 12 September 2026

All frames of the two supplied MP4 references were exported as consecutive contact sheets and inspected for opening, scratching and navigation choreography. See VIDEO-REVIEW.md for the timed breakdown and limits of matching a filmed 3D scene with flat artwork. The entrance now uses assets/door/door-scene.jpg as its single aligned source; only rectangular door leaves rotate, preserving the arch. Reduced motion and direct section URLs bypass the entrance. The source is split into HTML/CSS/JS again, and the offline bundle is regenerated from those same files.
