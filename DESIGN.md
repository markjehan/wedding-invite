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

The arrival picks the phrase up from there. It runs two and a half bars and is cued six beats into
the door sequence, so the two overlap: the first line is already surfacing while the camera is
still moving, and the invitation finishes introducing itself at exactly four bars from the press.

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

## The arrival

The first screen assembles itself rather than appearing, and the mark leads. It opens **alone**, at
half again its final size, optically centred on an otherwise empty screen: a heavy ring traced
clockwise from the break at its crown with a point of light riding the tip, a hairline inner rule
round behind it, the initials laid down N then & then D, the underswash closing them, and last a
magnolia opening in the break both rules left for it. The finished medallion flares once, then
**travels down** into its resting place, and only then do the words arrive around it — *Welcome to
the wedding of*, the two names written beneath it, and the cue. Nothing is gated on any of it: the
page scrolls from the first frame, and a guest who scrolls away leaves it playing behind them.

The whole figure runs thirteen point two seconds and is cued 3.6s into the door sequence, so the
mark begins drawing as the entrance dissolves and the arrival finishes at sixteen point eight
seconds from the seal press — seven bars exactly.

It is written against the **bar**, not merely the beat, and four moments are pinned to downbeats a
listener can actually hear: the frame closes on bar three, the bloom and the swash finish together
on bar four, the mark lands in its resting place on bar five, the first name is finished on bar six,
and the cue arrives on bar seven. The two names take **a bar each**, three beats apart — the slowest
moves in the figure, because they are the thing the screen is for.
Everything between them is a multiple of a half-beat — the staggers inside a single move included —
and every move overlaps its neighbours, so the figure reads as one long phrase rather than a queue
of separate gestures. Retime it by moving those four anchors first and letting the rest hang off
them; shortening a single move without moving its anchor is what makes it read as hurried.

The order in the document is the order at rest — wording, names, mark, cue — not the order it plays.
The mark's opening position is declared **only inside the `wc-settle` keyframes**, never as a base
rule, and that is load-bearing: the script measures how far the mark has to travel, and it can only
read an honest box while the mark is still sitting untransformed where it belongs. `--crest-lift` is
that measurement, taken in `beginArrival` immediately before `arrived` lands. It is measured rather
than guessed because the distance is most of the height of two lines of script, which is a different
number at every viewport; a small extra lift goes on top, because a lone object at the exact middle
of a tall screen reads as slightly low.

The medallion is written out as inline SVG rather than reusing the `#crest` symbol the other six
sections share. That is the whole reason it exists separately: `<use>` renders into a shadow tree
that only inherits properties, so no stylesheet can address a single petal, and a figure that
assembles in eleven steps needs every stroke individually addressable. The initials keep the
measured-ink placement described under Typography, so the ampersand still sits in the clear gap
rather than inside the N's swash.

## The mark

It is drawn as an engraved plate, and what makes it one is hierarchy rather than ornament. Four
stroke weights: the frame at 1.6, the inner rule at 0.8, the petals at 1.15, the midribs at 0.62 —
and the initials, which are the only *filled* mass anywhere in the mark and a shade deeper than the
linework. Give all of those one shared hairline again, as the first pass did, and the mark collapses
back into clipart however well each part is drawn, because nothing is the subject.

Two rules with a single break between them is the plate device; a second circle at the same weight
would only read as a thicker first one. The break exists so an ornament can sit *in* it rather than
beside it, which is why the bloom is sized to fill the gap exactly and not to float above it.

Beneath the initials is an **underswash** — a filled tapered shape, not a stroked line, because a
copperplate flourish is thick at its belly and a hairline at both ends; a uniform stroke reads as an
underline. It also gives the lower half of the plate something to hold, which the initials alone
left empty. It is a shallow bowl whose two terminals lift back above the belly, and it is narrower
than the initials above it: a first cut that ran their full width, with a straight lens section,
read as a smile drawn under the letters rather than a flourish attached to them.

Two more refinements carry more than their size suggests. The inner rule **ends in a small bead** at
either side of its break — a rule that simply stops looks cut, one that ends in a bead looks
finished. And the bloom's two outer tepals are **recurved**, bending away at the tip the way a
magnolia's actually open, while the three facing front stay cupped; five identical petals radiating
from one point is the thing that reads as an icon no matter how well each one is drawn.

Three things were tried and removed, and they are worth recording so they are not tried again:

- **A laurel running the flanks.** Leaves at even spacing along an arc, parallel to the inner rule,
  read as a chain — a narrow channel of identical links, not a branch.
- **A second spray across the base.** With a crown bloom and flank laurel already present, a third
  ornament left nothing precious. One ornament is what makes the magnolia the jewel.
- **A symmetric five-petal fan** at -52/-26/0/26/52. That is the silhouette of every lotus icon ever
  drawn. The bloom now has five petals of five different lengths and widths at angles that are
  deliberately not a mirror of one another, cupped rather than pointed — the control points pull in
  toward the axis near the tip and out at the waist — with a midrib on the three that face front and
  two sepals tucked beneath.

**The ink fronts rest at the END of their travel**, not the start — `.wc-ink{translate:var(--ink-to)}`
in plain CSS, overridden to `--ink-from` only under `.motion-ready`. Get this backwards and the mask
rects sit entirely left of the glyphs whenever the class is absent, which is exactly the
reduced-motion case, and the initials and swash render invisible inside an otherwise complete
medallion. It is silent, and it does not show up in any state the animation itself passes through.

### One mark, two forms

The mark ships in exactly two forms, and everything on the page is one of them:

- **The medallion** — frame, inner rule, terminal beads, bloom, initials, swash. Inline SVG, hero
  only, 176–214px. It is the form that draws itself.
- **The compact mark** — the same bloom, initials and swash with the frame and inner rule taken off
  and the bloom brought down and up a quarter. This is the `#crest` symbol, used at all six `<use>`
  sites and struck into the wax seal, 48–92px.

The two rules are dropped rather than shrunk for the small form on purpose: 0.8 units in a 200-unit
box lands under half a device pixel below about 130px, so keeping them would mean showing a broken
frame rather than none.

Three things hold the two forms together, and all three are easy to undo by accident:

1. **The symbol is generated from the hero**, not written a second time. Its bloom, letters and
   swash are the hero's own paths at the hero's own coordinates.
2. **The scratch-card foil walks that symbol out of the DOM** and strikes it onto the canvas —
   `walk()` in `paintFoil` reads `d`, the transforms and the weights off the live nodes. Before
   this, the foil carried its own Path2D copy of the crest, and that copy was a whole design
   generation out of date. Never reintroduce a second copy; if the foil needs to change, change the
   symbol.
3. **Weights and faces ride as presentation attributes** with `vector-effect:non-scaling-stroke`.
   `<use>` renders into a shadow tree that only inherits properties, so no stylesheet can reach a
   petal inside it — the same constraint that forced the hero to be written out inline. The
   non-scaling stroke is what makes the 58px mark on the foil read as the same drawing as the 214px
   one in the hero rather than a fainter cousin of it.

The closing carries the mark too, and **draws it** exactly as the first screen does. It is a runtime
**clone of the hero node**, not a third copy of the geometry — which means every id inside it has to
be made unique on the way in (`wc-ink-n` → `wc-ink-n-close`). Share them and both marks share one set
of ink fronts, so the hero's sweep finishes three screens above the closing and the footer's letters
are already written before anyone reaches them.

One set of rules drives both. Each step of the figure names both triggers and reads its base offset
from `--fig`: the hero gets `var(--arrive)` and plays against the door sequence, the closing gets
`0s` and plays against the scroll that reaches it. Two separate blocks would be two things to keep
in step, which is the failure this whole section exists to prevent.

Anything the clone needs must be styled on the mark's own classes, never on `.welcome-crest`. The
letter faces were scoped that way at first and the closing's initials fell back to the browser
default — a silent failure that only shows three screens down.

Weights are measured at the size the mark ships, not the size it is drawn. The viewBox is 200 units
across and it renders at 214px on a laptop and 176px on a phone, so a 0.6-unit rule lands under two
thirds of a device pixel and antialiases away to nothing on the phone. Check any weight change at
the phone size before trusting it at the drawing size.

Two techniques are worth keeping straight. The strokes — ring, rule, midribs — draw with
`stroke-dashoffset` against a hand-measured `stroke-dasharray`; if either path is edited, check
`getTotalLength()` and keep the dasharray just above it, because a dasharray shorter than its path
turns the stroke into beads. The letters and the names are *not* drawn that way: glyph outlines have
no length you can read from script, so each is revealed by a soft-edged ink front sweeping left to
right — an SVG mask inside the medallion, a CSS mask on the two names. The front's travel is set
from each letter's measured `getBBox()`, so it starts the instant it has ink to lay down and ends
the instant that letter is whole.

The whole figure hangs off one custom property and one class. `--arrive` is the lead: the doors hand
over whatever is left of their own run, every path that skips the entrance sets it to zero, and each
step's delay is `calc(var(--arrive) + <its own offset>)`. `body.arrived` starts it, and the replay
button takes it off again. No step is driven from script.

Everything that begins hidden is scoped to `html.motion-ready`, which is now settled at the top of
the script rather than inside the scroll block — one of the paths that skips the doors hides them
synchronously, and a class added after that point would restart the figure part-way through. A
browser that never receives the class, including anyone who has asked for reduced motion, is shown
the finished arrival rather than an empty screen.

The scroll cue underneath it says which way to go. It used to breathe in place, which reads as
decoration; a soft gold mark now falls down the line once every two bars and then rests for the
better part of a bar, which reads as an instruction rather than a pulse. The track is 2px and the
falling mark 4px with a pale halo behind it — ink with a lamp behind it, because on cream paper the
ink is what reads and the halo is what makes it read as *lit*.

That fall is **put on the downbeat**, and seeking is the only way to hold it there. A negative
`animation-delay` lines a loop up at the instant it starts and then lets it drift, because the cue
counts from its own beginning while the score counts from the press. `syncCue` instead sets
`currentTime` on the cue's two animations from the recording's own position, and repeats once a
cycle so the drift between the audio clock and the compositor's never accumulates — measured at
11ms, and 22ms five seconds later, both under or near a single frame. Silence leaves the cue running
free; nothing here depends on the music playing. The mark is ink rather than light on purpose — a white highlight is the obvious choice
and disappears completely against cream paper under a bright garden.

The arrival is a full screen of composition, so its vertical rhythm answers to the height of the
viewport as well as its width: the medallion, the paddings, the two names and the cue's margin are
all `svh`-aware. Without that the cue is the first thing pushed under the fold on a short laptop
window, and the cue is the one thing that has to be visible.

### Inscribing the names

The names are the font's **own outlines**, not live text — extracted from `pinyon-script.ttf` at its
real advances. The face carries no kerning for these pairs, so the outlines land exactly where the
live text used to, to a tenth of a pixel (verified against the browser's own measurement: 215.2px
advance, 69.8px ink height, both matching).

Each name is **written letter by letter**: a hairline of champagne runs the letterform, the next
letter starts before the last has finished, and the ink fills in behind the nib. It is the device
the mark already uses on its own frame, which is the point — the names and the medallion are now
made of the same gesture.

Three details do the actual work, and losing any one of them puts it straight back to *appearing*
rather than *being written*:

1. **The fill is split one path per letter**, and each letter starts inking as the nib is a little
   past halfway through drawing it. A single fill for the whole word means the outlines draw and
   then the ink lands everywhere at once — which is precisely what made the first version read as
   coming to life rather than being written.
2. **The trace easing is `linear`.** An eased trace accelerates and brakes inside every letter, so
   the word pulses along letter by letter. A nib moves at one speed.
3. **A letter's travel is longer than the step between letters** (0.75s against 0.33s and 0.21s), so
   the next letter is under way before the last has finished and the line never stops. And the
   stroke carries **no opacity ramp** — it is there from its first frame and the dash alone reveals
   it, because fading each letter up as it began was a second "appearing" laid on top of the
   drawing.

Three things this replaced, and why:

- **A mask wipe.** A soft-edged band crossing the letters in a straight line never looked like
  writing; it looked like a reveal.
- **A bloom of light riding that band.** A sliding blob sitting on top of the lettering rather than
  belonging to it — a gimmick, and the thing that made the whole entrance read as childish.
- **All the box-padding machinery** the mask needed to stop clipping descenders. The viewBox holds
  the whole glyph, so the `j` problem cannot recur by construction.

Three traps are worth knowing before touching this:

- **`stroke-dasharray` restarts at every subpath.** A single path holding a word's twenty-odd
  contours cannot be traced at all — the whole outline appears the instant the offset clears the
  longest contour, which is exactly what the first attempt did. The contours are therefore split
  into one path each, with `--i` grouping them back into letters for the stagger. The fill stays a
  single path, because per-contour fills would ink the counters solid.
- **The pen line needs a dasharray, not just a dashoffset.** `stroke-dashoffset` does nothing on
  a stroke that has no `stroke-dasharray` to offset. Leave the dasharray off and the full outline of
  both names sits on screen from page load — right across the medallion while it is meant to be
  drawing alone. It is set from the measured `--len`, and the resting offset is a full `--len` too,
  so a trace that never receives its animation stays hidden and the fill alone carries the name.
  This one slipped past frame-by-frame testing because the helper that froze frames set the
  dasharray by hand: check the computed style on a real run, not on a frozen one.
- **The pen must not lift before the ink is under it.** Fading each stroke on its own schedule left
  the first letters of a name with nothing holding them between the pen leaving and the fill
  arriving — they blinked out and came back. The strokes are grouped so the pen lifts off the whole
  name at once, after the fill. Walked frame by frame across the hand-off, no letter drops below
  **86%** once it has begun — with the fill following the nib there is barely a hand-off left to
  botch, which is the other reason per-letter fills are worth the extra paths.

The trace length is measured from each path at load. Guessing a dasharray is what turns a script
into a row of beads, and the outline of nine joined letters is not a number anyone can estimate.

### Keeping the writing smooth

The names are **fifteen letters, each a pair of small SVGs** — one for the ink, one for the pen —
boxed to that letter's own ink, rather than one SVG per name. The split exists for frame rate, and
it is load-bearing.

A pen stroke is drawn by moving `stroke-dashoffset`, which is a paint property: no browser can hand
it to the compositor, so on every frame it changes, the browser repaints the whole SVG it lives in.
With each name in one SVG, a single frame of writing re-rasterised forty-one glyph paths — every
letter's fill and every contour's stroke — on every frame of the animation. Boxed per letter, a frame
repaints only the one to three letters the nib is on. The ink fades are `opacity` on whole SVG
elements, which the compositor runs without repainting anything.

Three smaller things go with it:

- **No `vector-effect: non-scaling-stroke` on the pen.** It holds a hairline at one width for free,
  but it rebuilds the stroke in screen space on every paint, which on curves this dense is
  expensive. The script sets `--pen` to one CSS pixel in the font's own units — 2048 over the
  current em size — and updates it when the viewport changes the type size. It renders at 1.00px.
- **`stroke-opacity`, not `opacity`, on the pen paths**, because opacity on an SVG child can push that
  path into a buffer of its own that is composited back on every repaint.
- **The petals build each gradient once.** They used to create a fresh gradient for every petal on
  every frame, underneath everything else the arrival is doing, for a colour that never changes.

The split changed nothing you can see. Stepping the animation clock gives the same results before and
after, the pen still renders at exactly one pixel, and both names are centred to the pixel at the
same size as the single-SVG version. Merging the letters back into one SVG to tidy the markup is the
change that brings the per-frame cost back.

Frame rate cannot be judged in an embedded preview whose window is behind another: the browser
throttles it to about one frame a second whether anything is animating or not. Judge smoothness in a
real, focused browser window.

## The seal

The wax seal is the same mark, struck. The source art is a photographed brass seal — a scalloped wax
rim, two engraved rules, a ring of beads, and a stock flower in the middle that had nothing to do
with this wedding. `brass-seal-monogram-512.png` keeps everything outside the beads exactly as
photographed and rebuilds only the flat field inside them.

The flower comes out by replacing that field with a **normalised-convolution** blur of itself —
`blur(image × mask) / blur(mask)`. The normalisation is the point: a plain blur drags the bright
beaded ring inward and leaves a halo exactly where the flower used to be. What survives is the
field's own lighting gradient, which is what keeps the rebuilt area reading as the same lit piece of
metal. Then the mark is rendered as a height map and lit from the upper left, the direction the
original relief is already lit from, with an occlusion term so it reads as pressed into the wax
rather than printed on it.

Two things about the strike are worth keeping. The frame and the inner rule are **dropped** — the
seal already owns two engraved rules and a ring of beads, and a third circle inside them reads as
noise; what is struck is the bloom, the initials and the swash. And the emboss blur has to stay
narrower than the thinnest stroke in the mark (σ≈1.35 at 512px), or the script hairlines flatten to
nothing before they are ever lit — the first strike was invisible for exactly that reason.

The builder is `.design`-adjacent scratch work rather than a committed script; the recipe above is
the durable part. The original `brass-seal-512.png` is kept unmodified beside it.

## The closing seam

The closing is the end of the page, not a panel stuck onto it. The reply card's paper texture used
to stop dead at its section's edge, and because that texture is a few percent lighter than the paper
under it, the edge read as a rule drawn across the full width — the one hard line in an invitation
that has none anywhere else.

Both sides now fade over roughly a third of a screen: the section's texture is masked out at its
foot, the garden is masked in over 340px, and the small centred rule that closes every other section
is dropped here, because nothing follows this one and there is nothing to divide it from.

## Phones and Safari

The invitation is checked on phones in two engines: WebKit, which is Safari and also every browser on
an iPhone, at the iPhone 16 Pro's 402×874 viewport at 3x; and Chrome at Android sizes. It is walked
the way a guest walks it — seal, arrival, then a screenful at a time to the footer — plus landscape,
an iPhone SE and a 360px Android. Everything loads in both engines and nothing overflows sideways.
What differed, and what is done about it:

- **Safari styles the inside of a `<use>` copy; Chrome does not.** The small crests are `<use>`
  copies of `#crest`, and their parts carry the medallion's class names. The medallion's "not drawn
  yet" states were written bare (`.motion-ready .wc-petal`), so on an iPhone they reached every small
  crest as well and the magnolia was missing from all of them. Those states are now scoped to
  `:is(.welcome-crest,.closing-crest)`. Any new resting state for the medallion needs the same scope,
  and only WebKit shows the bug: in Chrome the page looks correct either way.
- **An iPhone on silent mutes Web Audio, but not an `<audio>` element.** The score plays through Web
  Audio for its seamless loop, so it was the path that went quiet. Before playing, the page declares
  its sound as `playback` through Safari's Audio Session API where that exists.
- **A touch unlocks sound when the finger lifts, not when it lands.** Safari refuses the wake on
  `pointerdown`, so the context is asked again on `touchend` and `click`. The same check brings the
  music back after iOS parks it as interrupted, when the phone locks or a call comes in.
- **Weight.** The two gallery photographs and the venue photograph were PNGs of 1.7–2.1MB each. They
  are WebP now at full resolution, quality 90, about 42dB PSNR against the originals. The venue line
  drawing and the seal are lossless WebP and pixel-identical wherever they are visible. A full walk
  in WebKit went from 9.3MB to 3.5MB, and the offline bundle from 18.1MB to 10.2MB. The PNG originals
  stay in `assets/`; the favicon is still the PNG.
- **Only first-screen fonts are preloaded** (Pinyon Script for the initials, Italiana for the welcome
  line), and `invitation.js` is listed before the venue's 400KB of stroke data. Deferred scripts run
  in the order they are written, so the seal used to stay dead until that data had downloaded. The
  venue can now reach the screen before its scripts have run, so the request to draw is left on the
  window for `venue-drawing.js` to pick up.
- **The calendar button follows the served `wedding.ics` on an iPhone or iPad** rather than generating
  a download, because Safari opens a served calendar file straight into Add to Calendar.
- **Smaller guards.** `text-size-adjust` stops phones inflating text when turned sideways;
  `color-scheme: only light` keeps Android's forced dark mode off the stationery; the music control
  and the frame line stay clear of the Dynamic Island in landscape; the gallery's hover lift applies
  only where there is a real pointer, because a tap otherwise leaves a photograph stuck lifted.
- **A browser that cannot run the script still gets the invitation.** The doors stay locked until the
  script opens them, so a small inline script at the foot of the page removes them if `invitation.js`
  has not reported in by the time the page has loaded.

Headless WebKit on Windows has no Web Audio, and no emulator has a ring switch, so the audio changes,
and the calendar hand-off, can only be confirmed on a real iPhone.

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
