# The keepsake film for Naveen & Dulanjani

A short upright video (about 1 minute 45 seconds) that Mark and Ashan are giving to Naveen and
Dulanjani, so that years from now they can still watch how their wedding invitation was made and
see the invitation itself, even after the website is gone.

This file is the hand-over for whoever works on the film next. It says what exists, how it is made,
what Mark has asked for, and what is still not right.

**The finished files** (kept on Mark's computer only, never pushed to GitHub or the live site):

- `Naveen-and-Dulanjani-invitation-keepsake.mp4` — full quality, 1080 x 1920.
- `Naveen-and-Dulanjani-invitation-keepsake-whatsapp.mp4` — smaller copy, 720 x 1280, for WhatsApp.

---

## 1. The story the film tells

About 1 minute 51 seconds in all. Mark's limit is 2 minutes.

| Part | About | What is on screen |
|---|---|---|
| Title | 4 s | Their monogram, "A keepsake for Naveen & Dulanjani — How your wedding invitation came to life". |
| How it began | 10 s | Three phone cut scenes: Naveen rings Mark ("We're getting married. Will you make our invitation?"); Ashan, Naveen and Mark on a group call; Naveen sends the details (names, date, venue, photo). |
| The desk | 41 s | One 3D scene, seen over Mark's shoulder, with one cut away to Ashan's phone. Described below. |
| The invitation | 30 s | The real English invitation: seal, doors, names written, portrait drawn, letter, photographs, gold foil scratched, venue drawn, programme, closing. |
| Sinhala | 4 s | The Sinhala names and letter, with a label "Also in සිංහල". |
| Ending | 17 s | Back out to the desk, last words on the call, Naveen's phone sending the invitations from the guest list, then the thank-you card. |

### The desk scene, beat by beat

Mark sits at a desk in black over-ear headphones (he owns Sony XM6). In front of him is his laptop,
which shows Claude. Beyond the laptop is a monitor, where each part of the invitation appears as it is
built, with a checklist ticking off. His phone stands on a stand at his right hand.

1. Mark thinks: "What if their invitation opened like a real door?" He asks Claude. The doors appear.
2. The phone rings: a WhatsApp voice call from Ashan.
3. Ashan thinks aloud, Mark turns the idea over, Claude builds it: the monogram.
4. Cut to Ashan's phone: he wonders what guests will see on WhatsApp, and sends Mark the couple's
   card he made (`assets/couple/naveen-dulanjani-invite.jpg`, the real picture Ashan made).
   Mark dislikes joke captions on their photo: an earlier "meme" version was rejected.
5. Back at the desk: the portrait that draws itself, then Sinhala.
6. Ashan: "Is it done?" Mark: "Almost. Let's look at it together." Ashan: "Wait, let's show Naveen as well!"
7. The call becomes a WhatsApp group call with Naveen. Naveen: "That's our invitation?! Wow."
8. Naveen: "Can every guest see their own name on it?" → guest names.
9. Naveen: "And we need to see who is coming." Mark thinks of a guest list behind it. Claude builds
   the couple's page (the backend): Invited → Sent → Opened → Replied, and guests turning to "Coming".
10. Mark: "It's ready. Go in, see." The camera flies into the monitor and the real invitation plays.

Ending: Naveen: "I love it. Dulanjani will too." Ashan: "Send it!" Claude: "Invitations sent ·
11 November 2026". Cut to Naveen's phone: the guest list, each row pressed "Send", turning to "Sent"
and then "Coming". Card: their pencil portrait, names, date and venue, "Made with love, for the two
of you, by Ashan and Mark", and a small "Built with Claude".

All the spoken lines were written by Claude, not by Mark, Ashan or Naveen. Mark may want them changed.
One request was not understood and is not in the film: "cut scenes for the doctor". Ask Mark what he meant.

---

## 2. What Mark has asked for (in his words, in order)

- A small gift for the couple: how the invitation was built, then the invitation itself.
- The makers' line is **"by Ashan and Mark"**.
- Deliver an **MP4** he can send to Naveen.
- A **3D person** (not flat 2D), ideas popping into his head, **Ashan on a WhatsApp call giving
  ideas**, told like conversations.
- Everything in one desk scene: phone ringing **on the desk, on a stand to the right**; Mark wearing
  **Sony XM6 headphones**; a **laptop for coding and a monitor behind it** where the design comes to
  life; **Claude** shown doing the building.
- At the end **zoom into the monitor**, show the invitation for 20–30 seconds at an even pace,
  English only, with a note that Sinhala also exists. Then zoom out to a thank-you card.
- Length: about 1 minute to 1 minute 30 seconds.
- More thinking from Mark and from Ashan; "Is it done?", "Go in, see", looking together; **bring
  Naveen into a WhatsApp group call** and take ideas from him.
- A part where **the backend is built** (the guest list and the couple's pages).
- **Conversations between Mark and Ashan** must be there.
- An opening where Mark is **away from the laptop and Naveen rings to ask for his invitation**, then
  Ashan, Naveen and Mark get on a call, Naveen sends details, and Mark starts building.
- Cut scenes: **Naveen reading the guest list and sending**, and **Ashan on his phone** with the
  couple's picture he made (the WhatsApp card). No more than **2 minutes** in all.
- **Use the official site, https://naveenwedsdulanjani.com/, not a local server**, and he asked for
  it to be used in Chrome.

---

## 3. What is still not right — read this first

**The invitation footage: fixed on 12 November 2026, but not yet confirmed by Mark.** He said, more
than once, that the invitation in the film did not look like the real site. He was right. It had been
filmed in Playwright's WebKit (an iPhone-style browser), which draws the door scene flat. It is now
filmed in **real Chrome**, set up as an Android phone, from https://naveenwedsdulanjani.com/, and the
doors swing open in depth as they do for guests. Ask Mark whether it now matches what he sees.

**How to film in Chrome on this computer.** Playwright cannot start Chrome itself here (it closes
within a second, exit code 1260). Starting Chrome by hand and connecting to it works:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9333 --user-data-dir="<an empty folder>" --no-first-run about:blank &
```

```bash
CDP=http://127.0.0.1:9333 node rec.cjs en en
```

Chrome closes when a run ends, so start it again before the next run. A run takes about 8 minutes.
Without `CDP` set, `rec.cjs` falls back to WebKit; do not use that for the invitation.

Other known gaps:

- The 30-odd second showing is still a cut-down: nine stretches of the walk-through, some played at
  1.4 to 2 times speed, joined with dissolves. The cut list is `pieces` in `tools/build.py`.
- The title, desk and ending scenes (`film.html`) are still filmed in WebKit. They look right there.
- The reply form is not shown. The plain address has none, only a note; a guest's own link has it.
- The couple's page on the monitor and on Naveen's phone is a drawing with made-up rows. The real
  `/admin/` needs Naveen's password and authenticator code, so it was never opened.
- The headphones are plain black over-ear ones, not a detailed Sony XM6.
- Nobody has yet watched the finished film through with sound.

---

## 4. How the film is made

Everything is made from web pages, filmed one frame at a time, and joined with ffmpeg.

| File | What it is |
|---|---|
| `film.html` | The drawn scenes. `?scene=making` is the title and the desk; `?scene=closing` is the ending and the card; `?scene=sinhala` is the small "Also in සිංහල" label. The desk is real 3D (three.js, loaded from cdnjs); the bubbles and the Claude bar are ordinary HTML over it. Every movement depends only on the time since the page loaded. |
| `tools/scene.cjs` | Films a scene of `film.html`. `node scene.cjs making <folder> 54` writes one JPEG per frame, 30 a second, 1080 x 1920. It hands `film.html` to the browser as if it were on the official site, so pictures and fonts come from naveenwedsdulanjani.com. The two monogram drawings in `assets/logo/` are the exception: the site does not publish them. |
| `tools/rec.cjs` | Films the real invitation from https://naveenwedsdulanjani.com/. `node rec.cjs en <folder>` or `si`. It presses the language, presses the seal, waits for the names, scrolls through every section and scratches the foil. Writes frames plus `marks.json` (when each section starts). About 8 minutes a language in Chrome. |
| `tools/tag.cjs` | Makes `tag.png`, the Sinhala label, with a see-through background. |
| `tools/build.py` | Cuts the pieces and joins them: `python build.py <out.mp4> <path to assets/audio/invitation.mp3>`. It expects folders `mk`, `cl`, `en`, `si` and `tag.png` beside it. The cut list (which seconds of the walk-through are used, at what speed) is the `pieces` list near the bottom. |

**Order of work**

1. `node scene.cjs making mk 54` and `node scene.cjs closing cl 21`
2. Start Chrome as in section 3, then `CDP=http://127.0.0.1:9333 node rec.cjs en en`; start Chrome again, then the same with `si si`
3. `node tag.cjs`
4. `python build.py …` then make the WhatsApp copy:
   `ffmpeg -i full.mp4 -vf scale=720:1280 -c:v libx264 -crf 23 -c:a aac -b:a 128k small.mp4`

The work folders (`mk`, `cl`, `en`, `si`, `segs`) are large and are kept outside the project, in a
temporary folder. They are not saved anywhere; re-film to get them back.

**How the frame-by-frame filming works** (`rec.cjs`): Playwright's clock is installed and paused,
then moved on 1/30 of a second per frame. CSS animations are paused and stepped by the same amount.
The page's music player is replaced by a silent stand-in that keeps the same beat, and the real
music is added when the film is joined. The photographs stop turning if a mouse rests over them, so
the mouse is parked in a corner.

**Timings in `film.html`** are in seconds, on the 2.4 second bar of the invitation's music. The HTML
bubbles use `--in` / `--out` in film time; the 3D scene uses its own table `AT` in desk time, which
starts 13.2 seconds later (`T0`). Change both together.

---

## 5. Rules that apply here

- The videos never go to GitHub (`keepsake/*.mp4` is in `.gitignore`) and this folder never goes to
  the live site (`/keepsake/` is in `.vercelignore`).
- The live site must stay up until after the wedding on 7 December 2026. Nothing here changes it.
- Do not use a local server for the invitation. Film the official address.
- Mark wants plain-English explanations and for things to be built directly, not offered as options.
