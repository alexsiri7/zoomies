# Zoomies

A 3D endless-runner for your phone. It's 3am and a ginger and white cat has the zoomies.

Run through the hallway, the garden and the rooftops at night, eating kibble and dodging whatever's in the way. You have nine lives.

## How to play

Swipe left or right to change lanes, and swipe up or tap to jump. On a keyboard, use the arrow keys (or A/D/W and Space).

Tall things (bookcases, bushes, chimneys) have to be dodged. Low things (footstools, hedgehogs, pigeons) can be jumped over. Kibble is worth 10 points, and a full food bowl is worth 25 plus 5 kibble. Finishing a level gives a 100-point bonus, and every round of the three levels gets faster.

## Running it

It's a static page with no build step: `public/index.html`, `public/style.css` and `public/game.js`. Serve the `public` folder and open it in a browser:

```sh
node tests/serve.mjs public 8000   # or: python3 -m http.server -d public 8000
```

It's live at https://zoomies.interstellarai.net, served by Cloudflare Pages from the `public` folder. `public/_headers` sets the security headers and the Content Security Policy, and `tests/serve.mjs` applies the same file locally.

To smoke-test it in headless Chrome (Node 22 or newer, no dependencies):

```sh
node tests/smoke.mjs http://127.0.0.1:8000/ /tmp/zoomies-shots
```

## Tech

Three.js r128 is loaded from cdnjs, pinned with a Subresource Integrity hash. All sound (music, crunches, meows) is synthesised live with the Web Audio API, so there are no asset files.
