/*
 * Star Martial Arts: central site settings.
 * Change locations, phone numbers, MyStudio links, form delivery and analytics here.
 * Every page and script reads from this file, so one edit updates the whole site.
 */

export const SITE = {
  name: 'Star Martial Arts',
  url: 'https://www.mystarma.com',
  founded: '2006',
  founder: 'Ed Gnad',
  defaultImage: '/images/hero.webp',
};

export const LOCATIONS = {
  west: {
    n: 'West Gainesville',
    short: 'West',
    a: '500 NW 60th St, Suite A',
    city: 'Gainesville',
    state: 'FL',
    zip: '32607',
    z: 'Gainesville, FL 32607',
    p: '352-505-1499',
    e: 'westgv@mystarma.com',
    path: '/locations/west-gainesville/',
  },
  north: {
    n: 'North Gainesville',
    short: 'North',
    a: '5000 NW 34th Blvd, Suite 5',
    city: 'Gainesville',
    state: 'FL',
    zip: '32605',
    z: 'Gainesville, FL 32605',
    p: '352-672-6356',
    e: 'northgv@mystarma.com',
    path: '/locations/north-gainesville/',
  },
};

/* Programs shown in the Get Started dialog. cta = the button families see at the last step. */
export const PROGRAMS = {
  kids: { n: 'Kids Martial Arts', d: 'Ages 6–12', cta: 'Start Your Trial' },
  adult: { n: 'Teen & Adult Martial Arts', d: 'Ages 13 and up, in their own classes', cta: 'Start Your Trial' },
  after: { n: 'Gainesville’s Best After School Program', d: 'School pickup and supervised afternoons', cta: 'Schedule a Tour' },
  camp: { n: 'Gainesville’s Best Summer Camp', d: 'Adventure, friends, and themed weeks', cta: 'Schedule a Tour' },
};

/* MyStudio registration links, by program and location. */
export const ENROLL = {
  kids: {
    west: 'https://cp.mystudio.io/t/?=3523744950/243/2886//1793649691',
    north: 'https://cp.mystudio.io/t/?=3526726356/17214/64986//1793651888',
  },
  adult: {
    west: 'https://cp.mystudio.io/t/?=3523744950/243/6441//1793649691',
    north: 'https://cp.mystudio.io/t/?=3526726356/17214/66073//1793651888',
  },
  after: {
    west: 'https://cp.mystudio.io/t/?=3523744950/243/51538//1793649891',
    north: 'https://cp.mystudio.io/t/?=3526726356/17214/66074//1793652106',
  },
  camp: {
    west: 'https://cp.mystudio.io/t/?=3523744950/243/51538//1793649891',
    north: 'https://cp.mystudio.io/t/?=3526726356/17214/66074//1793652106',
  },
};

/*
 * Summer Camp page "Explore Registration" buttons. Leave '' to show the call/email
 * fallback instead. Fill in when camp registration opens in MyStudio.
 */
export const CAMP_REGISTRATION = { west: '', north: '' };

/* Camp sale banner. Set active: true only when an offer is confirmed and live. */
export const CAMP_PROMO = { active: false, name: '', ends: '', offers: [] };

/* Google Apps Script web app that receives every form and routes it to the location inbox. */
export const FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzOb1wKGkFNV_HYQgNaxetK7dKwFRb-qg3K61S8-giEPy5Daad2MCnH1Z00Lug6BpM7/exec';

/* Google Analytics 4 measurement ID, e.g. 'G-XXXXXXXXXX'. Leave '' to turn analytics off. */
export const GA4_ID = '';

/* Optional homepage hero video. Leave '' to use the hero photo. */
export const HERO = { video: '', poster: '' };

/* After School pickup schools: [name, other names families might type, locations]. */
export const SCHOOLS = [
  ['Hidden Oak Elementary', [], ['west']],
  ['Chiles Elementary', [], ['west']],
  ['Terwilliger Elementary', [], ['west']],
  ['Wiles Elementary', [], ['west']],
  ['Meadowbrook Elementary', [], ['west']],
  ['Littlewood Elementary', [], ['west']],
  ['Parker Elementary', [], ['west']],
  ['Frazer School', [], ['west']],
  ['Howard Bishop Middle School', ['Howard Bishop'], ['west']],
  ['P.K. Yonge', ['PK Yonge'], ['west']],
  ['Talbot Elementary', [], ['north']],
  ['Norton Elementary', [], ['north']],
  ['Glen Springs Elementary', [], ['north']],
  ['Gainesville Community Christian School', ['GCCS', 'Community Christian'], ['north']],
  ['Westwood Middle School', ['Westwood'], ['north']],
];
