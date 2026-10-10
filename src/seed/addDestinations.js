// Adds the satellite reserves that exist in the Content Master package sheet but
// were never given a destination record (Tipeshwar, Mogarkasa, Radhanagri, Ratapani,
// Kheoni). Upserts by slug, so re-running is safe and never touches other collections.
//
// Use this instead of `npm run seed` when the reserves are already live: seed wipes
// every collection, which throws away hand-edited copy, reviews, and bookings.
import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';
import { editorialFor } from './editorial.js';
import { PACKAGES_BY_SLUG } from './packagesData.js';

// Base records only. Display extras (headline species / prime zones) come from
// editorial.js; whole-package tiers come from packagesData.js, same as seed.
export const NEW_DESTINATIONS = [
  {
    name: 'Tipeshwar Wildlife Sanctuary',
    slug: 'tipeshwar',
    state: 'Maharashtra',
    tagline: 'The Breeding Haven of Yavatmal',
    shortDesc: 'A compact, low-traffic sanctuary celebrated for exceptionally high tiger cub survival and intimate, unhurried photographic sightings.',
    editorialQuote: 'Tipeshwar is where the next generation of Vidarbha tigers is quietly raised, far from the convoy.',
    fullDesc: 'Spread across 148.63 sq km in Yavatmal district, Tipeshwar Wildlife Sanctuary guards the southern watershed of the Penganga river. Its teak-and-bamboo hills, perennial streams, and dense undergrowth have produced one of central India’s most reliable tiger breeding records, with tigresses routinely raising full litters in the open core.',
    heroImage: '/assets/img/Gallary/IMG_5312.webp',
    galleryImages: ['/assets/img/Hero/hero-7.webp', '/assets/img/Hero/hero-3.webp'],
    areaSqKm: 148.63,
    tigerCount: '10+ Tigers (High Cub Survival)',
    bestTimeToVisit: 'October to June',
    coordinates: { lat: 19.8698, lng: 78.4316 },
    mapPosition: { x: 46, y: 78 },
    startingPrice: 14000,
    availability: 'FEW PERMITS',
    bestSuitedFor: 'Exceptionally high tiger cub breeding success rates and incredible photographic visibility.',
    gateway: 'Nagpur or Hyderabad',
    packageDuration: '3 Days / 2 Nights (Includes 3 Open Gypsy Safaris)',
    safariPlan: '3 Open Gypsy Safaris',
    zones: [
      {
        name: 'Tipeshwar Core Zone',
        type: 'core',
        vehicleQuotaPerDay: 16,
        description: 'Rolling teak hills and stream beds with low vehicle density.',
        highlight: 'Frequent tigress-and-cubs encounters.'
      },
      {
        name: 'Tipeshwar Buffer Zone',
        type: 'buffer',
        vehicleQuotaPerDay: 12,
        description: 'Community-protected fringe forest open beyond the core season.',
        highlight: 'Quiet leopard and sloth bear tracks.'
      }
    ],
    wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Sloth Bear', 'Dhole (Wild Dog)', 'Nilgai', 'Spotted Deer'],
    howToReach: {
      air: 'Dr. Babasaheb Ambedkar International Airport, Nagpur (150 km / 3 hrs drive)',
      rail: 'Pandharkawada (40 km) or Nagpur Junction (150 km)',
      road: 'Connected via NH 44 and state highways through Yavatmal'
    },
    rulesAndGuidelines: [
      'Entry permits must be matched with original government photo IDs.',
      'Limited vehicle quota per zone — book permits well in advance.',
      'No disembarking from safari vehicles under any circumstances.'
    ],
    faqs: [
      {
        question: 'Why is Tipeshwar known for tiger breeding?',
        answer: 'Its low tourism pressure, ample prey base, and undisturbed core have produced one of central India’s highest tiger cub survival rates in recent years.'
      }
    ]
  },
  {
    name: 'Mogarkasa Conservation Reserve',
    slug: 'mogarkasa',
    state: 'Maharashtra',
    tagline: 'The Black Panther Frontier',
    shortDesc: 'A raw, untamed corridor reserve bordering Pench, famed for its resident melanistic leopard and intimate big-cat observation.',
    editorialQuote: 'Mogarkasa is the frontier where the forest still keeps its rarest secret — a black panther moving through the sal.',
    fullDesc: 'Mogarkasa Conservation Reserve protects a vital wildlife corridor adjoining the Pench-Mogarkasa landscape in eastern Vidarbha. Untamed trails, organic farm-stay country, and new access make it one of the most sought-after destinations for photographers chasing the famous melanistic leopard alongside tigers and wild dogs.',
    heroImage: '/assets/img/reserves/mogarkasa-black-leopard.jpg',
    galleryImages: ['/assets/img/Hero/hero-5.webp', '/assets/img/Gallary/IMG_5230.webp'],
    areaSqKm: 76,
    tigerCount: 'Resident Tiger & Melanistic Leopard',
    bestTimeToVisit: 'October to June',
    coordinates: { lat: 20.9046, lng: 79.6239 },
    mapPosition: { x: 55, y: 64 },
    startingPrice: 13500,
    availability: 'LIMITED',
    bestSuitedFor: 'Photographers tracking the resident melanistic "Black Panther" leopard, raw untamed forest trails, and intimate tiger observation.',
    gateway: 'Nagpur Airport/Railway Station (under a 2-hour drive / 76 km)',
    packageDuration: '3 Days / 2 Nights (Includes 3 Open Gypsy Safaris)',
    safariPlan: '3 Open Gypsy Safaris',
    zones: [
      {
        name: 'Mogarkasa Core Zone',
        type: 'core',
        vehicleQuotaPerDay: 12,
        description: 'Undulating corridor forest bordering the Pench-Mogarkasa block.',
        highlight: 'Track of the resident melanistic leopard (Blackey).'
      }
    ],
    wildlifeHighlights: ['Royal Bengal Tiger', 'Melanistic Leopard', 'Indian Leopard', 'Dhole (Wild Dog)', 'Sloth Bear', 'Gaur (Indian Bison)'],
    howToReach: {
      air: 'Dr. Babasaheb Ambedkar International Airport, Nagpur (76 km / 2 hrs drive)',
      rail: 'Nagpur Junction (76 km)',
      road: 'Connected via NH 6 through Pauni and the Pench corridor'
    },
    rulesAndGuidelines: [
      'Entry permits must be matched with original government photo IDs.',
      'Guided naturalists are mandatory on every safari vehicle.',
      'Respect the corridor’s wildlife movement — no off-track driving.'
    ],
    faqs: [
      {
        question: 'What is Mogarkasa best known for?',
        answer: 'Its resident melanistic leopard, known as Blackey, draws wildlife photographers from across India, alongside tiger and dhole sightings in the Pench corridor.'
      }
    ]
  },
  {
    name: 'Ratapani Tiger Reserve',
    slug: 'ratapani',
    state: 'Madhya Pradesh',
    tagline: 'The Ancient Heritage Frontier',
    shortDesc: 'A re-notified tiger reserve of teak forests and rocky outcrops, adjoining the UNESCO World Heritage Bhimbetka rock shelters.',
    editorialQuote: 'Ratapani pairs the deep teak forest with the first art of humanity — wilderness beneath a wall of ancient rock.',
    fullDesc: 'Ratapani Tiger Reserve protects about 823 sq km of teak-dominated forest across Raisen and Sehore districts, close to Bhopal. Its reservoirs, rocky plateaus, and dense leopard territories overlap the Bhimbetka rock shelters, giving the reserve a unique blend of natural and prehistoric heritage.',
    heroImage: '/assets/img/Gallary/IMG_5301.webp',
    galleryImages: ['/assets/img/Gallary/IMG_5233.webp', '/assets/img/Gallary/IMG_5240.webp'],
    areaSqKm: 823,
    tigerCount: 'High-Density Leopards & Rising Tigers',
    bestTimeToVisit: 'October to June',
    coordinates: { lat: 22.9503, lng: 77.7411 },
    mapPosition: { x: 44, y: 30 },
    startingPrice: 12500,
    availability: 'AVAILABLE',
    bestSuitedFor: 'Tracking high-density leopard territories overlapping the UNESCO World Heritage Bhimbetka rock shelters.',
    gateway: 'Bhopal (1-hour drive)',
    packageDuration: '3 Days / 2 Nights (Includes 3 Open Gypsy Safaris)',
    safariPlan: '3 Open Gypsy Safaris',
    zones: [
      {
        name: 'Ratapani Core Zone',
        type: 'core',
        vehicleQuotaPerDay: 20,
        description: 'Teak forest and reservoir country with rocky escarpments.',
        highlight: 'Leopard tracking beside the Bhimbetka heritage belt.'
      },
      {
        name: 'Ratapani Buffer Zone',
        type: 'buffer',
        vehicleQuotaPerDay: 15,
        description: 'Fringe forest and farmland edge with strong leopard movement.',
        highlight: 'Open beyond the core season.'
      }
    ],
    wildlifeHighlights: ['Indian Leopard', 'Royal Bengal Tiger', 'Sloth Bear', 'Spotted Deer', 'Sambar', 'Indian Python'],
    howToReach: {
      air: 'Raja Bhoj Airport, Bhopal (60 km / 1 hr drive)',
      rail: 'Obaidullahganj (20 km) or Bhopal Junction (60 km)',
      road: 'Connected via NH 46 from Bhopal toward Hoshangabad'
    },
    rulesAndGuidelines: [
      'Entry permits must be matched with original government photo IDs.',
      'Do not combine the safari with unguided visits to the Bhimbetka rock shelters.'
    ],
    faqs: [
      {
        question: 'How far is Ratapani from Bhopal?',
        answer: 'The core zones are roughly an hour’s drive from Bhopal, making Ratapani the most convenient wildlife break from the state capital.'
      }
    ]
  },
  {
    name: 'Kheoni Wildlife Sanctuary',
    slug: 'kheoni',
    state: 'Madhya Pradesh',
    tagline: 'The Uncharted Wild Heart',
    shortDesc: 'A crowd-free teak sanctuary with resident breeding tigers and one of central India’s richest budgets for birdwatchers.',
    editorialQuote: 'Kheoni is the quiet forest — no convoys, no clamour, just teak, resident tigers, and a dawn chorus.',
    fullDesc: 'Kheoni Wildlife Sanctuary spreads across roughly 133 sq km on the Vindhyan edge of Dewas and Sehore districts. Managed as an ecotourism pioneer by the MP Ecotourism Board, it offers budget-friendly, low-traffic safaris through teak and bamboo towards reliable tiger breeding areas and over 170 recorded bird species.',
    heroImage: '/assets/img/Gallary/IMG_5306.webp',
    galleryImages: ['/assets/img/Gallary/IMG_5250.webp', '/assets/img/Hero/hero-3.webp'],
    areaSqKm: 133,
    tigerCount: 'Breeding Tigers (170+ Bird Species)',
    bestTimeToVisit: 'October to June',
    coordinates: { lat: 22.7226, lng: 76.7513 },
    mapPosition: { x: 34, y: 27 },
    startingPrice: 11000,
    availability: 'AVAILABLE',
    bestSuitedFor: 'Budget-friendly eco-tourism, crowd-free teak forests, bird watching (170+ species), and spotting resident breeding tigers.',
    gateway: 'Indore Airport (125 km / 2.5-hour drive) or Bhopal',
    packageDuration: '3 Days / 2 Nights (Includes 3 Open Gypsy Safaris)',
    safariPlan: '3 Open Gypsy Safaris',
    zones: [
      {
        name: 'Kheoni Core Zone',
        type: 'core',
        vehicleQuotaPerDay: 14,
        description: 'Teak and bamboo core with the official Eco Jungle Camp at its edge.',
        highlight: 'Resident breeding tigers with almost no vehicle traffic.'
      }
    ],
    wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Sloth Bear', 'Spotted Deer', 'Indian Peafowl', '170+ Bird Species'],
    howToReach: {
      air: 'Devi Ahilya Bai Holkar Airport, Indore (125 km / 2.5 hrs drive)',
      rail: 'Dewas (60 km) or Bhopal Junction (150 km)',
      road: 'Connected via NH 52 through Dewas and Kannod'
    },
    rulesAndGuidelines: [
      'Entry permits must be matched with original government photo IDs.',
      'Camping only within the MP Ecotourism Board’s designated zones.'
    ],
    faqs: [
      {
        question: 'What makes Kheoni different from other MP parks?',
        answer: 'It is intentionally low-traffic and budget-focused, with the official Kheoni Eco Jungle Camp and resident breeding tigers — a rare combination in Madhya Pradesh.'
      }
    ]
  }
];

const run = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Add] Target: ${mongoose.connection.host}/${mongoose.connection.name}`);

  for (const base of NEW_DESTINATIONS) {
    const record = { ...base };
    Object.assign(record, editorialFor(record));

    const pkg = PACKAGES_BY_SLUG[record.slug];
    if (pkg) {
      record.packages = pkg.packages;
      if (pkg.positioning) record.positioning = pkg.positioning;
      if (pkg.bestSuitedFor) record.bestSuitedFor = pkg.bestSuitedFor;
      if (pkg.gateway) record.gateway = pkg.gateway;
      if (pkg.duration) record.packageDuration = pkg.duration;
      if (pkg.safari) record.safariPlan = pkg.safari;
      if (typeof pkg.startingPrice === 'number') record.startingPrice = pkg.startingPrice;
    } else {
      console.warn(`[Add] No package data in the Content Master for "${record.slug}" — it will show "On request".`);
    }

    const result = await Destination.updateOne(
      { slug: record.slug },
      { $set: record },
      { upsert: true, runValidators: true }
    );
    console.log(`[Add] ${result.upsertedCount ? 'inserted' : 'updated'} ${record.slug}`);
  }

  const total = await Destination.countDocuments({});
  console.log(`[Add] Done. ${total} destinations now in the database.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('[Add] Failed:', err.message);
  process.exit(1);
});
