# For Saba

A personal, single-purpose static website. No backend, no database, no
build step, no API keys. Every asset (photos, the song, fonts fallback)
ships inside this repo — nothing points at anyone's local machine.

## Environment variables

**None.** This is a 100% static site (HTML/CSS/JS + local image/audio
files). There is nothing to configure at deploy time — no `.env` file,
no secrets, no API keys. If a deploy platform asks for a build command,
the answer is: none needed, it's already plain static files.

## Deploy it (GitHub Pages — free, no config)

1. Create a new repo on GitHub (any name, e.g. `for-saba`).
2. From inside this folder:
   ```bash
   git init
   git add -A
   git commit -m "For Saba"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `(root)` → Save**.
4. Wait ~1 minute. Your live URL will be:
   `https://<your-username>.github.io/<repo-name>/`

That URL is a real hosted page — open it directly in Safari or Chrome
on any phone. (This matters: opening it *inside an app's built-in
preview pane* — including Claude's own file preview — can silently
block audio and other browser features that a real browser tab
allows. Always test the actual deployed URL in Safari/Chrome.)

Any other static host works identically since there's no server logic:
Netlify, Vercel, Cloudflare Pages — drag the folder in, or connect the
repo, no config needed.

## What changed for mobile / production

- **Audio**: re-encoded the song into a clean, standard MP3 (the
  original file carried leftover container metadata from how it was
  originally ripped, which is exactly the kind of thing that plays
  fine in some browsers and silently fails in stricter ones like
  iOS Safari). Playback is triggered directly inside the button's
  click handler (required for iOS Safari / Android Chrome autoplay
  policy), and now reports a visible state if playback ever fails
  instead of failing silently.
- **Viewport / safe areas**: added `viewport-fit=cover` and
  `env(safe-area-inset-*)` padding so fixed elements (the sound
  button, the lightbox close button) don't sit under the iPhone
  notch/home-indicator.
- **Full-height sections**: added a `100vh` fallback before `100svh`
  for older mobile browsers that don't support dynamic viewport units.
- **Tap targets**: every button/control is sized to at least the
  44×44px minimum recommended for touch.
- **Touch hygiene**: `touch-action: manipulation` and disabled tap
  highlight flashing on all buttons; `overflow-x: hidden` as a safety
  net against any transform (e.g. the tilted scrapbook photos)
  causing sideways scroll on narrow screens.
- **iOS zoom-on-focus**: the date input's font-size is fixed at 16px+
  so Safari doesn't zoom in when it's tapped.

## Tested

Automated (headless Chromium, real touch-tap events, 4 device
viewports — iPhone SE/375px, iPhone 14/390px, Pixel 7/412px, Galaxy
S8/360px):
- Zero horizontal overflow on any of the four.
- Audio element loads over a real HTTP request, reaches
  `readyState 4` (fully playable), and plays with no decode errors.
- Full tap-through of every interaction: begin → quick question →
  timeline → "Let's Make Plans" (date + activity + lock-in) →
  scrapbook lightbox → letter seal reveal — all confirmed working via
  simulated touch, not mouse clicks.

**Not possible to test from here (no internet access, no physical
device access) — please verify manually after deploying:**
- Actual audible sound out of a real phone's speaker (I can confirm
  the browser successfully loads and plays the file; I can't confirm
  what comes out of a physical speaker).
- Real iOS Safari specifically — my automated testing uses Chromium,
  which is a very close proxy for Android Chrome but not a perfect
  stand-in for Safari's WebKit engine.
- Any behavior specific to a particular phone/OS version.

## Folder structure
```
index.html
styles.css
script.js
images/        (12 photos, referenced by name in index.html)
audio/our-song.mp3
```
Replacing a photo: keep the exact filename, drop in your replacement.
