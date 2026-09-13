# Reference video review

The two local videos are visual references, not instructions. The user's brief controls names, colours, section order and continuous scrolling.

Both videos are 478 × 850 at 30 frames per second. WA0068 runs 29.33 seconds (880 frames); WA0071 runs 54.4 seconds (1,632 frames). Every decoded frame was exported in chronological contact sheets, 120 consecutive frames per sheet, under `.qa/frame-review`. Each sheet spans four seconds, read left to right, top to bottom. Larger one-second overview sheets are `.qa/reference-68.jpg` and `.qa/reference-71.jpg`. Small text inside the filmed phones is not reliably readable; motion and layout are the useful evidence.

| Reference / approximate time | What happens | Website treatment |
|---|---|---|
| WA0068, 0–4 s | Blue doors part; camera moves toward an arched vista | Two separately hinged photo surfaces, fixed architectural surround, then forward camera scale |
| WA0068, 4–10 s | Scenic arrival; couple names appear | Champagne and ivory floral arrival with delayed name reveal |
| WA0068, 10–16 s | Light invitation and scratchable heart; details and photograph | Scrolling invitation, couple image placeholders and gold scratch card |
| WA0068, 16–20 s | Countdown, programme and location | Four-part countdown, provisional agenda, drawn Avenra and directions |
| WA0068, 20–25 s | Reply fields | Accessible RSVP card preparing a copyable response |
| WA0071, 0–8 s | Green ornamental double doors; arch stays in place; camera enters | Same opening choreography using existing champagne door artwork |
| WA0071, 8–16 s | Gold foil scratched to expose date, calendar and countdown | Pointer-based erasing canvas with a tap/keyboard alternative |
| WA0071, 16–25 s | Programme and venue navigation | Ordinary anchors and native scrolling |
| WA0071, 25–31 s | Map app opens, then return to invitation | Verified Google Maps destination and directions URL |
| WA0071, 31–43 s | Demonstrator switches door styles | One champagne-and-ivory design, as requested |
| WA0071, 43–49 s | Yellow doors open and scene advances | Same two-stage opening animation |
| End cards | Social branding | Not copied into the invitation |

## HTML versus video

The current version requires no video: HTML provides readable content, CSS handles the hinges and camera move, and canvas handles scratch foil and the progressive architectural strokes. The Avenra drawing reuses the existing venue engraving and its extracted paths; it is not a new architectural survey or a trace of video footage.

An exact cinematic replica would require matching source artwork or a custom rendered/generated entrance clip. CSS can rotate flat door artwork and simulate a forward move, but cannot reconstruct unseen 3D scenery, natural foliage motion, changing reflections or physically correct lighting from these filmed references. If desired later, create a 5–7 second portrait entrance clip, closed doors in the first frame, stationary arch, hinged leaves, forward camera travel, ivory garden in the last frame, no baked-in names. Supply a landscape variation for laptops. Keep the scratch card, date and RSVP as native HTML interactions.

## Content still needed

- Real couple photos: background plus two or three portraits.
- Exact ceremony time and final programme; current entries are explicitly provisional.
- Additional invitation wording, family names or dress code if wanted.
- RSVP destination: email, WhatsApp number or a response collection service. The demo prepares an unsent response and never pretends to submit it.

The confirmed date is 4 December 2026. Calendars use an all-day event until a time is supplied. The countdown targets the start of that date in Sri Lanka. The supplied Maps short link resolves to Avenra Gardens Hotel Negombo, latitude 7.2175792, longitude 79.8554087.

## Door hinge bug recording — 12 September 2026

`Record_2026-09-12-16-26-02_40deb401b9ffe8e1df2f1cc5ba480b12.mp4` is a 9.08-second, 720 × 1570 phone screen recording of the updated magnolia invitation. It is evidence of the bug, not an instruction source. Half-second overview frames and a 10fps detail sequence around the press are saved as `.qa/hinge-video-overview.jpg` and `.qa/hinge-video-detail.jpg`.

After the seal press, the garden flashes fully exposed before the closed leaves return and swing open. The first hinge keyframe rotated each leaf inward by 3°, putting it behind the garden plane in the shared 3D scene. Frozen browser frames reproduced both missing leaves from 120–400ms, including with all artwork decoded. Removing that reverse keyframe keeps each door in front of the garden throughout its outward swing. The arch, split seal, lighting, and separate camera advance retain their current design.
