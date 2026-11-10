# The couple's photograph

`naveen-dulanjani.webp` was supplied by the user on 30 October 2026 for the link card WhatsApp draws
when a guest's invitation is sent.

`naveen-dulanjani-preview.jpg` is that photograph cropped square, 540 by 540 from x 30, y 40, so the
card shows the two of them and leaves the car's number plate out:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=540:540:30:40" -q:v 3 naveen-dulanjani-preview.jpg

The invitation's gallery shows eight views of the same photograph (the seven below and the square card above), each centred on their faces
and keeping the cars' number plates out, until more photographs arrive:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=372:465:130:68"  -quality 86 couple-together.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=330:264:150:66"  -quality 86 couple-smiles.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=220:275:140:68"  -quality 86 couple-naveen.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=476:595:62:0"    -quality 86 couple-garden.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=220:275:300:150" -quality 86 couple-lilies.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=280:350:175:60"  -quality 86 couple-close.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=200:250:314:148" -quality 86 couple-dulanjani.webp

## The pre-wedding shoot (`shoot/`)

The user shared the couple's pre-wedding shoot on 9 November 2026 as a Google Drive folder of 33
photographs (BSD_0001.JPG to BSD_9946.JPG). Fifteen were chosen and saved as `shoot-<number>.webp`,
the number being the photographer's own: tall ones 880 wide and wide ones 1200 wide, at quality 80.

    ffmpeg -i BSD_9123.jpg -vf "scale=880:-2" -quality 80 shoot-9123.webp

`shoot-8248.webp` was the print beside the letter, which has gone (see the engraving below), and stays
as a spare; the others are the stack of prints under the letter.

The shoot has three outfits: red, blue and white. On 9 November 2026 the user asked for the gallery to
follow a colour pattern, so five more were saved the same way from the folder (0001, 0095, 0111, 9423,
9924) and the stack became fifteen prints dealt red, blue, white five times round:

    red    9474  9375  9456  9423  9560
    blue   9942  0001  0111  0095  9924
    white  9017  9123  8803  8817  8329

8250, 8576, 9165 and 9946 dropped out of the stack (8250 is nearly 8248, 9946
nearly 9942) and stay only as spares.

## The pencil drawing at the head of the letter

The user asked for the two of them alone, sketched live at the top of the invitation like the venue
drawing, with the detail of a hand-drawn graphite portrait. Drawings made by code from the photograph
were turned down, and on 10 November 2026 the user sent examples of graphite pencil portraits made by
AI and linked their Figma account to Weave for it.

`couple-drawing-<fingerprint>.webp` is that drawing. The fingerprint in its name changes whenever the
drawing does: the site lets browsers keep anything in `assets/` for a day without asking again, so
when the drawing turned gold under its old name, phones that had already opened the invitation went
on showing it grey. It starts from the shoot's full-size `BSD_9474.JPG` (6048 by
4024, the red outfits under the white bell arch). The couple were cut out of the arch, the garden and
the wall (GrabCut guided by hand, then closed-form matting for the edge, made on this computer),
framed from his hair to below his watch, set on white and uploaded to Weave, where Nano Banana Pro
(2K, 3:4, 11 credits, approved by the user) redrew it from this prompt:

    Redraw this photograph as a highly detailed, realistic graphite pencil drawing by a skilled
    portrait artist, on plain white drawing paper. Keep everything exactly as in the photo: the same
    two people with their exact faces and likeness, expressions, poses and framing, and every detail
    (his glasses, beard and haircut; her bun, earring, bracelet and nails; the lace dress with its
    bow; his shirt, watch and hand in his pocket). Fine graphite pencil: crisp contours, soft blended
    shading on the skin, dense strands in the hair and beard, hatching in the folds of the clothes,
    the paper left white for highlights. Monochrome graphite on a clean white background, no scenery,
    frame, text or signature; the drawing fades out softly at the bottom.

On this computer its paper was then measured and divided out, leaving only the graphite, which is
saved on a transparent sheet, 834 by 1200, trailing off at the foot. At the user's request it is in
the invitation's gold rather than grey: pale champagne in the lightest strokes, the venue drawing's
gold in the middle tones and the letter's dark ink (`--ink`) in the darkest.
`couple-strokes.js` holds the paths the live drawing's pencil follows over it, in the order an artist
works, which the user asked to feel hand-made and in time with the music: a light sketch of its lines,
then their faces, their hair, her arms and his hand, her dress and his shirt, each shaded with strokes
that run the way the drawing's own hatching runs. Where each part lies is set by hand in the script:

    python -I build_assets/trace_drawing.py <Weave's drawing> assets/couple/couple-drawing.webp couple-strokes.js

The gallery no longer uses the seven crops above, and since 10 November 2026 nor does the link card.

`naveen-dulanjani-invite.jpg` (1200 by 630) is the picture WhatsApp shows with each guest's link, laid
out like the front of the envelope: the suite's ivory paper with its magnolia relief down the left
edge, the couple's gold monogram with their names in Pinyon Script beneath, and their photo in red at
the white wall running in from the right and fading into the paper. The photo is their own, only
warmed so its greys are the paper's ivory (`build_assets/share_card.py`). It is the fifth version made
on 10 November 2026; the user turned down a cut-out on the magnolia hall, a pencil drawing, a blurred
and recoloured background, and a plain fade onto bare paper.
