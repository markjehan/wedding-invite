# Wedding Invitation Surface

## Scope and mode

- Target: `index.html`
- Mode: Experience
- Mobile-first single-page digital wedding invitation shared directly with guests.

## Audience, job, action, content, constraints

- A named guest opens a message link, experiences the invitation, checks when and where to arrive, and responds.
- Confirmed content: Naveen & Dulanjani, Avenra Gardens Hotel, No. 22 Negombo–Giriulla Road, Negombo.
- Placeholder content still to replace: wedding date, couple photos, guest names, and live RSVP destination.
- Required content: opening ritual, personalized greeting, countdown, couple portrait and gallery, evening schedule, scroll-drawn venue, directions, RSVP, music control.
- Static HTML/CSS/JS, responsive, keyboard accessible, reduced-motion safe. RSVP creates a prefilled message; no demo backend is implied.

## Chosen direction and memorable moment

- Direction: Champagne Ribbon Procession — an heirloom stationery case whose woven gold ribbon binds a sequence of layered ivory invitation leaves.
- Approved comp: `.impeccable/mocks/champagne-ribbon-procession.png` (the selected Ribbon Procession recomposed to the user's supplied ivory/champagne stationery palette, names, and Avenra Gardens architecture).
- Memorable moment: the visitor breaks the brass seal; the cotton-paper doors part, the champagne ribbon unspools, and Avenra Gardens is progressively drawn as the guest scrolls.

## Sampled palette

- Warm off-white cotton stock: `#EEE6D8`
- Bright paper highlight: `#FAF6EC`
- Champagne gold: `#B49A68`
- Antique foil shadow: `#745C32`
- Warm charcoal type: `#2F2B25`

## Comp grammar and inventory

| Ingredient | Commitment | Medium |
| --- | --- | --- |
| Opening case | Full-viewport, two warm off-white embossed cotton-paper doors and a central champagne seal; no generic header | Semantic HTML/CSS/SVG |
| Brass seal CTA | 102–148px dimensional medallion; activation ripples, breaks, then physically parts the case | Generated transparent raster in an accessible HTML button |
| Ribbon spine | 54–86px champagne woven strip with double light stitch; chapter numerals remain attached | Generated moiré raster + sticky HTML navigation |
| Paper leaves | Layered deckled ivory and deeper champagne-toned sections with shallow physical overlap | Generated paper texture + semantic sections + CSS masks |
| Type | Narrow high-contrast engraved display; compact uppercase body labels; 4.5–6.5x display/body scale | Webfont with resilient serif/system fallbacks |
| Portrait locket | One dominant 1:1 couple portrait in an oval brass setting | Generated raster in HTML frame |
| Gallery | Three supporting editorial wedding photographs, cropped circles/arches | Generated rasters in HTML frames |
| Countdown | Four large numerals aligned to the invitation ruling | Semantic time group + JavaScript |
| Schedule | Four acts along one ruled line; no rounded cards | Semantic ordered list + CSS linework/SVG icons |
| Venue | Pinned scroll scene progressively revealing the supplied Avenra Gardens elevation as gold linework | Generated raster derived from supplied photo + semantic address/link + scroll JavaScript |
| RSVP | Wide woven champagne pull-tab; interaction reveals compact attendance form in the same leaf | HTML form/disclosure + JavaScript |
| Music | Small fixed brass control, never competing with the seal | Accessible button + Web Audio generated tones/fallback silence |

## Shipping asset inventory

- `assets/materials/brass-seal.png` — focal opening seal.
- `assets/materials/paper-pearl.png` — ivory cotton-paper material used at full strength across the case and leaves.
- `assets/materials/ribbon-moire.png` — woven champagne ribbon texture, recolored in the browser while preserving its stitch and weave.
- `assets/venue-avenra-engraving.png` — faithful gold-line Avenra Gardens drawing derived from the supplied venue photograph.
- `assets/deckle-mask.svg` — one reusable irregular alpha edge shared by every paper leaf.
- `assets/couple-portrait.png`, `assets/gallery-dance.png`, `assets/gallery-garden.png` — temporary editorial couple imagery, explicitly labeled as placeholders.
- Superseded burgundy/material experiments are preserved recoverably under `.impeccable/archive/superseded-assets/` and are not referenced by the shipped page.

## Unresolved decisions

- Replace the placeholder wedding date, couple photographs, guest list, and live RSVP destination before deployment.
