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

## The engraving at the head of the letter

On 9 November 2026 the user shared, in chat, a 1765 by 1175 copy of the shoot's red-outfit photograph
under the white bell arch, and asked for the two of them alone, sketched live at the top of the
invitation like the venue drawing, then for more detail and more realism. `couple-strokes.js` in the
site's root is that drawing as pen strokes. The couple are cut out of the arch, the garden and the wall
(GrabCut, then closed-form matting for a soft, exact edge, with any green of the garden or grey of the
wall at their edge counted as background) and split into their parts. Their hair is drawn in strands,
their skin in dots, their clothes in even lines that thicken in shadow, and over that go the outline,
the edges between the parts, and their features, each looked for in its own small box on the face. It
was made on this computer alone; no photograph is stored for it:

    python -I build_assets/engrave_couple.py <the photograph> couple-strokes.js
    python -I build_assets/cutout_couple.py <the photograph> build_assets/couple-cutout.png

The gallery no longer uses the seven crops above, which stay only because the link card still uses
`naveen-dulanjani-preview.jpg`.
