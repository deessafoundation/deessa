# Reading guide stickers

The guide works today with five emoji fallbacks: butterfly (default), star, flower, bear and rocket.

## PNG artwork to create

Create five **256 x 256 px transparent PNGs** (square canvas, RGBA). Keep each friendly character centered with about 10% transparent padding. Use a bold, simple silhouette and a clear outline that reads at 48 px. Soft colors, a calm expression, no lettering, no flashing/animation, and no detailed background work best. Keep each file below roughly 100 KB when practical.

Suggested artwork and filenames:
- butterfly.png: a friendly butterfly with simple rounded wings
- star.png: a smiling five-point star
- flower.png: a cheerful flower with rounded petals
- bear.png: a gentle teddy-bear face
- rocket.png: a small playful rocket, with a soft rounded shape

## Add your artwork

1. Put the PNGs in this directory.
2. In lib/types/accessibility.ts, find GUIDE_STICKERS and set the matching image field to its public URL, for example image: '/accessibility/reading-friends/butterfly.png'. Leave image: null for choices still using emoji.
3. The same image appears in the choice button and centered below the reading line. If it fails to load, the corresponding emoji automatically replaces it. No user uploads or database changes are required.

The marker is decorative for screen readers; each selection button has a spoken name and selected state. Negative-colors mode intentionally reverses image/emoji colors with the rest of the page.
