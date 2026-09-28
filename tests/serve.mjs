// A tiny static server with no dependencies that applies a Cloudflare Pages `_headers` file,
// so the smoke test runs under the production CSP and security headers.
// Usage: node tests/serve.mjs [root=public] [port=8080]
// Supports the subset of `_headers` this repo uses: unindented URL patterns (with `*` splats and
// `:placeholder` segments), indented `Name: value` lines, `! Name` to detach, and `#` comments.
// Every matching rule applies; a header set by several rules is joined with ", ", as on Pages.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, resolve, sep, extname, basename } from 'node:path';

const root = resolve(process.argv[2] || 'public');
const port = Number(process.argv[3] || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.wasm': 'application/wasm',
};
// Pages configuration files are never served.
const HIDDEN = new Set(['_headers', '_redirects', '_routes.json']);

function parseHeaders(text) {
  const rules = [];
  let rule = null;
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    if (!/^\s/.test(line)) {
      const pat = line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*').replace(/:[A-Za-z]\w*/g, '[^/]+');
      rule = { re: new RegExp(`^${pat}$`), set: [], detach: [] };
      rules.push(rule);
      return;
    }
    if (!rule) throw new Error(`_headers line ${i + 1}: header before any URL pattern`);
    const t = line.trim();
    if (t.startsWith('!')) { rule.detach.push(t.slice(1).trim().toLowerCase()); return; }
    const c = t.indexOf(':');
    if (c < 1) throw new Error(`_headers line ${i + 1}: expected "Name: value"`);
    rule.set.push([t.slice(0, c).trim(), t.slice(c + 1).trim()]);
  });
  return rules;
}

let rules = [];
try { rules = parseHeaders(readFileSync(join(root, '_headers'), 'utf8')); }
catch (e) { if (e.code !== 'ENOENT') throw e; }

function headersFor(path) {
  const out = new Map();
  for (const r of rules) {
    if (!r.re.test(path)) continue;
    for (const [name, value] of r.set) {
      const k = name.toLowerCase();
      out.set(k, out.has(k) ? [out.get(k)[0], `${out.get(k)[1]}, ${value}`] : [name, value]);
    }
    for (const k of r.detach) out.delete(k);
  }
  return out;
}

createServer((req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { path = null; }
  const send = (status, body, type) => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'Method Not Allowed', 'text/plain');
  if (!path) return send(400, 'Bad Request', 'text/plain');

  let file = resolve(root, '.' + path);
  if (file !== root && !file.startsWith(root + sep)) return send(404, 'Not Found', 'text/plain');
  try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); } catch {}
  let body;
  try {
    if (HIDDEN.has(basename(file))) throw new Error('hidden');
    body = readFileSync(file);
  } catch { return send(404, 'Not Found', 'text/plain'); }

  for (const [name, value] of headersFor(path).values()) res.setHeader(name, value);
  res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Content-Length', body.length);
  res.writeHead(200);
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}/ (${rules.length} _headers rule(s))`));
