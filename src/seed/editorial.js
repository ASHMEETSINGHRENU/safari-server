// Display extras layered on top of the base destination records: the species a
// reserve is actually known for, and the zones worth curating as "prime".
//
// Pricing deliberately lives in packagesData.js (generated from the Content Master)
// so the whole-package price is the only figure the site shows — no itemised permit.
//
// Shared by `npm run seed` and `npm run sync:editorial`, so live records can pick
// up copy changes without wiping hand-edited collections.
export const EDITORIAL = {
  'tadoba-andhari':   { primeZones: ['Moharli Core Zone', 'Kolara Core Zone'] },
  'pench-mh':         { primeZones: ['Sillari Core Zone'] },
  'umred-karhandla':  { primeZones: ['Karhandla Zone'] },
  'navegaon-nagzira': {},
  'melghat':          { headlineSpecies: 'Forest Owlet (Endangered)' },
  'bor':              {},
  'bandhavgarh':      { primeZones: ['Tala Core Zone'] },
  'kanha':            { primeZones: ['Kanha Core Zone'] },
  'pench-mp':         { primeZones: ['Turia Core Zone'] },
  'satpura':          { headlineSpecies: 'Indian Leopard', primeZones: ['Madhai Core Zone'] },
  'panna':            { primeZones: ['Madla Core Zone'] },
  'sanjay-dubri':     {},
  'kuno':             { headlineSpecies: 'African Cheetah (Project Cheetah)' }
};

/** Returns the fields to write for one destination record. */
export const editorialFor = (destination) => {
  const e = EDITORIAL[destination.slug] ?? {};
  return {
    headlineSpecies: e.headlineSpecies ?? '',
    zones: destination.zones.map(z => ({ ...z, isPrime: (e.primeZones ?? []).includes(z.name) }))
  };
};
