// Headless Chrome smoke test with no dependencies (Node >= 22 for the global WebSocket).
// Usage: node tests/smoke.mjs <url> [screenshot-dir]
// Fails on uncaught JS errors, console errors, CSP violations, a missing WebGL canvas,
// or collectables that do not bob and spin in the running game.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] || 'http://localhost:8080/';
const shotDir = process.argv[3];
const chromeBin = process.env.CHROME_BIN || 'google-chrome';
const port = 9300 + Math.floor(Math.random() * 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(chromeBin, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'zoomies-'))}`,
  '--no-first-run', '--no-default-browser-check', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--autoplay-policy=no-user-gesture-required', '--window-size=390,844', 'about:blank',
], { stdio: 'ignore' });

let ws;
try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === 'page');
    } catch {}
  }
  if (!target) throw new Error('Chrome did not start');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const problems = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      problems.push(`uncaught: ${d.exception?.description || d.text}`);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      problems.push(`console.error: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
    } else if (m.method === 'Log.entryAdded') {
      const e = m.params.entry;
      if (e.level === 'error' || /Content Security Policy|Refused to/i.test(e.text)) problems.push(`log(${e.source}): ${e.text}${e.url ? " " + e.url : ""}`);
    }
  };
  const send = (method, params = {}) => new Promise((r) => {
    const mid = ++id; pending.set(mid, r); ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  // Record CSP violations from inside the page; CDP console/log events do not always carry them.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' blocked ' + (e.blockedURI || 'inline')));` });
  // Record every collectable the game spawns by wrapping the builders things.js publishes.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__pickups = []; let zt;
    Object.defineProperty(window, 'ZoomiesThings', { configurable: true, get: () => zt, set(v) {
      for (const k of ['kibble', 'bowl']) { const build = v[k]; v[k] = (...a) => { const m = build(...a); window.__pickups.push(m); return m; }; }
      zt = v; } });` });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url });
  await sleep(3000);

  const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
  const shot = async (name) => {
    if (!shotDir) return;
    mkdirSync(shotDir, { recursive: true });
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(shotDir, name), Buffer.from(r.result.data, 'base64'));
  };

  const info = await evalJs(`(() => { const c = document.querySelector('#stage canvas');
    return { title: document.title, three: typeof THREE !== 'undefined' && THREE.REVISION, canvas: !!c, w: c && c.width, h: c && c.height,
             gl: !!(c && (c.getContext('webgl2') || c.getContext('webgl'))) }; })()`);
  await shot('menu.png');

  // Start a run and let it play for a moment.
  await evalJs(`document.getElementById('playBtn') && document.getElementById('playBtn').click()`);
  await sleep(2500);
  await shot('playing.png');

  // Rows spawn at random, so wait for a collectable still in the scene, then watch it for 300 ms.
  const pose = (i) => evalJs(`(m => ({ live: !!m.parent, y: m.position.y, r: m.rotation.y }))(window.__pickups[${i}])`);
  let moves = null;
  for (let tries = 0; tries < 40 && moves === null; tries++) {
    const i = await evalJs('window.__pickups.findIndex((m) => m.parent)');
    if (i < 0) { await sleep(500); continue; }
    const a = await pose(i);
    await sleep(300);
    const b = await pose(i);
    if (b.live) moves = a.y !== b.y && a.r !== b.r;
  }
  if (moves === null) problems.push('no collectable spawned within 20 s');
  else if (!moves) problems.push('collectables do not bob and spin in the game');

  const csp = (await evalJs('window.__csp')) || [];
  for (const v of csp) problems.push(`CSP violation: ${v}`);
  console.log('page info:', JSON.stringify(info));
  if (!info || info.title !== 'Zoomies') problems.push(`page did not load (title ${info && info.title})`);
  if (!info || !info.canvas || !info.w) problems.push('no rendered canvas in #stage');
  if (!info || info.three !== '128') problems.push(`unexpected THREE.REVISION ${info && info.three}`);
  if (problems.length) {
    console.error('FAIL\n' + problems.map((p) => '  - ' + p).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('OK: canvas rendered, no JS errors or CSP violations');
  }
} catch (e) {
  console.error('FAIL:', e.message);
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill('SIGKILL');
}
