// @ts-nocheck
/*
 * Runs on every page: navigation menu, scroll reveal, the Get Started dialog,
 * and the "Get more info" and Contact Us forms.
 */
import { PROGRAMS, LOCATIONS, ENROLL, FORM_ENDPOINT, HERO } from '../config/site';

const $ = (s) => document.querySelector(s);
const tel = (p) => 'tel:' + p.replace(/-/g, '');

/* ---------- Form delivery (Google Apps Script) ---------- */
export async function sendForm(data) {
  if (!FORM_ENDPOINT) return false;
  try {
    const r = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
    const j = await r.json();
    const ok = !!(j && j.ok);
    if (ok && typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_type: data.type, location: data.location });
    return ok;
  } catch (x) {
    return false;
  }
}

/* Location key from a form's location value ("West Gainesville", "North Gainesville", "Not sure yet"). */
export const locKey = (v) => (v === 'North Gainesville' || v === 'north' ? 'north' : 'west');

/* Fallback message when a form can't be delivered. */
export function notSent(kind, L, subject, body) {
  return `<p class="nb" style="margin-top:16px"><b>Not sent yet.</b> Something went wrong and your ${kind} didn’t go through. To reach ${L.n} now, <a href="mailto:${L.e}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">email ${L.e}</a> with your details pre-filled, or call ${L.p}.</p>`;
}
export const okMsg = (what) => `<p class="ok" role="status"><b>Thank you!</b> We received your ${what} and will be in touch soon.</p>`;
export const smsFields = (f, name = 'sms') => {
  const box = f.elements[name];
  return {
    smsConsent: box.checked,
    smsConsentText: box.closest('.sms').querySelector('span').textContent,
    consentedAt: box.checked ? new Date().toISOString() : null,
  };
};

/* ---------- Optional hero video ---------- */
const hm = $('#hm');
if (hm && HERO.video && innerWidth >= 768 && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  const v = document.createElement('video');
  Object.assign(v, { src: HERO.video, poster: HERO.poster, muted: true, loop: true, autoplay: true, playsInline: true });
  v.setAttribute('aria-hidden', 'true');
  hm.prepend(v);
  const b = document.createElement('button');
  b.className = 'vp';
  b.textContent = '❚❚ Pause video';
  b.onclick = () => { v.paused ? (v.play(), (b.textContent = '❚❚ Pause video')) : (v.pause(), (b.textContent = '▶ Play video')); };
  hm.parentNode.append(b);
}

/* ---------- Get Started: 1) program, 2) location, then MyStudio link ---------- */
const dlg = $('#gsd');
const S = { p: null, l: null, fl: null };
function render() {
  const t = $('#gst'), b = $('#gsb'), n = $('#gsp');
  if (!S.p) {
    n.textContent = S.fl ? LOCATIONS[S.fl].n : 'Step 1 of 2';
    t.textContent = 'What are you interested in?';
    b.innerHTML = Object.entries(PROGRAMS).map(([k, v]) => `<button class="opt" data-k="p" data-v="${k}"><b>${v.n}</b><span>${v.d}</span></button>`).join('');
  } else if (!S.l) {
    n.textContent = 'Step 2 of 2';
    t.textContent = 'Choose your location';
    b.innerHTML = Object.entries(LOCATIONS).map(([k, v]) => `<button class="opt" data-k="l" data-v="${k}"><b>${v.n}</b><span>${v.a}</span></button>`).join('') + '<button class="bk" data-back>← Change program</button>';
  } else {
    const P = PROGRAMS[S.p], L = LOCATIONS[S.l], u = (ENROLL[S.p] || {})[S.l];
    n.textContent = 'Your next step';
    t.textContent = P.n;
    b.innerHTML = `<p style="margin-bottom:16px"><b>${L.n}</b> · ${L.a}</p><div style="display:flex;flex-direction:column;gap:12px">${u ? `<a class="btn p" href="${u}" target="_blank" rel="noopener" data-enroll="${S.p}">${P.cta}</a>` : `<a class="btn p" href="${tel(L.p)}">Call to ${P.cta.toLowerCase()}</a>`}<a class="btn o" href="${tel(L.p)}">Ask a question · ${L.p}</a></div><button class="bk" data-back>${S.fl ? '← Change program' : '← Change location'}</button>`;
  }
  t.focus();
}
function openGS(p, l) {
  S.p = PROGRAMS[p] ? p : null;
  S.fl = LOCATIONS[l] ? l : null;
  S.l = S.fl;
  render();
  dlg.showModal();
}

/* ---------- Navigation ---------- */
const bg = $('#bg'), nav = $('#nav');
function closeNav() { nav.classList.remove('open'); bg.setAttribute('aria-expanded', 'false'); bg.setAttribute('aria-label', 'Open menu'); }
bg.onclick = () => {
  const x = nav.classList.toggle('open');
  bg.setAttribute('aria-expanded', x);
  bg.setAttribute('aria-label', x ? 'Close menu' : 'Open menu');
};

document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-gs]');
  if (g) { e.preventDefault(); openGS(g.dataset.p, g.dataset.l); return; }
  if (e.target.closest('[data-x]') || e.target === dlg) dlg.close();
  const o = e.target.closest('.opt');
  if (o) { S[o.dataset.k] = o.dataset.v; render(); }
  if (e.target.closest('[data-back]')) { S.l && !S.fl ? (S.l = null) : (S.p = null); render(); }
  const en = e.target.closest('[data-enroll]');
  if (en && typeof window.gtag === 'function') window.gtag('event', 'begin_registration', { program: en.dataset.enroll });
  const dt = e.target.closest('.dt');
  if (dt) {
    const d = dt.parentNode, x = d.classList.toggle('open');
    dt.setAttribute('aria-expanded', x);
  } else {
    document.querySelectorAll('.dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('.dt').setAttribute('aria-expanded', 'false'); });
  }
  if (e.target.closest('nav a')) closeNav();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.dd.open').forEach((d) => d.classList.remove('open'));
});

/* ---------- Scroll reveal ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((a) => a.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));
} else document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));

/* ---------- "Get more info" forms ---------- */
const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
document.querySelectorAll('.ld form').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = (n) => f.elements[n].value.trim(), st = f.querySelector('.ls'), er = f.querySelectorAll('.er');
  if (v('website')) return;
  const em = !!v('email') && !validEmail(v('email')), nm = !v('name'), ph = v('phone').replace(/\D/g, '').length < 10;
  er[0].textContent = nm ? 'Please enter your name.' : '';
  er[1].textContent = em ? 'Please enter a valid email address.' : '';
  er[2].textContent = ph ? 'Please enter a 10-digit phone number.' : '';
  if (nm) { f.elements.name.focus(); return; }
  if (ph) { f.elements.phone.focus(); return; }
  if (em) { f.elements.email.focus(); return; }
  const loc = f.querySelector('input[name=loc]:checked').value, L = LOCATIONS[locKey(loc)];
  const d = { name: v('name'), email: v('email'), phone: v('phone'), interest: v('interest'), location: loc, type: 'More info request', routeTo: L.e, question: v('q'), ...smsFields(f), source: location.pathname };
  const btn = f.querySelector('[type=submit]'); btn.disabled = true;
  const ok = await sendForm(d); btn.disabled = false;
  if (ok) { st.innerHTML = okMsg('request'); f.reset(); return; }
  st.innerHTML = notSent('request', L, 'Request for info', `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nText consent: ${d.smsConsent ? 'Yes' : 'No'}\nInterested in: ${d.interest}\nLocation: ${loc}\nQuestions: ${d.question}`);
}));

/* ---------- Contact Us form ---------- */
const CUF = document.getElementById('cuf');
if (CUF) CUF.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = CUF, v = (n) => f.elements[n].value.trim(), st = f.querySelector('.ls'), er = f.querySelectorAll('.er'), lc = f.querySelector('input[name=loc]:checked');
  if (v('website')) return;
  const x = [
    !v('name') ? 'Please enter your name.' : '',
    v('phone').replace(/\D/g, '').length < 10 ? 'Please enter a 10-digit phone number.' : '',
    v('email') && !validEmail(v('email')) ? 'Please enter a valid email address.' : '',
    !lc ? 'Please choose a location.' : '',
    !v('msg') ? 'Please enter a message.' : '',
  ], ord = ['name', 'phone', 'email', 'loc', 'msg'];
  x.forEach((m, i) => (er[i].textContent = m));
  const bad = x.findIndex((m) => m);
  if (bad > -1) { (ord[bad] === 'loc' ? f.querySelector('input[name=loc]') : f.elements[ord[bad]]).focus(); return; }
  const loc = lc.value, L = LOCATIONS[locKey(loc)];
  const d = { name: v('name'), phone: v('phone'), email: v('email'), location: loc, routeTo: L.e, topic: v('topic'), message: v('msg'), ...smsFields(f), source: 'contact-us', type: 'Contact message' };
  const btn = f.querySelector('[type=submit]'); btn.disabled = true;
  const ok = await sendForm(d); btn.disabled = false;
  if (ok) { st.innerHTML = okMsg('message'); f.reset(); return; }
  st.innerHTML = notSent('message', L, 'Website message', `Name: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nText consent: ${d.smsConsent ? 'Yes' : 'No'}\nTopic: ${d.topic}\nMessage: ${d.message}`);
});
