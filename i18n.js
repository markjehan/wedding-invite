/* The invitation in two languages.

   Everything a guest reads is written here twice. The English is the markup itself, read off the
   page before anything changes it, so it has one home and cannot drift from what the page shows
   without script. The Sinhala is below. Elements carry the key of their words in one of three
   attributes:

     data-i18n       the element's whole contents, for lines with a <br> or a <span> inside them;
     data-i18n-text  only the element's own text, for a button whose icon or a label whose input
                     has to survive the swap untouched;
     data-i18n-attr  attribute:key pairs, for alt text, placeholders, links and the monogram's
                     measured positions.

   Nothing here moves anything. The doors, the score and every animation are shared by both
   languages; a change of language only changes words, and the few places where the words have a
   shape of their own - the inscribed names and the initials in the mark - swap in outlines and
   positions measured for the Sinhala (see build_sinhala.py).

   It also runs the language page: it waits for the choice, applies it, watches the doors' art and
   the score arrive, and hands over to invitation.js through `chosen`. It is listed before that
   script, so the machinery exists before anything asks it for words. */
(() => {
  'use strict';
  const STORE = 'nd-language';
  const BEAT = .6;
  const root = document.documentElement;
  const $ = s => document.querySelector(s);
  // Sinhala joins some letters only when asked to: a zero-width joiner after the al-lakuna makes
  // the yansaya, rakaransaya and repaya forms (ශ්‍රී, මංගල්‍යය, ආශීර්වාදය). It is written out as J so
  // the joins are visible in the source instead of hiding in it.
  const J = '‍';

  const calendarLink = (title, note) => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
    encodeURIComponent(title) + '&dates=20261204/20261205&location=' + encodeURIComponent('Avenra Gardens, Negombo') +
    '&details=' + encodeURIComponent(note);

  // The words the scripts write for themselves.
  const SAID = {
    en: {
      soundOff: 'Turn the music off',
      soundOn: 'Turn the music on',
      replay: 'Replay the opening',
      preparing: 'Preparing your invitation…',
      scratchDone: 'Friday, 4 December 2026. Find the details below.',
      today: 'Today is our wedding day!',
      after: 'Thank you for celebrating this beautiful chapter with us.',
      venueReal: 'See the real venue',
      venueSketch: 'Return to the sketch',
      nameMissing: 'Please enter your name.',
      message: (name, answer, note) => `Dear Naveen & Dulanjani,\n\n${name} — ${answer}.\nWedding: 4 December 2026, Avenra Gardens, Negombo${note ? '\n\n' + note : ''}`,
      subject: 'RSVP — Naveen & Dulanjani, 4 December 2026',
      ready: 'Your reply is ready. Choose how to send it.',
      opening: 'WhatsApp is opening with your reply. If it does not, press Send on WhatsApp below.',
      changed: 'Details changed. Send your updated RSVP.',
      copied: 'Copied. Paste your RSVP into a message to the couple.',
      selectCopy: 'Select and copy the highlighted reply.',
      // A personal link, whose reply is saved on the server.
      welcome: name => `Welcome, ${name}, to the wedding of`,
      dear: name => `Dear ${name},`,
      seats: n => `We have kept ${n} seats for you.`,
      send: 'Send my reply',
      update: 'Update my reply',
      sending: 'Sending your reply…',
      already: (answer, people) => `Your reply: ${answer}${people > 1 ? ` (${people} guests)` : ''}.`,
      party: (answer, people) => `${answer}${people > 1 ? ` (${people} guests)` : ''}`,
      thanks: name => `Thank you, ${name}. Your reply has reached Naveen & Dulanjani.`,
      failed: 'Your reply could not be sent. Please try again in a moment.',
      closed: 'Replies have closed. Please contact Naveen & Dulanjani directly.',
      calendarTitle: 'Naveen & Dulanjani Wedding',
      calendarNote: 'Ceremony time to be confirmed.'
    },
    si: {
      soundOff: 'සංගීතය නවත්වන්න',
      soundOn: 'සංගීතය වාදනය කරන්න',
      replay: 'ආරම්භය නැවත නරඹන්න',
      preparing: 'ඔබගේ ආරාධනාව සූදානම් වෙමින්…',
      scratchDone: '2026 දෙසැම්බර් 4, සිකුරාදා. විස්තර පහතින්.',
      today: 'අද අපගේ විවාහ දිනයයි!',
      after: 'මෙම සුන්දර පරිච්ඡේදය අප සමඟ සැමරීමට ඔබට ස්තූතියි.',
      venueReal: 'සැබෑ ස්ථානය බලන්න',
      venueSketch: 'සිතුවම වෙත ආපසු',
      nameMissing: 'කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.',
      message: (name, answer, note) => `ආදරණීය නවීන් සහ දුලාංජනී,\n\n${name} — ${answer}.\nවිවාහ මංගල්${J}යය: 2026 දෙසැම්බර් 4, ඇවන්රා ගාඩන්ස්, මීගමුව${note ? '\n\n' + note : ''}`,
      subject: 'පැමිණීම තහවුරු කිරීම — නවීන් සහ දුලාංජනී, 2026 දෙසැම්බර් 4',
      ready: 'ඔබගේ පිළිතුර සූදානම්. එය යවන ආකාරය තෝරන්න.',
      opening: 'ඔබගේ පිළිතුර සමඟ WhatsApp විවෘත වේ. එය විවෘත නොවුණොත්, පහත ඇති “WhatsApp හරහා යවන්න” ඔබන්න.',
      changed: 'විස්තර වෙනස් විය. යාවත්කාලීන පිළිතුර යවන්න.',
      copied: 'පිටපත් විය. ඔබගේ පිළිතුර යුවළට යවන පණිවිඩයකට අලවන්න.',
      selectCopy: 'උද්දීපනය කළ පිළිතුර තෝරා පිටපත් කරන්න.',
      welcome: name => `${name}, විවාහ මංගල්${J}යයට සාදරයෙන් පිළිගනිමු`,
      dear: name => `ආදරණීය ${name},`,
      seats: n => `ඔබ වෙනුවෙන් ආසන ${n}ක් වෙන් කර ඇත.`,
      send: 'මගේ පිළිතුර යවන්න',
      update: 'මගේ පිළිතුර යාවත්කාලීන කරන්න',
      sending: 'ඔබගේ පිළිතුර යවමින්…',
      already: (answer, people) => `ඔබගේ පිළිතුර: ${answer}${people > 1 ? ` (අමුත්තන් ${people})` : ''}.`,
      party: (answer, people) => `${answer}${people > 1 ? ` (අමුත්තන් ${people})` : ''}`,
      thanks: name => `ස්තූතියි, ${name}. ඔබගේ පිළිතුර නවීන් සහ දුලාංජනී වෙත ලැබිණි.`,
      failed: 'ඔබගේ පිළිතුර යැවීමට නොහැකි විය. කරුණාකර මඳ වේලාවකින් නැවත උත්සාහ කරන්න.',
      closed: 'පිළිතුරු ලබා ගැනීම අවසන් කර ඇත. කරුණාකර නවීන් හෝ දුලාංජනී අමතන්න.',
      calendarTitle: `නවීන් සහ දුලාංජනීගේ විවාහ මංගල්${J}යය`,
      calendarNote: 'උත්සව වේලාව පසුව තහවුරු කෙරේ.'
    }
  };

  // The Sinhala invitation, key for key with the markup.
  const SI = {
    title: 'නවීන් සහ දුලාංජනී — 2026 දෙසැම්බර් 4',

    'door.label': `විවාහ ආරාධනාවේ ප්${J}රවේශය`,
    'door.seal': `මුද්${J}රාව බිඳ ආරාධනාව විවෘත කරන්න. ආරම්භක දර්${J}ශනය මඟහැරීමට Escape යතුර ඔබන්න.`,
    'door.press': `මුද්${J}රාව ස්පර්ශ කර ඇතුළු වන්න`,
    skip: 'ආරාධනාව වෙත යන්න',

    'welcome.wording': `විවාහ මංගල්${J}යයට සාදරයෙන් පිළිගනිමු`,
    names: 'නවීන් සහ දුලාංජනී',
    'names.amp': 'සහ',
    'welcome.cue': 'ඔබට අපගේ ආරාධනාව',
    // The initials, set large in Gurulugomi's calligraphy and placed by their measured ink so the pair
    // and the diamond between them sit on the medallion's axis (build_sinhala.py prints these). Where the
    // English mark has its ampersand, the Sinhala mark has the invitation's own gold diamond: a Latin
    // glyph has no place in it, and a small සහ there read as a caption rather than a monogram.
    'mono.n': 'න',
    'mono.d': 'දු',
    'mono.amp': 'සහ',
    'mono.size': '60',
    'mono.amp.size': '18',
    'mono.face': 'SinhalaScript,serif',
    'mono.amp.face': 'SinhalaSerif,serif',
    // The same face again as an inline style, for the <use> copies of the crest; see apply().
    'crest.face': 'font-family:SinhalaScript,serif',
    'crest.amp.style': 'display:none',
    'mono.n.x': '53.6',
    'mono.d.x': '124.2',
    'mono.amp.x': '103.5',
    'mono.amp.y': '117.8',
    // Each ink front starts at its letter's left edge and ends a full soft edge past its right.
    'ink.n': '--ink-from:51px;--ink-to:194px',
    'ink.amp': '--ink-from:88px;--ink-to:229px',
    'ink.d': '--ink-from:123px;--ink-to:257px',
    // The compact mark above every section, and the foil stamp struck from it, render at a third of
    // the medallion's size, where its spacing closed up and සහ ran into both letters. Same
    // composition, sized for its size: slightly smaller letters, held further apart.
    'crest.size': '56',
    'crest.amp.size': '16',
    'crest.n.x': '57.4',
    'crest.amp.x': '103.3',
    'crest.amp.y': '117.6',
    'crest.d.x': '121.9',
    // The letters' shared baseline, raised so the tail of ු clears the swash, and the gold diamond that
    // stands between them. On the compact crests the diamond is switched on by its inline style.
    'mono.y': '114',
    'mono.join': 'translate(104.5 103.9)',
    'crest.y': '114',
    'crest.join': 'translate(104.2 104.6)',
    'crest.join.style': 'display:inline',

    'letter.label': `දෙපවුලේ ආශීර්${J}වාදය සමඟ`,
    'letter.title': 'සොම්නස් සිතින්',
    'letter.invite': 'අප ජීවිතයේ සුන්දර නව පරිච්ඡේදයක් අරඹන මොහොතේ අපගේ සතුට බෙදාගැනීමට ඔබට ආරාධනා කරමු.',
    'letter.names': 'නවීන් <span>සහ</span> දුලාංජනී',
    'letter.request': `අපගේ විවාහ මංගල්${J}යය සමරන මෙම සුබ අවස්ථාවට ඔබගේ පැමිණීම ගෞරවයෙන් ඉල්ලා සිටිමු.`,
    'letter.sign': 'ඔබගේ පැමිණීම අපට ලොවක් තරම් වටී.',
    'photo.portrait': `ආරාධනාව සඳහා නිදර්${J}ශක යුවළ ඡායාරූපයක්`,
    'photo.garden': `උද්${J}යානයක එකට ඇවිදින නිදර්${J}ශක යුවළක්`,
    'photo.dance': `නිදර්${J}ශක මංගල නර්${J}තන ඡායාරූපයක්`,
    'photo.note': `නිදර්${J}ශක ඡායාරූප — නවීන් සහ දුලාංජනීගේ සැබෑ ඡායාරූප මගින් පසුව ප්${J}රතිස්ථාපනය කෙරේ.`,
    quote: '“සදාකාලයේ සුන්දරම දෙය එය බෙදාගන්නා අයයි — අපට නම් ඒ ඔබයි.”',

    'date.title': 'සිහියේ රැඳෙන දිනයක්',
    'date.lead': 'ඔබ වෙනුවෙන්ම, පුංචි රන්වන් විස්මයක්.',
    'date.day': 'සිකුරාදා',
    'date.month': 'දෙසැම්බර් 2026',
    'date.details': 'විස්තර පහතින්',
    'date.reveal': 'විවාහ දිනය හෙළි කරන්න',
    'date.scratch': 'අපගේ දිනය දැකීමට සූරන්න',
    'calendar.google': `Google දින දර්${J}ශනයට එක් කරන්න`,
    'calendar.google.href': calendarLink(SAID.si.calendarTitle, SAID.si.calendarNote),
    'calendar.apple': `Apple දින දර්${J}ශනය / iCal`,
    'calendar.ics': 'wedding-si.ics',
    'calendar.note': 'උත්සව වේලාව තහවුරු වන තුරු, දවස පුරා සිදුවීමක් ලෙස සුරැකේ.',
    'count.title': 'සුබ මොහොතට දින ගණිමින්',
    'count.label': 'විවාහ දිනය දක්වා ඉතිරි කාලය',
    'count.days': 'දින',
    'count.hours': 'පැය',
    'count.minutes': 'මිනිත්තු',
    'count.seconds': 'තත්පර',
    'count.note': `ශ්${J}රී ලංකා වේලාවෙන් දෙසැම්බර් 4 මධ්${J}යම රාත්${J}රිය දක්වා.`,

    'agenda.title': 'මතක දහසක් රැඳෙන දවසක්',
    'agenda.lead': 'සැමරුමේ පෙරදසුනක්. අවසන් වැඩසටහන පසුව දැනුම් දෙනු ඇත.',
    'agenda.time': 'වේලාව පසුව දැනුම් දෙමු',
    'agenda.1.title': 'උණුසුම් පිළිගැනීම',
    'agenda.1.text': 'පැමිණ, සුවපහසුවෙන් අපගේ පවුල් සමඟ එක්වන්න.',
    'agenda.2.title': `විවාහ චාරිත්${J}රය`,
    'agenda.2.text': 'අපගේ ජීවිතයේ නව පරිච්ඡේදය ඇරඹෙන මොහොත.',
    'agenda.3.title': 'සුබ පැතුම් සහ ඡායාරූප',
    'agenda.3.text': 'ජීවිත කාලයක ආදරය සදා රැඳවීමට පුංචි මොහොතක්.',
    'agenda.4.title': `භෝජන සංග්${J}රහය සහ සැමරුම`,
    'agenda.4.text': 'ආහාරයක්, කතාවක් සහ එකමුතුවට සුබ පැතුමක් බෙදාගන්න.',
    'agenda.5.title': 'සුන්දර සමුගැනීම',
    'agenda.5.text': 'අපි නැවත එක්ව අලුත් මතකයක් තනන තුරු.',
    'agenda.note': 'යෝජිත වැඩසටහන — යුවළගේ අවසන් වැඩසටහන සහ වේලාවන් මෙය වෙනුවට යෙදෙනු ඇත.',

    'venue.title': 'ඇවන්රා ගාඩන්ස් හිදී අපව හමුවන්න',
    'venue.lead': 'අපගේ සැමරුම පණ ලබන තැන.',
    'venue.drawing': `ඇවන්රා ගාඩන්ස් හි සවිස්තර රන්වන් ගෘහනිර්${J}මාණ සිතුවම`,
    'venue.photo': 'සැබෑ ඇවන්රා ගාඩන්ස් ගොඩනැගිල්ලේ ඡායාරූපය',
    'venue.redraw': 'නැවත අඳින්න',
    'venue.address': `ඇවන්රා ගාඩන්ස් හෝටලය<br>මීගමුව, ශ්${J}රී ලංකාව`,
    'venue.directions': 'මඟ පෙන්වීම ලබාගන්න',
    'venue.map': 'Google Maps හි ස්ථානය බලන්න',

    'rsvp.title': `ඔබ නැතිව සැමරුම සම්පූර්${J}ණ නොවේ`,
    'rsvp.lead': 'ඔබ වෙනුවෙන් ආසනයක් වෙන් කර තැබීමට අපි ආශාවෙන් සිටිමු.',
    'rsvp.heading': 'ඔබගේ පැමිණීම තහවුරු කරන්න',
    'rsvp.name': `ඔබගේ සම්පූර්${J}ණ නම`,
    'rsvp.name.hint': 'නම සහ වාසගම',
    'rsvp.question': 'ඔබ අප සමඟ සැමරුමට එක්වන්නේද?',
    'rsvp.accept': 'සතුටින් පැමිණෙමි',
    'rsvp.decline': 'කණගාටුවෙන්, පැමිණිය නොහැක',
    'rsvp.note': 'යුවළට පණිවිඩයක්',
    'rsvp.optional': `(අත්${J}යවශ්${J}ය නොවේ)`,
    'rsvp.note.hint': 'ඔබගේ සුබ පැතුම් හෝ කෙටි ආයුබෝවනක්…',
    'rsvp.prepare': 'මගේ පිළිතුර WhatsApp හරහා යවන්න',
    'rsvp.whatsapp': 'WhatsApp හරහා යවන්න',
    'rsvp.email': 'ඊමේල් මගින් යවන්න',
    'rsvp.copy': 'ඒ වෙනුවට පිළිතුර පිටපත් කරන්න',
    'rsvp.people': 'පැමිණෙන අමුත්තන් ගණන',
    'rsvp.saved': 'ඔබගේ පිළිතුර කෙලින්ම නවීන් සහ දුලාංජනී වෙත යයි. ඔබගේ පිළිතුර දැනටමත් ලියා, යුවළගේ WhatsApp අංකයට යොමු කර WhatsApp තුළ විවෘත වේ. ඔබ කළ යුත්තේ එය යැවීම පමණි. ඕනෑම වේලාවක නැවත පැමිණ මෙතැනින් එය වෙනස් කළ හැක.',
    'rsvp.general': 'පිළිතුරු යැවිය හැක්කේ ඔබට ලැබුණු ආරාධනා සබැඳිය හරහා පමණි. එය නොලැබුණේ නම්, කරුණාකර නවීන් හෝ දුලාංජනී අමතන්න.',
    'rsvp.disclosure': 'ඔබගේ පිළිතුර දැනටමත් ලියා, යුවළගේ WhatsApp අංකයට යොමු කර WhatsApp තුළ විවෘත වේ. ඔබ කළ යුත්තේ එය යැවීම පමණි. මෙහි කිසිවක් ගබඩා නොකෙරේ.',

    'closing.line': '2026 දෙසැම්බර් 4 · ඇවන්රා ගාඩන්ස්',
    'closing.back': 'මුලට ආපසු'
  };

  const textOf = el => [...el.childNodes].find(node => node.nodeType === 3 && node.nodeValue.trim());
  const pairs = el => el.getAttribute('data-i18n-attr').split(',').map(pair => {
    const at = pair.indexOf(':');
    return [pair.slice(0, at).trim(), pair.slice(at + 1).trim()];
  });

  // English is whatever the page says before anything has touched it. The closing's medallion is
  // cloned from the hero later, carrying the same keys, so it reads its English from here too.
  const EN = {title: document.title};
  const keep = (key, value) => { if (!(key in EN) && value != null) EN[key] = value; };
  document.querySelectorAll('[data-i18n]').forEach(el => keep(el.dataset.i18n, el.innerHTML));
  document.querySelectorAll('[data-i18n-text]').forEach(el => { const node = textOf(el); if (node) keep(el.dataset.i18nText, node.nodeValue.trim()); });
  // An attribute the English markup does not set is recorded as empty, so switching back removes it.
  document.querySelectorAll('[data-i18n-attr]').forEach(el => pairs(el).forEach(([attr, key]) => keep(key, el.getAttribute(attr) ?? '')));

  // The inscribed names are the font's outlines, so the Sinhala ones are a second set of outlines
  // rather than a second string. They wait in <template id="names-si"> and trade places with the
  // English letters; the pen and ink rules key on the same classes, so the figure is untouched.
  const heading = $('#welcome-title'), template = $('#names-si');
  let englishNames = null, sinhalaNames = null;
  function swapNames(lang) {
    if (!heading || !template) return;
    const shown = [...heading.children].filter(el => el.classList.contains('given'));
    if (!englishNames) englishNames = shown;
    if (!sinhalaNames) sinhalaNames = [...document.importNode(template.content, true).children];
    const wanted = lang === 'si' ? sinhalaNames : englishNames;
    if (shown[0] !== wanted[0]) shown.forEach((el, i) => el.replaceWith(wanted[i]));
  }

  // The faces each language uses that the other never asks for. A page read in one language has never
  // fetched the other's, so they are loaded ahead of a switch (the footer asks as it comes near, the
  // language page as the guest chooses) and the words never appear in a fallback face first.
  const FACES = {
    en: [['40px Calligraphy', 'A'], ['40px Script', 'N'], ['20px Italiana', 'A'], ['14px Manrope', 'A'], ['20px Figures', '0']],
    si: [['40px SinhalaScript', 'නදු'], ['20px SinhalaSerif', 'නදු'], ['14px NotoSinhala', 'නදු']]
  };
  function warm(lang) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all((FACES[lang] || []).map(([font, text]) => document.fonts.load(font, text).catch(() => []))).then(() => {});
  }

  let current = 'en';
  function apply(lang) {
    lang = lang === 'si' ? 'si' : 'en';
    const words = lang === 'si' ? SI : EN;
    current = lang;
    root.lang = lang;
    document.title = words.title || EN.title;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = words[el.dataset.i18n];
      if (value != null && el.innerHTML !== value) el.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-text]').forEach(el => {
      const node = textOf(el), value = words[el.dataset.i18nText];
      // The spaces either side belong to the markup (the gap before an icon), not to the words.
      if (node && value != null) node.nodeValue = node.nodeValue.match(/^\s*/)[0] + value + node.nodeValue.match(/\s*$/)[0];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => pairs(el).forEach(([attr, key]) => {
      const value = words[key];
      if (value === '') el.removeAttribute(attr);
      else if (value != null) el.setAttribute(attr, value);
    }));
    swapNames(lang);
    // Every small crest is a <use> copy of #crest. Inside those copies Chrome does not honour the
    // initials' font-family attribute: it drew them in the page's Sinhala body face, heavier and
    // wider than the face it names, which closed up the spacing around සහ. The foil, which reads the attribute
    // itself, was always right. An inline style is honoured, so in Sinhala the face also rides as
    // style (crest.face), and each <use> is replaced with a fresh clone so it is drawn from the
    // symbol as it now is.
    document.querySelectorAll('use[href="#crest"]').forEach(use => use.replaceWith(use.cloneNode(true)));
    document.dispatchEvent(new CustomEvent('invitation:language', {detail: {language: lang}}));
  }
  function say(key, ...args) {
    const value = key in SAID[current] ? SAID[current][key] : SAID.en[key];
    return typeof value === 'function' ? value(...args) : value;
  }
  function set(lang) {
    apply(lang);
    try { localStorage.setItem(STORE, lang); } catch {}
  }

  // ---------- The language page ----------
  const gate = $('#language-gate'), intro = $('#door-intro');
  let named = null, last = null;
  try { const asked = new URLSearchParams(location.search).get('lang'); if (asked === 'si' || asked === 'en') named = asked; } catch {}
  try { last = localStorage.getItem(STORE); } catch {}
  let settle;
  const chosen = new Promise(ok => { settle = ok; });

  // What the doors need before they can open well: their art decoded, the score decoded, the faces
  // loaded. invitation.js hands its two over as it starts; the page counts them in.
  const pending = [];
  let arrived = 0, started = false;
  const booted = new Promise(ok => document.readyState === 'complete' ? ok() : addEventListener('DOMContentLoaded', ok, {once: true}));
  const wait = ms => new Promise(ok => setTimeout(ok, ms));
  function progress() {
    if (!gate) return;
    gate.style.setProperty('--ready', pending.length ? (arrived / pending.length).toFixed(3) : '0');
    gate.classList.toggle('is-ready', started && arrived >= pending.length);
  }
  function track(work) {
    pending.push(work);
    Promise.resolve(work).catch(() => {}).then(() => { arrived++; progress(); });
    progress();
    return work;
  }
  if (document.fonts && document.fonts.ready) track(document.fonts.ready);
  booted.then(() => { started = true; progress(); });

  let choosing = false;
  function choose(button) {
    if (choosing) return;
    choosing = true;
    const lang = button.dataset.language;
    // The words change under the guest's finger: the monogram in the crest above becomes Sinhala
    // initials the instant සිංහල is pressed, and the doors beneath are already in that language.
    set(lang);
    button.setAttribute('data-chosen', '');
    gate.classList.add('is-choosing');
    const status = gate.querySelector('.gate-status'), pressed = performance.now();
    // Nothing is said unless the wait is long enough to notice.
    const notice = setTimeout(() => { if (status) { status.lang = lang; status.textContent = say('preparing'); } }, BEAT * 1500);
    booted
      // Never held for more than four seconds: past that the doors open with whatever has arrived,
      // exactly as the seal already refuses to wait more than a beat for the music.
      .then(() => Promise.race([Promise.all([warm(lang), ...pending.map(work => Promise.resolve(work).catch(() => {}))]), wait(4000)]))
      // And never let go in under a beat, so the choice is seen to land before the page leaves.
      .then(() => wait(Math.max(0, BEAT * 1000 - (performance.now() - pressed))))
      .then(() => { clearTimeout(notice); leave(lang); });
  }
  function leave(lang) {
    if (intro) intro.inert = false;
    gate.classList.add('is-leaving');
    settle(lang);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { gate.hidden = true; }, still ? 0 : BEAT * 2000);
  }
  // Two panels and nothing else to reach: Tab and the arrow keys move between them and never leave.
  function steer(event) {
    if (!['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...gate.querySelectorAll('.gate-choice')];
    const at = buttons.indexOf(document.activeElement);
    const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey);
    buttons[(at + (back ? -1 : 1) + buttons.length) % buttons.length].focus();
  }

  if (named) set(named);
  if (!gate || named) {
    if (gate) gate.hidden = true;
    settle(named || 'en');
  } else {
    // The doors are set up underneath from the start, but nothing on them can be reached until the
    // question has been answered.
    if (intro) intro.inert = true;
    gate.querySelectorAll('.gate-choice').forEach(button => {
      if (button.dataset.language === last) button.setAttribute('data-last', '');
      button.addEventListener('click', () => choose(button));
    });
    document.addEventListener('keydown', event => { if (!gate.hidden && !choosing) steer(event); });
    progress();
  }

  window.invitationLanguage = {
    get current() { return current; },
    other: () => (current === 'si' ? 'en' : 'si'),
    say, apply, set, track, warm, chosen
  };
})();
