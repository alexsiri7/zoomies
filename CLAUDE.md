# Zoomies — agent guide

A 3D endless-runner for phones: a ginger-and-white cat with the 3am zoomies runs through a hallway, a garden and the rooftops, eating kibble and dodging obstacles, with nine lives. Live at https://zoomies.interstellarai.net (Railway, Caddy).

## Layout

A static page with no build step and no dependencies:

- `index.html`: markup only. It loads Google Fonts, Three.js r128 from cdnjs (with SRI) and `game.js`.
- `game.js`: the whole game (Three.js scene, input, levels, Web Audio sound).
- `style.css`: the styles.
- `Caddyfile` + `Dockerfile` (`caddy:2-alpine`): the production server. It listens on `$PORT` and sets the security headers and the CSP.
- `tests/smoke.mjs`: a headless Chrome smoke test with no dependencies (Node >= 22).

## Run

```sh
python3 -m http.server 8000        # then open http://localhost:8000/
```

`http.server` sends no CSP. To test the real headers, run Caddy with the repo's Caddyfile: `SITE_ROOT=$PWD PORT=8080 caddy run --config Caddyfile`.

## Test

```sh
node tests/smoke.mjs http://localhost:8000/ /tmp/zoomies-shots
```

The test loads the page in headless Chrome at phone size, clicks Play and saves `menu.png` and `playing.png`. It fails on uncaught JS errors, `console.error`, CSP violations or a missing WebGL canvas. CI (`.github/workflows/ci.yml`) runs it against the built Docker image, so the production CSP is exercised. For any UI or gameplay change, look at the screenshots, not just the exit code.

## Invariants

- Keep it a static page with no build step, no bundler, no npm dependencies and no backend, unless the owner says otherwise.
- Three.js is pinned to r128 from cdnjs with an SRI `integrity` hash and `crossorigin="anonymous"`. Any version or URL change must update the SRI hash (take it from `https://api.cdnjs.com/libraries/three.js/<ver>?fields=sri` and verify it by hashing the file) and the CSP in `Caddyfile` if the host changes.
- All sound is synthesised live with the Web Audio API. Add no audio, image or model asset files.
- Keep the Caddy CSP working without `'unsafe-inline'`: no inline `<script>`, no inline `<style>` or `style="..."` attributes, and no `on*=` handlers in HTML. Setting `element.style.x` from JS is fine. A new external origin needs a matching CSP change in `Caddyfile`.
- Controls are mobile-first: swipe left/right to change lanes, swipe up or tap to jump, plus the keyboard (arrows, A/D/W, Space). Keep both working, and keep `touch-action: none` on the stage.
- The best score is stored in `localStorage` under `zoomies-best`. Keep reads and writes in try/catch.
