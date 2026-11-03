/*
 * Star Martial Arts: site Worker.
 * Serves the static site, plus a small private API for the team editing screen (/admin/):
 *   GET  /api/me        -> who is signed in
 *   GET  /api/requests  -> recent edit requests
 *   POST /api/requests  -> file a new edit request (GitHub issue labeled "site-edit", optional photo)
 *
 * Security: every /api/ call must carry a valid Cloudflare Access login for one of ALLOWED_EDITORS.
 * If Access isn't configured yet, the API refuses everything (fails closed).
 *
 * Settings (wrangler.jsonc "vars"): GITHUB_REPO, ALLOWED_EDITORS, ACCESS_TEAM_DOMAIN, ACCESS_AUD
 * Secret (Cloudflare dashboard): GITHUB_TOKEN  (fine-grained token: this repo, Contents + Issues read/write)
 */

const LABEL = 'site-edit';
const UPLOAD_BRANCH = 'edit-uploads';
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      const user = await authenticate(request, env);
      if (!user) return json({ error: 'Please sign in with your StarMA email.' }, 401);

      if (url.pathname === '/api/me' && request.method === 'GET') return json({ email: user });
      if (url.pathname === '/api/requests' && request.method === 'GET') return json(await listRequests(env));
      if (url.pathname === '/api/requests' && request.method === 'POST') return await createRequest(request, env, user);
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: err.publicMessage || 'Something went wrong. Please try again, or text Justin.' }, err.status || 500);
    }
  },
};

/* ---------- Cloudflare Access login check ---------- */
let certCache = null;
async function authenticate(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').trim();
  const aud = (env.ACCESS_AUD || '').trim();
  if (!team || !aud) throw publicError('The editor login isn’t set up yet (Cloudflare Access).', 503);

  const token = request.headers.get('Cf-Access-Jwt-Assertion') || cookie(request, 'CF_Authorization');
  if (!token) return null;
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const header = JSON.parse(b64urlText(h));
  const payload = JSON.parse(b64urlText(p));

  const issuer = `https://${team}`;
  const audOk = Array.isArray(payload.aud) ? payload.aud.includes(aud) : payload.aud === aud;
  if (!audOk || payload.iss !== issuer || !payload.exp || payload.exp * 1000 < Date.now()) return null;

  if (!certCache || certCache.at < Date.now() - 3600e3) {
    const r = await fetch(`${issuer}/cdn-cgi/access/certs`);
    certCache = { at: Date.now(), keys: (await r.json()).keys || [] };
  }
  const jwk = certCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!valid) return null;

  const email = String(payload.email || '').toLowerCase();
  const allowed = String(env.ALLOWED_EDITORS || '').toLowerCase().split(',').map((x) => x.trim()).filter(Boolean);
  return allowed.includes(email) ? email : null;
}

/* ---------- GitHub ---------- */
async function gh(env, path, init = {}) {
  if (!env.GITHUB_TOKEN) throw publicError('The editor isn’t connected to GitHub yet (missing GITHUB_TOKEN).', 503);
  const r = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'starma-site-editor',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, data };
}

async function listRequests(env) {
  const r = await gh(env, `/issues?labels=${LABEL}&state=all&per_page=15&sort=created&direction=desc`);
  if (!r.ok) throw publicError('Couldn’t load recent requests from GitHub.', 502);
  return r.data.filter((i) => !i.pull_request).map((i) => ({
    number: i.number,
    title: i.title,
    state: i.state,
    created: i.created_at,
    url: i.html_url,
  }));
}

async function createRequest(request, env, user) {
  const form = await request.formData();
  const page = clean(form.get('page'), 120);
  const kind = clean(form.get('kind'), 60);
  const details = clean(form.get('details'), 5000);
  const name = clean(form.get('name'), 80);
  if (!page || !details) throw publicError('Please choose a page and describe the change.', 400);

  let photoNote = '';
  const photo = form.get('photo');
  if (photo && typeof photo === 'object' && photo.size > 0) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(photo.type)) throw publicError('Photos must be JPG, PNG, WebP, or HEIC.', 400);
    if (photo.size > MAX_PHOTO_BYTES) throw publicError('That photo is over 8 MB. Please send a smaller one.', 400);
    const path = await uploadPhoto(env, photo);
    photoNote = `\n\n**Photo attached:** \`${path}\` on the \`${UPLOAD_BRANCH}\` branch\n![photo](https://github.com/${env.GITHUB_REPO}/blob/${UPLOAD_BRANCH}/${encodeURI(path)}?raw=true)`;
  }

  await gh(env, '/labels', { method: 'POST', body: JSON.stringify({ name: LABEL, color: 'E10600', description: 'Website edit request from the team editor' }) });

  const title = `[${kind || 'Edit'}] ${page}: ${details.split('\n')[0].slice(0, 70)}`;
  const body = [
    `**Requested by:** ${name ? `${name} (${user})` : user}`,
    `**Page:** ${page}`,
    `**Type of change:** ${kind || 'Not specified'}`,
    '',
    '**What should change:**',
    details.split('\n').map((l) => `> ${l}`).join('\n'),
    photoNote,
    '',
    '---',
    '_Filed from the StarMA team editor. Claude will prepare the change as a pull request with a preview link; it goes live only after Justin approves (merges) it._',
  ].join('\n');

  const r = await gh(env, '/issues', { method: 'POST', body: JSON.stringify({ title, body, labels: [LABEL] }) });
  if (!r.ok) throw publicError('GitHub didn’t accept the request. Please try again.', 502);
  return json({ ok: true, number: r.data.number, url: r.data.html_url });
}

async function uploadPhoto(env, file) {
  const ref = await gh(env, `/git/ref/heads/${UPLOAD_BRANCH}`);
  if (!ref.ok) {
    const main = await gh(env, '/git/ref/heads/main');
    if (!main.ok) throw publicError('Couldn’t prepare the photo upload.', 502);
    await gh(env, '/git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${UPLOAD_BRANCH}`, sha: main.data.object.sha }) });
  }
  const safe = String(file.name || 'photo').toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(-60) || 'photo.jpg';
  const path = `requests/${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}-${safe}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const r = await gh(env, `/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Photo for website edit request (${path})`, content: btoa(bin), branch: UPLOAD_BRANCH }),
  });
  if (!r.ok) throw publicError('The photo couldn’t be uploaded. Please try again.', 502);
  return path;
}

/* ---------- helpers ---------- */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
function publicError(msg, status) { const e = new Error(msg); e.publicMessage = msg; e.status = status; return e; }
function clean(v, max) { return String(v || '').replace(/\r/g, '').trim().slice(0, max); }
function cookie(req, name) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? m[1] : null;
}
function b64urlBytes(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}
function b64urlText(s) { return new TextDecoder().decode(b64urlBytes(s)); }
