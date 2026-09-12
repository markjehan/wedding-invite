# Naveen & Dulanjani — wedding invitation demo

The current design uses a newly generated ivory magnolia and champagne artwork suite throughout the opening and all six sections. `magnolia.css` extends the base styles. Artwork originals, optimized assets, and the complete built-in ImageGen prompts are saved in `assets/magnolia-suite/`. After changing either stylesheet, rebuild the offline copy with `python build_bundle.py`.

Open the local preview at http://127.0.0.1:4173/ while the preview server is running.

This is one continuous scrolling invitation, not a page-flip interface. All six sections share the champagne-gold and ivory design.

## Run or share a preview

Run `python serve.py` from this folder to start a local preview. To preview on a phone on the same trusted Wi-Fi, run `python serve.py --lan --port 4174` and use the phone address printed by the server. A firewall prompt may require approval. Stop it when finished; this is a development preview, not public hosting.

`invitation-bundled.html` is the self-contained offline copy. Run `python build_bundle.py` after changing the invitation to refresh that copy. Calendar and map links need internet access; local fonts and artwork are embedded.

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
- Confirmed date: 4 December 2026.
- Venue: Avenra Gardens, Negombo, with the supplied Google Maps location.
- Exact ceremony times and agenda remain provisional. Calendars use an all-day event; the countdown targets the start of 4 December in Sri Lanka.
- All couple photographs are labelled illustrative demo assets.
- RSVP validates and prepares a copyable message. It does not send or store responses.

## Implementation and checks

Live files: `index.html`, `invitation.css`, `magnolia.css`, `invitation.js`, `venue-drawing.js`, `avenra-strokes.js`, `assets/audio/invitation.mp3`, and referenced assets. Earlier garden/page-turn files remain preserved but are not loaded.

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
