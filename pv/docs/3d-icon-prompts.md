# 3D icon prompts

Prompts for an image generator (Midjourney, DALL·E, Ideogram, Firefly, etc.) to create a consistent set of 3D icons for the site and the installable app.

The site is strictly monochrome: white `#FFFFFF`, black `#000000`, grey `#555555` and hairline grey `#E5E5E5`, set in Manrope. The hero adds a warm white glow (`#FFF5E0`) like light catching dust. Every prompt below shares the same style block so the set looks like one family.

## Shared style block

Append this to every prompt:

> Style: premium 3D icon, soft matte ceramic material, rounded bevelled edges, monochrome palette of glossy black (#000000), matte white (#FFFFFF) and soft grey (#555555), a single subtle warm-white rim light (#FFF5E0), soft studio lighting from the top left, gentle ambient occlusion, centred object at a three-quarter view, plain pure white background, no text, no logos, no gradients other than lighting, clean minimal composition, 1:1 square, 2048 × 2048.

For the app icon, swap the background to pure black (see prompt 1).

## Prompts

1. **App icon (PWA / home screen)**
   A bold monogram of the letters "PV" sculpted as a single thick 3D object in matte white ceramic, sitting on a glossy black rounded-square tile, with a thin grey underline bar beneath the letters, faint warm-white light motes floating around it. Pure black background, the monogram filling the central 70% so it survives a circular maskable crop. *(Shared style block, black background.)*

2. **About**
   A simple 3D silhouette bust of a man in a suit jacket, carved from matte white ceramic, resting on a small black plinth, with a warm rim light along the shoulder. Calm, dignified, faceless. *(Shared style block.)*

3. **Books**
   A small stack of three closed hardback books in black, white and grey ceramic, the top book slightly open with a ribbon bookmark hanging out, pages softly glowing warm white. *(Shared style block.)*

4. **Teachings**
   An open Bible-style book lying flat with a vintage studio microphone standing behind it, both in matte black and white ceramic, a soft warm glow rising from the pages. *(Shared style block.)*

5. **Contact**
   A rounded 3D envelope in matte white ceramic, slightly open, with a folded black letter peeking out and a small grey speech bubble floating beside it. *(Shared style block.)*

6. **Instagram (@akuwavictor)**
   A rounded-square camera icon in glossy black ceramic with a matte white circular lens ring in the centre and a small white dot in the top right corner, inspired by the classic camera glyph but fully monochrome, no brand gradient. *(Shared style block.)*

7. **YouTube**
   A wide rounded-rectangle screen in glossy black ceramic with a raised matte white play triangle in the centre, floating slightly above a soft shadow. Monochrome, no red. *(Shared style block.)*

8. **Facebook**
   A glossy black ceramic disc with a raised matte white lowercase "f" shape sculpted on its face, edges softly bevelled. Monochrome, no blue. *(Shared style block.)*

## Notes

- Generate the set in one session and reuse the same seed or style reference so lighting and material stay consistent.
- For the PWA icon, export 512 × 512 and 192 × 192 PNGs, plus a 180 × 180 Apple touch icon, and replace the placeholder files in `public/icons/` and `src/app/apple-icon.png`.
- Platform marks (Instagram, YouTube, Facebook) are stylised monochrome glyphs to match the site; check each platform's brand guidelines before using them anywhere they could be read as the official logo.
