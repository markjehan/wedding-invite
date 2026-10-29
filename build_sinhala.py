"""Build the Sinhala invitation's type: three web font subsets and the calligraphic names.

Each English face has a Sinhala partner chosen for the role it plays:

    Pinyon Script, Great Vibes  ->  UN-Gurulugomi       classic Sinhala calligraphy, for the names, the
                                                         monogram and the section headings
    Italiana                    ->  Noto Serif Sinhala  Light, for the welcome line, the letter, the
                                                         programme, the address and the small labels
    Manrope                     ->  Noto Sans Sinhala   Light, for body copy, buttons and the form

The Sinhala invitation shares every animation with the English one, so its names are drawn the
way the English names are: the font's own outlines, one small ink SVG and one small pen SVG per
glyph, traced in writing order. This script shapes the two names in Gurulugomi, writes that markup
for the <template id="names-si"> in index.html, places the monogram's initials, and cuts the web
fonts the invitation actually ships.

Sources are not kept in the repository. Download them into build_assets/fonts/ first:

    https://raw.githubusercontent.com/JakeLoganUK/Sinhala-Unicode-Fonts/HEAD/UN-Gurulugomi.ttf
    https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsinhala/NotoSerifSinhala%5Bwdth,wght%5D.ttf
        (saved as NotoSerifSinhala-VF.ttf, with its OFL.txt as NotoSerifSinhala-OFL.txt)
    https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssinhala/NotoSansSinhala%5Bwdth,wght%5D.ttf
        (saved as NotoSansSinhala-VF.ttf, with its OFL.txt as NotoSansSinhala-OFL.txt)

The two Noto families are SIL Open Font License 1.1. Gurulugomi is Pushpananda Ekanayaka's (The
FontMaster) and carries no licence text of its own; it is distributed as free for personal use,
with commercial use licensed from FontMaster. A personal wedding invitation is personal use. What is
known of its terms ships beside the subset as Gurulugomi-NOTICE.txt.

Shaping. There is no HarfBuzz on this machine. Gurulugomi has no positioning table - its vowel signs
are glyphs of their own, drawn to sit against the letter before them - and its substitutions are a
small, closed set: single, multiple and ligature lookups, and coverage-based chaining rules that call
them, all with no lookup flags. The stages follow HarfBuzz's Indic shaper, and within a lookup every
position takes the first subtable that matches, as HarfBuzz does. The output is checked glyph for glyph
against Chrome's own rendering of the same words (.qa/sinhala-shaping-check.html).

Run ``python build_sinhala.py`` from this folder.
"""

from __future__ import annotations

import sys
from pathlib import Path

from fontTools import subset
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / 'build_assets' / 'fonts'
FONTS = ROOT / 'assets' / 'fonts'
OUT = ROOT / 'build_assets' / 'sinhala-names.html'
SCRIPT = SOURCES / 'UN-Gurulugomi.ttf'

NAMES = ['නවීන්', 'දුලාංජනී']
# The English outlines are written in Pinyon Script's 2048 units to the em, and the pen width is
# computed from that number (invitation.js, setPen), so every other font's outlines are scaled into
# the same space. OPTICAL then sets the Sinhala names against the English: Gurulugomi's letters are
# compact on their em, so they are enlarged until the two names hold the screen as Pinyon's do.
EM = 2048
OPTICAL = 1.2
PAD = 41              # the English letters are boxed 41 units clear of their ink on every side
BAR_TRAVEL = 1.65     # one bar, less the .75s a single letter's trace takes (see magnolia.css)
BREATH = .03          # em of clear space above and below each name's ink inside its line box
LIGHT = {'wght': 300, 'wdth': 100}
# HarfBuzz's Indic stage order. Each tuple is one stage; lookups inside a stage run in lookup order.
STAGES = [('locl', 'ccmp'), ('nukt',), ('akhn',), ('rphf',), ('rkrf',), ('pref',), ('blwf',), ('abvf',), ('half',),
          ('pstf',), ('vatu',), ('cjct',), ('init', 'pres', 'abvs', 'blws', 'psts', 'haln', 'calt', 'clig', 'liga', 'rlig')]
NOTICE = """UN-Gurulugomi (subset: sinhala-script.woff)

Designed by Pushpananda Ekanayaka, The FontMaster (Fontographer 4.1, September 2002).
Source: https://github.com/JakeLoganUK/Sinhala-Unicode-Fonts (UN-Gurulugomi.ttf)

The font file carries no licence text of its own (OS/2 fsType 0, no embedding restriction).
Pushpananda Ekanayaka's FontMaster fonts are distributed as free for personal use; commercial use
requires a licence from FontMaster. This invitation is a personal wedding invitation, which is
personal use. If this site is ever reused commercially, license the font from FontMaster or replace it.
"""


def ntos(value: float) -> str:
    text = f'{value:.1f}'.rstrip('0').rstrip('.')
    return '0' if text == '-0' else text


def subtables(lookup):
    for table in lookup.SubTable:
        kind = lookup.LookupType
        if kind == 7:
            kind, table = table.ExtensionLookupType, table.ExtSubTable
        yield kind, table


def apply_at(lookups, index: int, glyphs: list[str], i: int):
    """Apply one lookup at position i. Returns where the lookup's match ended, or None."""
    lookup = lookups[index]
    assert lookup.LookupFlag == 0, 'lookup flags are not handled here'
    for kind, table in subtables(lookup):
        glyph = glyphs[i]
        if kind == 1:
            if glyph in table.mapping:
                glyphs[i] = table.mapping[glyph]
                return i + 1
        elif kind == 2:
            if glyph in table.mapping:
                sequence = list(table.mapping[glyph])
                glyphs[i:i + 1] = sequence
                return i + len(sequence)
        elif kind == 3:
            continue  # alternates are a designer's menu (aalt), never chosen by the shaper
        elif kind == 4:
            for lig in table.ligatures.get(glyph, []):
                parts = list(lig.Component)
                if glyphs[i + 1:i + 1 + len(parts)] == parts:
                    glyphs[i:i + 1 + len(parts)] = [lig.LigGlyph]
                    return i + 1
        elif kind == 6:
            if table.Format != 3:
                raise NotImplementedError(f'chaining context format {table.Format}')
            back, ahead, given = table.BacktrackCoverage, table.LookAheadCoverage, table.InputCoverage
            if i - len(back) < 0 or i + len(given) + len(ahead) > len(glyphs):
                continue
            if not all(glyphs[i + k] in given[k].glyphs for k in range(len(given))):
                continue
            if not all(glyphs[i - 1 - k] in back[k].glyphs for k in range(len(back))):
                continue
            if not all(glyphs[i + len(given) + k] in ahead[k].glyphs for k in range(len(ahead))):
                continue
            end = i + len(given)
            for record in table.SubstLookupRecord:
                before = len(glyphs)
                apply_at(lookups, record.LookupListIndex, glyphs, i + record.SequenceIndex)
                end += len(glyphs) - before
            return end
        else:
            raise NotImplementedError(f'lookup type {kind}')
    return None


def shape(font: TTFont, text: str) -> list[str]:
    cmap = font.getBestCmap()
    glyphs = [cmap[ord(ch)] for ch in text]
    gsub = font['GSUB'].table
    lookups = gsub.LookupList.Lookup
    features = {}
    for record in gsub.FeatureList.FeatureRecord:
        features.setdefault(record.FeatureTag, []).extend(record.Feature.LookupListIndex)
    for stage in STAGES:
        for index in sorted(set(sum((features.get(tag, []) for tag in stage), []))):
            i = 0
            while i < len(glyphs):
                end = apply_at(lookups, index, glyphs, i)
                i = end if end is not None and end > i else i + 1
    return glyphs


def plain(font: TTFont, text: str) -> list[str]:
    """Glyphs for text that needs no shaping (letters with no vowel signs or joins)."""
    cmap = font.getBestCmap()
    return [cmap[ord(ch)] for ch in text]


def outline(font: TTFont, name: str, x: float, scale: float):
    """Contours of one glyph placed at pen position x, in SVG coordinates (y down)."""
    glyph_set = font.getGlyphSet()
    recording = DecomposingRecordingPen(glyph_set)
    glyph_set[name].draw(recording)
    bounds = BoundsPen(glyph_set)
    recording.replay(TransformPen(bounds, (scale, 0, 0, -scale, x * scale, 0)))
    contours, current = [], []
    for op, args in recording.value:
        current.append((op, args))
        if op in ('closePath', 'endPath'):
            contours.append(current)
            current = []
    paths = []
    for contour in contours:
        pen = SVGPathPen(glyph_set, ntos=ntos)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0))
        for op, args in contour:
            getattr(tpen, op)(*args)
        paths.append(pen.getCommands())
    return paths, bounds.bounds


def names_markup(font: TTFont) -> list[str]:
    scale = EM / font['head'].unitsPerEm * OPTICAL
    hmtx = font['hmtx']
    words = []
    for word in NAMES:
        x, letters = 0.0, []
        for name in shape(font, word):
            paths, box = outline(font, name, x, scale)
            if box:
                letters.append((name, paths, box))
            x += hmtx[name][0]
        words.append(letters)
    blocks = []
    for word, letters in zip(NAMES, words):
        left = min(box[0] for _, _, box in letters)
        right = max(box[2] for _, _, box in letters)
        top = min(box[1] for _, _, box in letters)
        bottom = max(box[3] for _, _, box in letters)
        centre = (left + right) / 2
        # Box every letter to its own ink, exactly as the English letters are.
        boxes = [(box[0] - PAD, box[1] - PAD, box[2] - box[0] + PAD * 2, box[3] - box[1] + PAD * 2) for _, _, box in letters]
        high = min(b[1] for b in boxes)
        step = BAR_TRAVEL / max(1, len(letters) - 1)
        # Each name gets a line box that holds its own ink. Sinhala carries its vowel signs well above
        # and below the letter body (the loop of ී, the tail of ු); in the English 1.14em box they rose
        # out of it, into the welcome line above and the සහ below. Height is set inline so it wins over
        # the shared rule.
        baseline = -top / EM + BREATH
        height = (bottom - top) / EM + BREATH * 2
        head = f'<span class="given" style="--top:{baseline + high / EM:.4f}em;--step:{step:.4f}s;height:{height:.4f}em">'
        ink, pen = [], []
        for i, ((_, paths, _), (bx, by, bw, bh)) in enumerate(zip(letters, boxes)):
            place = (f'--i:{i};left:calc(50% + {(bx - centre) / EM:.4f}em);'
                     f'top:calc(var(--top) + {(by - high) / EM:.4f}em);width:{bw / EM:.4f}em')
            view = f'{ntos(bx)} {ntos(by)} {ntos(bw)} {ntos(bh)}'
            ink.append(f'<svg class="letter ink" style="{place}" viewBox="{view}" aria-hidden="true"><path d="{"".join(paths)}"/></svg>')
            pen.append(f'<svg class="letter pen" style="{place}" viewBox="{view}" aria-hidden="true">'
                       + ''.join(f'<path class="name-trace" d="{d}"/>' for d in paths) + '</svg>')
        print(f'{word}: {len(letters)} letters, {(right - left) / EM:.3f}em wide, {height:.3f}em tall, step {step:.4f}s')
        blocks.append('\n'.join([head, *ink, *pen, '</span>']))
    return blocks


def ink(font: TTFont, glyphs: list[str], size: float):
    """Ink box (x0, top, x1, bottom; y down) and advance of a glyph run set at `size` units."""
    upm, glyph_set, x, box = font['head'].unitsPerEm, font.getGlyphSet(), 0.0, None
    for name in glyphs:
        bounds = BoundsPen(glyph_set)
        glyph_set[name].draw(TransformPen(bounds, (size / upm, 0, 0, -size / upm, x * size / upm, 0)))
        if bounds.bounds:
            b = bounds.bounds
            box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
        x += font['hmtx'][name][0]
    return box, x * size / upm


def initials(script: TTFont) -> None:
    """Place the monogram's Sinhala initials in the medallion's 200-unit box, as i18n.js entries.

    The initials are set large in the same calligraphy as the names, as Pinyon Script writes the
    English N and D, and between them sits the invitation's own gold diamond - the programme's node on
    a hairline - where the English mark has its ampersand. A word there (සහ) read as a caption squeezed
    between two letters rather than a monogram; the diamond is the ornament the rest of the invitation
    already uses. The group is centred on the medallion's axis by measured ink, the diamond on the
    middle of the letters' body, and the letters sit high enough that the tail of ු clears the swash.
    The ink fronts run from each glyph's left edge to a full soft edge (108 units) past its right."""
    AXIS = 100
    # Two sizings of one composition: the medallion (176-214px) and the compact #crest on every section
    # and the foil stamp (48-92px). JOIN is the diamond with its hairline, matching the path lengths in
    # index.html (15 units either side of the medallion's diamond, 13 on the compact mark).
    for prefix, SIZE, BASELINE, GAP, JOIN in (('mono', 60, 114, 5, 30), ('crest', 56, 114, 5, 26)):
        n, _ = ink(script, shape(script, 'න'), SIZE)
        d, _ = ink(script, shape(script, 'දු'), SIZE)
        widths = [n[2] - n[0], JOIN, d[2] - d[0]]
        left = AXIS - (sum(widths) + GAP * 2) / 2
        join_left = left + widths[0] + GAP
        d_left = join_left + JOIN + GAP
        body_middle = BASELINE + n[1] / 2
        entries = {
            f'{prefix}.size': f'{SIZE:g}', f'{prefix}.y': f'{BASELINE:g}',
            f'{prefix}.n.x': f'{left - n[0]:.1f}', f'{prefix}.d.x': f'{d_left - d[0]:.1f}',
            f'{prefix}.join': f'translate({join_left + JOIN / 2:.1f} {body_middle:.1f})',
        }
        for key, value in entries.items():
            print(f"    '{key}': '{value}',")
        print(f'    // {prefix}: ink spans {left:.1f}..{d_left + widths[2]:.1f} across, {BASELINE + min(n[1], d[1]):.1f}..{BASELINE + max(n[3], d[3]):.1f} down, of the 200-unit box')
        if prefix == 'mono':
            fronts = {'ink.n': (left, left + widths[0]), 'ink.amp': (join_left, join_left + JOIN), 'ink.d': (d_left, d_left + widths[2])}
            for key, (x0, x1) in fronts.items():
                print(f"    '{key}': '--ink-from:{int(x0) - 1}px;--ink-to:{int(x1) + 110}px',")


def cut(source: Path, target: Path, axes: dict | None = None) -> None:
    font = TTFont(source)
    if axes:
        font = instancer.instantiateVariableFont(font, axes)
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    options.flavor = 'woff'
    subsetter = subset.Subsetter(options)
    # The whole Sinhala block rather than only the letters in today's copy. The invitation's
    # wording is still being written, and a subset cut to the current text would silently drop
    # a conjunct the moment a line is edited. ZWJ and ZWNJ select the touching and yansaya forms;
    # the dotted circle is what the shaper draws for a stray vowel sign.
    subsetter.populate(unicodes=[*range(0x0D80, 0x0E00), 0x200C, 0x200D, 0x25CC])
    subsetter.subset(font)
    font.flavor = 'woff'
    font.save(target)
    print(f'{target.name}: {target.stat().st_size:,} bytes')


def main() -> None:
    # The Windows console defaults to cp1252, which cannot print the names this reports.
    sys.stdout.reconfigure(encoding='utf-8')
    script = TTFont(SCRIPT)
    OUT.write_text('\n'.join(names_markup(script)) + '\n', encoding='utf-8')
    print(f'wrote {OUT.relative_to(ROOT)}')
    initials(script)
    cut(SCRIPT, FONTS / 'sinhala-script.woff')
    cut(SOURCES / 'NotoSerifSinhala-VF.ttf', FONTS / 'noto-serif-sinhala-light.woff', LIGHT)
    cut(SOURCES / 'NotoSansSinhala-VF.ttf', FONTS / 'noto-sans-sinhala-light.woff', LIGHT)
    for licence in ('NotoSerifSinhala-OFL.txt', 'NotoSansSinhala-OFL.txt'):
        (FONTS / licence).write_bytes((SOURCES / licence).read_bytes())
    (FONTS / 'Gurulugomi-NOTICE.txt').write_text(NOTICE, encoding='utf-8')
    # Cuts from earlier pairings (Abhaya Libre; Atlas Chirani), which nothing loads now.
    for stale in ('abhaya-libre-sinhala.woff', 'AbhayaLibre-OFL.txt', 'noto-sans-sinhala.woff', 'chirani-sinhala.woff', 'AtlasChirani-OFL.txt'):
        if (FONTS / stale).exists():
            (FONTS / stale).unlink()
            print(f'removed superseded {stale}')


if __name__ == '__main__':
    main()
