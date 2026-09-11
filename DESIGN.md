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
    fontFamily: "Calligraphy, cursive"
    fontWeight: 400
    fontSize: "clamp(72px,8vw,112px)"
    lineHeight: 0.9
  headline:
    fontFamily: "Calligraphy, cursive"
    fontWeight: 400
    fontSize: "clamp(44px,5vw,66px)"
    lineHeight: 1.2
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
# Design System: The Ivory Garden

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

Great Vibes, locally hosted as Calligraphy, supplies names and short expressive words. Italiana supplies headings and invitation prose. Manrope supplies labels, controls, and forms. Mobile form inputs use 16px text to avoid focus zoom. Small demo captions are disclosure metadata, not a reusable body-text standard.

## Layout

Six sections occupy one ordinary document flow: welcome, invitation and three photographs, scratch date and calendars/countdown, agenda, venue, and RSVP. The welcome fills the small viewport height. Sections use 95px vertical and 7% side padding within 1600px; at 700px they use 65px and 24px. The agenda and calendar actions stack on phones; the three-photo gallery retains three columns and a taller center photograph. An absolute masthead provides ordinary anchors. Wide screens adjust at 1600px; desktop heights below 650px receive a taller welcome. No section is gated or independently paginated.

## Elevation & Depth

Depth comes from separate opening-door planes, stationary architectural surround, recessed courtyard, translucent invitation letter, framed photographs, and a shared soft paper shadow. Only Tap to open is visible on the closed entrance; names and seal are removed. The 4.8-second sequence hinges the two masked panels at their jambs, then advances the camera through the arch and reveals the welcome names. No page-turn navigation remains. The exact paper shadow value is recorded in the sidecar.

## Shapes

An arched outline frames the welcome. Thin champagne outlines connect rectangular invitation paper, photo mats, and the reply letter. Agenda nodes are small diamonds on a vertical rule. Form fields use square corners and bottom rules.

## Components

- Welcome: full-height floral courtyard, centered names, confirmed date and venue, and native scroll anchor. No opening ritual blocks reading.
- Navigation: ordinary anchors in an absolute masthead. Mobile hides the first navigation item to preserve space. All sections remain visible in document flow.
- Buttons: solid warm action fill or transparent secondary, 50px minimum height. Hover darkens the primary or tints the secondary. Focus uses a 2px action outline and 5px offset. Underlined text actions have 44px minimum height.
- Invitation: a visible background-photo lead-in precedes a translucent outlined letter; three framed sample photographs and a disclosure follow.
- Scratch date: gold canvas supports pointer scratching plus a separate keyboard-accessible reveal button. The date is also printed outside the interaction and remains readable without JavaScript.
- Calendar/countdown: Google Calendar and downloadable iCalendar save the confirmed date as an all-day event until time is confirmed. Four ruled numerals count down to midnight in Sri Lanka.
- Agenda: five proposed acts with each time explicitly pending.
- Venue: 6,118 centerline paths extracted from the existing Avenra engraving are rendered progressively to canvas over 6.5 seconds, then resolve to the detailed raster artwork. This is a traced engraving, not live tracing of the original photograph. Replay and original-photo toggle remain available. Reduced motion shows the finished image.
- RSVP: native required validation, attendance choice, guest count, optional note, copyable prepared message. No sending or persistence is claimed.
- Motion: restrained entrance animation, scroll cue, scratch fade, and venue drawing decorate visible content. Reduced motion removes transitions and resolves the drawing immediately. No wheel or page-flip controller is used.

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
