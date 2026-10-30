# The couple's photograph

`naveen-dulanjani.webp` was supplied by the user on 30 October 2026 for the link card WhatsApp draws
when a guest's invitation is sent.

`naveen-dulanjani-preview.jpg` is that photograph cropped square, 540 by 540 from x 30, y 40, so the
card shows the two of them and leaves the car's number plate out:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=540:540:30:40" -q:v 3 naveen-dulanjani-preview.jpg

The invitation's print and six-tile gallery use views cut from the same photograph, each keeping the
cars' number plates out:

    ffmpeg -i naveen-dulanjani.webp -vf "crop=600:595:0:0"     -quality 84 couple-portrait.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=340:340:150:70"  -quality 84 couple-faces.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=250:250:250:318" -quality 84 couple-lilies.webp
    ffmpeg -i naveen-dulanjani.webp -vf "crop=300:300:195:470" -quality 84 couple-details.webp
