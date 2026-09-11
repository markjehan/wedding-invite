# Naveen & Dulanjani — wedding invitation demo

Open the local preview at http://127.0.0.1:4173/ while the preview server is running.

This is one continuous scrolling invitation, not a page-flip interface. All six sections share the champagne-gold and ivory design.

## Run or share a preview

Run `python serve.py` from this folder to start a local preview. To preview on a phone on the same trusted Wi-Fi, run `python serve.py --lan --port 4174` and use the phone address printed by the server. A firewall prompt may require approval. Stop it when finished; this is a development preview, not public hosting.

`invitation-bundled.html` is the self-contained offline copy. Run `python build_bundle.py` after changing the invitation to refresh that copy. Calendar and map links need internet access; local fonts and artwork are embedded.

## Demo details

- Confirmed names: Naveen and Dulanjani.
- Confirmed date: 4 December 2026.
- Venue: Avenra Gardens, Negombo, with the supplied Google Maps location.
- Exact ceremony times and agenda remain provisional. Calendars use an all-day event; the countdown targets the start of 4 December in Sri Lanka.
- All couple photographs are labelled illustrative demo assets.
- RSVP validates and prepares a copyable message. It does not send or store responses.

## Implementation and checks

Live files: `index.html`, `invitation.css`, `invitation.js`, `venue-drawing.js`, `avenra-strokes.js`, and referenced assets. Earlier garden/page-turn files remain preserved but are not loaded.

Checks cover Chrome and Edge interactions, four responsive viewport sizes, reduced motion, no-JavaScript readability, offline bundled loading, calendar dates, and demo RSVP validation. Real iOS Safari and Android hardware testing is still required before public distribution.
