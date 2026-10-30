# The couple's photograph

`naveen-dulanjani.webp` was supplied by the user on 30 October 2026 for the link card WhatsApp draws
when a guest's invitation is sent.

`naveen-dulanjani-preview.jpg` is that photograph cropped square, 540 by 540 from x 30, y 40, so the
card shows the two of them and leaves the car's number plate out:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=540:540:30:40" -q:v 3 naveen-dulanjani-preview.jpg

The invitation's print and three-print gallery use views cut from the same photograph, each centred on
their faces and keeping the cars' number plates out:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=372:465:130:68"  -quality 86 couple-together.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=220:275:140:68"  -quality 86 couple-naveen.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=200:250:314:148" -quality 86 couple-dulanjani.webp
