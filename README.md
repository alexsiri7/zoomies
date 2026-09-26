# Zoomies

A 3D endless-runner for your phone. It's 3am and a ginger and white cat has the zoomies.

Run through the hallway, the garden and the rooftops at night, eating kibble and dodging whatever's in the way. You have nine lives.

## How to play

Swipe left or right to change lanes, and swipe up or tap to jump. On a keyboard, use the arrow keys (or A/D/W and Space).

Tall things (bookcases, bushes, chimneys) have to be dodged. Low things (footstools, hedgehogs, pigeons) can be jumped over. Kibble is worth 10 points, and a full food bowl is worth 25 plus 5 kibble. Finishing a level gives a 100-point bonus, and every round of the three levels gets faster.

## Running it

It's a static page with no build step: `index.html`, `style.css` and `game.js`. Serve the folder and open it in a browser:

```sh
python3 -m http.server
```

It's live at https://zoomies.interstellarai.net, served on Railway by Caddy (see `Dockerfile` and `Caddyfile`, which also set the security headers and the Content Security Policy).

To smoke-test it in headless Chrome (Node 22 or newer, no dependencies):

```sh
node tests/smoke.mjs http://localhost:8000/ /tmp/zoomies-shots
```

## Tech

Three.js r128 is loaded from cdnjs, pinned with a Subresource Integrity hash. All sound (music, crunches, meows) is synthesised live with the Web Audio API, so there are no asset files.
