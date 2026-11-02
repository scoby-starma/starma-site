// @ts-nocheck
/* Summer Camp page: day-of-the-week tabs, location registration picker, and the camp inquiry form. */
import { LOCATIONS, CAMP_REGISTRATION } from '../config/site';
import { sendForm, notSent, smsFields, okMsg } from './site';

const E = (id) => document.getElementById(id);
const tel = (p) => 'tel:' + p.replace(/-/g, '');

/* ---------- Day tabs (all five panels are in the page HTML; this only switches them) ---------- */
const tabs = E('tabs');
if (tabs) {
  const btns = [...tabs.querySelectorAll('.tab')];
  const show = (i) => btns.forEach((b, j) => {
    b.setAttribute('aria-selected', j === i);
    b.tabIndex = j === i ? 0 : -1;
    E('dp' + j).hidden = j !== i;
  });
  tabs.addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) show(btns.indexOf(b)); });
  tabs.addEventListener('keydown', (e) => {
    const n = btns.length, c = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    let i;
    if (e.key === 'ArrowRight') i = (c + 1) % n;
    else if (e.key === 'ArrowLeft') i = (c + n - 1) % n;
    else return;
    e.preventDefault(); show(i); btns[i].focus();
  });
}

/* ---------- Registration: choose a location ---------- */
const rg = E('rg'), ro = E('ro');
function setLoc(k) { const r = document.querySelector(`input[name=cloc][value=${k}]`); if (r) r.checked = true; }
if (rg) rg.addEventListener('click', (e) => {
  const b = e.target.closest('.rb');
  if (!b) return;
  const k = b.dataset.k, l = LOCATIONS[k], reg = CAMP_REGISTRATION[k];
  rg.querySelectorAll('.rb').forEach((x) => x.setAttribute('aria-pressed', x === b));
  setLoc(k);
  ro.hidden = false;
  ro.innerHTML = `<h3 class="d" style="font-size:34px;margin-bottom:6px">${l.n}</h3><p>${l.a}, ${l.z}</p><div class="btns">${reg ? `<a class="btn p" href="${reg}" target="_blank" rel="noopener">Explore Registration</a>` : ''}<a class="btn ${reg ? 'o' : 'p'}" href="#cname">Ask About Camp</a></div>${reg ? '' : `<p class="nb" style="margin-top:14px">Online registration for ${l.n} isn’t open yet. To register in the meantime, call <a href="${tel(l.p)}">${l.p}</a> or email <a href="mailto:${l.e}">${l.e}</a>.</p>`}`;
});

/* ---------- Camp inquiry form ---------- */
const f = E('cf');
if (f) f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = (n) => f.elements[n].value.trim(), loc = (f.querySelector('input[name=cloc]:checked') || {}).value, err = {};
  if (v('cweb')) return;
  if (!v('cname')) err.cname = 'Please enter your name.';
  if (v('cemail') && !/^\S+@\S+\.\S+$/.test(v('cemail'))) err.cemail = 'Please enter a valid email address.';
  if (v('cphone').replace(/\D/g, '').length < 10) err.cphone = 'Please enter a 10-digit phone number.';
  if (!v('cage')) err.cage = 'Please enter your child’s age.';
  if (!loc) err.cloc = 'Please choose a location.';
  ['cname', 'cemail', 'cphone', 'cage', 'cloc'].forEach((k) => {
    E('e-' + k).textContent = err[k] || '';
    const i = f.elements[k];
    if (i && i.nodeType) i.setAttribute('aria-invalid', !!err[k]);
  });
  const fs = E('fs2');
  if (Object.keys(err).length) {
    fs.innerHTML = '';
    const k = Object.keys(err)[0];
    (k === 'cloc' ? f.querySelector('input[name=cloc]') : f.elements[k]).focus();
    return;
  }
  const L = LOCATIONS[loc];
  const pl = { type: 'Summer Camp inquiry', name: v('cname'), phone: v('cphone'), email: v('cemail'), location: L.n, routeTo: L.e, childAge: v('cage'), campWeeks: v('cweeks'), question: v('cmsg'), ...smsFields(f, 'csms'), source: 'summer-camp' };
  const btn = f.querySelector('[type=submit]'); btn.disabled = true;
  const ok = await sendForm(pl); btn.disabled = false;
  if (ok) { fs.innerHTML = okMsg('inquiry'); f.reset(); return; }
  fs.innerHTML = notSent('request', L, 'Summer Camp inquiry', `Parent/guardian: ${pl.name}\nEmail: ${pl.email}\nPhone: ${pl.phone}\nText consent: ${pl.smsConsent ? 'Yes' : 'No'}\nChild age: ${pl.childAge}\nCamp weeks: ${pl.campWeeks}\nQuestions: ${pl.question}`);
});
