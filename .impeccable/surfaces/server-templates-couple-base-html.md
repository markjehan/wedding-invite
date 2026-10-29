---
version: 1
slug: "server-templates-couple-base-html"
primary_target: "server/templates/couple/base.html"
related_targets: ["server/guests/dashboard.py","server/guests/static/guests/couple.css"]
---

# The couple's guest admin

## Scope and mode

Operate. The pages the bride and groom (and whoever helps them) sign in to, behind a password and an authenticator code: the overview, the guest list, one guest's page, adding guests from Excel, and the sign-in pages. Used on a phone (sending through WhatsApp, reading replies on the sofa) as much as on a laptop (importing the list, downloading it for the venue). Replaces Django's stock admin, which the user rejected outright on 28 October 2026.

## Audience, job, constraints

Naveen and Dulanjani, and a helper. Jobs, by frequency: send each guest their link over WhatsApp (early November, one by one); see who is coming and how many people; see who has not opened or not replied and remind them; read the notes guests write; keep the list right (add, fix numbers, seats, sides); download it for the venue and caterer. Everything comes from the Guest model: name, Sinhala name, phone, seats, side, notes; sent, opened, reminded; reply, people, note, language.

## Direction contract

THESIS: The guest list as the couple's guest book: every guest's walk from sent to opened to replied drawn on one champagne rule, with the next thing to do beside each name. It refuses the generic admin's table of database records and its blue chrome.

OWN-WORLD: The invitation's ivory paper (#f7f2e8) as the ground, lighter sheet (#fffcf5) for working areas ruled with champagne hairlines (#cab991), ink #58452c, action #796035, gold #ac8b51 and its ◇ diamond; sage #4f6b3f for coming, clay #9a4b35 for not coming. Julius Sans One for every figure, Italiana for the couple's names and guests' own words, Manrope for all working type. No cards: ruled sheets and rows.

STORY: They open it and know within seconds how many people are coming and what needs doing; they send or remind straight from the row, read the wishes, and download the list.

FIRST VIEWPORT: Top bar: crest and the couple's names, Sign out as a word at the right, and four labelled tabs (Home, Guests, Add from Excel, Help). Under it, "Find a guest" as a full-width search, then four plain number boxes (people coming, can't come, waiting for a reply, not sent yet), each linking to that part of the list. Then "What to do next" (send, remind) beside each side's numbers and the latest replies.

FAMILY USE (28 Oct 2026): The user asked for it to work for an uncle or aunt in their 50s or 60s as well as for them, and to cope with problems. So: 17px Manrope throughout, Italiana only for the couple's names, no icon-only controls, 46px buttons, plain-word stages ("Sent 3 Nov, not opened yet"), a fix panel on each guest (record a phone reply, clear a reply, mark as sent or not sent), and a Help page of common problems. This replaced the journey rule and the Julius Sans One figures.

POLISH (29 Oct 2026, "nicer, elegant, simple, easier"): the four same-size number cards (the hero-metric template) became one summary sheet: "N people are coming" as a sentence, one champagne rule whose parts are as long as each stage's share of the invitations (sage coming, clay can't come, gold waiting, hatched not sent), and a four-part key under it with the stage diamonds, each part a link. Each side carries the same rule, thin. Guests' notes sit on a tinted slip opened by a gold Italiana quotation mark, no coloured left border. A guest's page leads with the one next step as the solid green button, "send again" quiet beside it, the link on its own slip, Call as a plain line. Hover only on hover devices; changing button labels blur across in 120ms. Stylesheets and the script carry a version in their address (guests/context.py) so a phone never draws new pages with an old stylesheet.

FORM: A whole surface inside the established Ivory Garden. The user declined the structure round ("do something practical"), so the build fuses the practical overview-and-list form with the dealt lead, the guest-journey board, whose four stops become the journey rule and the guest list's filter. Seed key 7f38d39d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
