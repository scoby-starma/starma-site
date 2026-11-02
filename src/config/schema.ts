/*
 * Structured data (schema.org) that tells Google who StarMA is and where each location is.
 * Add opening hours and map coordinates here when they're confirmed; Google uses both for the map results.
 */
import { SITE, LOCATIONS } from './site';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.webp`,
    foundingDate: SITE.founded,
    founder: { '@type': 'Person', name: SITE.founder },
    department: Object.keys(LOCATIONS).map((k) => ({ '@id': `${SITE.url}${LOCATIONS[k as keyof typeof LOCATIONS].path}#business` })),
  };
}

export function locationSchema(key: keyof typeof LOCATIONS) {
  const l = LOCATIONS[key];
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${SITE.url}${l.path}#business`,
    name: `${SITE.name} ${l.n}`,
    url: `${SITE.url}${l.path}`,
    image: `${SITE.url}${SITE.defaultImage}`,
    telephone: `+1-${l.p}`,
    email: l.e,
    address: {
      '@type': 'PostalAddress',
      streetAddress: l.a,
      addressLocality: l.city,
      addressRegion: l.state,
      postalCode: l.zip,
      addressCountry: 'US',
    },
    parentOrganization: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}
