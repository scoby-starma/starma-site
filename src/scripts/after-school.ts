// @ts-nocheck
/* After School page: school lookup (suggests the location) and the tour request form. */
import { LOCATIONS, SCHOOLS } from '../config/site';
import { sendForm, notSent, locKey, smsFields, okMsg } from './site';

const E = (id) => document.getElementById(id);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const find = (q) => { q = norm(q); return q ? SCHOOLS.find((s) => [s[0], ...s[1]].some((n) => norm(n) === q)) : null; };

const school = E('f-school');
if (school) school.addEventListener('input', (e) => {
  const s = find(e.target.value), hint = E('f-hint');
  if (!s) { hint.textContent = ''; return; }
  if (s[2].length === 1) {
    const r = document.querySelector(`#tf input[name=loc][value=${s[2][0]}]`);
    if (r) r.checked = true;
    hint.textContent = `${s[0]} is served by our ${LOCATIONS[s[2][0]].n} location.`;
  } else hint.textContent = `${s[0]} is served by both locations. Please choose one.`;
});

const tf = E('tf');
if (tf) tf.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = tf, v = (n) => f.elements[n].value.trim(), loc = (f.querySelector('input[name=loc]:checked') || {}).value, err = {};
  if (v('website')) return;
  if (!v('name')) err.name = 'Please enter your name.';
  if (v('email') && !/^\S+@\S+\.\S+$/.test(v('email'))) err.email = 'Please enter a valid email address.';
  if (v('phone').replace(/\D/g, '').length < 10) err.phone = 'Please enter a 10-digit phone number.';
  if (!v('school')) err.school = 'Please enter your child’s school.';
  if (!v('grade')) err.grade = 'Please select a grade.';
  if (!loc) err.loc = 'Please choose a location.';
  ['name', 'email', 'phone', 'school', 'grade', 'loc'].forEach((k) => {
    E('e-' + k).textContent = err[k] || '';
    const i = f.elements[k];
    if (i && i.nodeType) i.setAttribute('aria-invalid', !!err[k]);
  });
  const fs = E('fs');
  if (Object.keys(err).length) {
    fs.innerHTML = '';
    const first = Object.keys(err)[0];
    (first === 'loc' ? f.querySelector('input[name=loc]') : f.elements[first]).focus();
    return;
  }
  const L = LOCATIONS[locKey(loc)];
  const pl = { type: 'After School tour request', name: v('name'), phone: v('phone'), email: v('email'), location: L.n, routeTo: L.e, school: v('school'), grade: v('grade'), availability: v('when'), question: v('q'), ...smsFields(f), source: 'after-school-program' };
  const btn = f.querySelector('[type=submit]'); btn.disabled = true;
  const ok = await sendForm(pl); btn.disabled = false;
  if (ok) { fs.innerHTML = okMsg('tour request'); f.reset(); return; }
  fs.innerHTML = notSent('request', L, 'After School tour request', `Parent/guardian: ${pl.name}\nEmail: ${pl.email}\nPhone: ${pl.phone}\nText consent: ${pl.smsConsent ? 'Yes' : 'No'}\nSchool: ${pl.school}\nGrade: ${pl.grade}\nAvailability: ${pl.availability}\nQuestions: ${pl.question}`);
});
