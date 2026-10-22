# Zoomies — agent guide

A 3D endless-runner for phones: a ginger-and-white cat with the 3am zoomies runs through a hallway, a garden and the rooftops, eating kibble and dodging obstacles, with nine lives. Live at https://zoomies.interstellarai.net (Cloudflare Pages, git-connected: no build command, output directory `public`).

## Layout

A static page with no build step and no dependencies:

- `public/`: the only directory Cloudflare Pages serves. Everything else in the repo (tests, `.github/`, docs) stays private, so every file the site needs lives here.
  - `public/index.html`: markup only. It loads Google Fonts, Three.js r128 from cdnjs (with SRI), `things.js` and `game.js`.
  - `public/things.js`: the collectable, obstacle and finish builders and `LEVELS`, published as `window.ZoomiesThings`. It touches no DOM, so `tests/style.mjs` can build them.
  - `public/game.js`: the game (Three.js scene, input, the levels loop, Web Audio sound).
  - `public/style.css`: the styles.
  - `public/_headers`: the Cloudflare Pages response headers: the CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy and `Cache-Control: no-cache`. Pages does not serve it.
- `tests/serve.mjs`: a tiny static server with no dependencies that serves `public/` with the `_headers` rules applied, as Pages does.
- `tests/smoke.mjs`: a headless Chrome smoke test with no dependencies (Node >= 22).
- `tests/style.mjs`: checks the collectable and obstacle style rule against the real Three.js r128, with no dependencies (Node >= 22).

## Run

```sh
node tests/serve.mjs public 8000   # then open http://127.0.0.1:8000/ (with the production headers and CSP)
```

`python3 -m http.server -d public 8000` also works but sends no CSP.

## Test

```sh
node tests/smoke.mjs http://127.0.0.1:8000/ /tmp/zoomies-shots
node tests/style.mjs   # optionally with a local copy of three.min.js r128 as the argument
```

The test loads the page in headless Chrome at phone size, clicks Play and saves `menu.png` and `playing.png`. It fails on uncaught JS errors, `console.error`, CSP violations or a missing WebGL canvas. `tests/style.mjs` builds every collectable, obstacle and finish from `public/things.js` and checks their materials. CI (`.github/workflows/ci.yml`) runs both, the smoke test against `tests/serve.mjs`, which applies `public/_headers`, so the production CSP is exercised. For any UI or gameplay change, look at the screenshots, not just the exit code.

## Invariants

- Anything the site serves goes in `public/`; nothing outside it is deployed.
- Keep it a static page with no build step, no bundler, no npm dependencies and no backend, unless the owner says otherwise.
- Three.js is pinned to r128 from cdnjs with an SRI `integrity` hash and `crossorigin="anonymous"`. Any version or URL change must update the SRI hash (take it from `https://api.cdnjs.com/libraries/three.js/<ver>?fields=sri` and verify it by hashing the file) and the CSP in `public/_headers` if the host changes.
- All sound is synthesised live with the Web Audio API. Add no audio, image or model asset files.
- Keep the CSP working without `'unsafe-inline'`: no inline `<script>`, no inline `<style>` or `style="..."` attributes, and no `on*=` handlers in HTML. Setting `element.style.x` from JS is fine. A new external origin needs a matching CSP change in `public/_headers`.
- Controls are mobile-first: swipe left/right to change lanes, swipe up or tap to jump, plus the keyboard (arrows, A/D/W, Space). Keep both working, and keep `touch-action: none` on the stage.
- Collectables and obstacles must read apart at a glance, without relying on hue: collectables use `pickupMat` (warm gold that glows) and bob and spin; obstacles are cool or dark, never glow, never use `MeshBasicMaterial` and stay still; every low obstacle carries the `hurdle` marker and no tall one does. `tests/style.mjs` enforces the materials and the marker.
- The best score is stored in `localStorage` under `zoomies-best`. Keep reads and writes in try/catch.
