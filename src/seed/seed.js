import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MONGO_URI } from '../config/env.js';
import { User } from '../models/User.js';
import { Destination } from '../models/Destination.js';
import { Safari } from '../models/Safari.js';
import { Booking } from '../models/Booking.js';
import { Gallery } from '../models/Gallery.js';
import { Journal } from '../models/Journal.js';
import { FAQ } from '../models/FAQ.js';
import { Review } from '../models/Review.js';
import { CMSContent } from '../models/CMSContent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { editorialFor } from './editorial.js';
import { PACKAGES_BY_SLUG } from './packagesData.js';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB.');

    // This wipes all ten collections, including Booking — which holds customer Aadhaar
    // and passport numbers. The URI in .env points at the live Atlas cluster, so a fat
    // finger here destroys real bookings. Opt in explicitly, every time.
    if (!process.argv.includes('--force')) {
      console.error('[Seed] REFUSING TO RUN: this deletes every collection, including live bookings and their ID documents.');
      console.error(`[Seed] Target: ${mongoose.connection.host}/${mongoose.connection.name}`);
      console.error('[Seed] To wipe it anyway, run:  npm run seed -- --force');
      console.error('[Seed] To update live reserves without wiping, run:  npm run sync:editorial');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Checked before anything is deleted, not after: failing post-wipe would leave the
    // live database empty with no accounts to log in with.
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;
    const missing = [
      !adminPassword && 'SEED_ADMIN_PASSWORD',
      !customerPassword && 'SEED_CUSTOMER_PASSWORD'
    ].filter(Boolean);
    if (missing.length) {
      console.error(`[Seed] REFUSING TO RUN: ${missing.join(' and ')} not set.`);
      console.error('[Seed] Add them to server/.env (see .env.example) so no password is hardcoded here.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Clear existing collections
    await User.deleteMany({});
    await Destination.deleteMany({});
    await Safari.deleteMany({});
    await Booking.deleteMany({});
    await Gallery.deleteMany({});
    await Journal.deleteMany({});
    await FAQ.deleteMany({});
    await Review.deleteMany({});
    await CMSContent.deleteMany({});
    await SiteSettings.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Seed Users
    const adminSalt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash(adminPassword, adminSalt);
    const custPass = await bcrypt.hash(customerPassword, adminSalt);

    const superAdmin = await User.create({
      name: 'Sachin (Founder and Principal Naturalist)',
      email: 'admin@shutterandstripes.com',
      passwordHash: adminPass,
      role: 'super_admin',
      phone: '+91 98230 45678',
      country: 'India'
    });

    const demoCustomer = await User.create({
      name: 'Rohan Deshmukh',
      email: 'traveler@shutterandstripes.com',
      passwordHash: custPass,
      role: 'customer',
      phone: '+91 98765 43210',
      country: 'India'
    });

    console.log('[Seed] Users seeded (Admin and Customer).');

    // 2. Seed Destinations (7 MP, 7 MH - strict separation of Pench MP and Pench MH)
    const destinationsData = [
      // --- MAHARASHTRA ---
      {
        name: 'Tadoba-Andhari Tiger Reserve',
        slug: 'tadoba-andhari',
        state: 'Maharashtra',
        tagline: 'The Jewel of Vidarbha',
        shortDesc: 'Maharashtra’s oldest and premier tiger reserve, celebrated for fearless tiger dynasties, dense bamboo labyrinths, and legendary waterhole sightings.',
        editorialQuote: 'Tadoba is the colosseum of central Indian wildlife where legends like Maya, Matkasur, and Sonam carved their names into natural history.',
        fullDesc: 'Situated in the Chandrapur district of Maharashtra, Tadoba-Andhari Tiger Reserve spans 1,727 sq km of pristine dry deciduous forest, teak ridges, and bamboo thickets. Anchored by the perennial Tadoba Lake, Telia Dam, and Erai Reservoir, the reserve offers unmatched year-round tiger encounters through its historic core gates and thriving community-led buffer zones.',
        heroImage: '/assets/img/tadoba-str-guide.jpg',
        galleryImages: [
          '/assets/img/tiger-trail-jeep.jpg',
          '/assets/img/bengal-tiger-portrait.jpg',
          '/assets/img/tadoba-moharli-gate.jpg',
          '/assets/img/tadoba-guide-briefing.jpg'
        ],
        areaSqKm: 1727,
        tigerCount: '115+ Royal Bengals (Estimated)',
        bestTimeToVisit: 'October to June (Buffer zones accessible year-round)',
        coordinates: { lat: 20.2526, lng: 79.3087 },
        mapPosition: { x: 42, y: 72 },
        startingPrice: 7500,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Moharli Core Zone',
            type: 'core',
            gates: ['Moharli Gate'],
            vehicleQuotaPerDay: 42,
            description: 'The historic central gateway with direct access to Telia Lake, Khatoda meadows, and high feline activity.',
            highlight: 'Legendary territory of famous royal Bengal lineages.'
          },
          {
            name: 'Kolara Core Zone',
            type: 'core',
            gates: ['Kolara Gate'],
            vehicleQuotaPerDay: 36,
            description: 'Northern gate offering rolling meadows, Jamunbodi waterhole, and tranquil sal canopies.',
            highlight: 'Known for spectacular morning light and waterhole tracking.'
          },
          {
            name: 'Navegaon Core Zone',
            type: 'core',
            gates: ['Navegaon Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Quiet northwestern gate leading into dense bamboo clusters.',
            highlight: 'Uncrowded tracks and serene forest solitude.'
          },
          {
            name: 'Agauzari and Junona Buffer',
            type: 'buffer',
            gates: ['Agauzari Gate', 'Junona Gate'],
            vehicleQuotaPerDay: 50,
            description: 'Community-protected thriving buffer belts with active resident felines and night safari options.',
            highlight: 'Open all year including the monsoon rejuvenation season.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Sloth Bear', 'Dhole (Wild Dog)', 'Gaur (Indian Bison)', 'Mugger Crocodile', 'Crested Serpent Eagle'],
        howToReach: {
          air: 'Dr. Babasaheb Ambedkar International Airport, Nagpur (140 km / 3 hrs drive)',
          rail: 'Chandrapur Railway Station (45 km) or Nagpur Junction (140 km)',
          road: 'Well-connected via 4-lane highway from Nagpur to Chandrapur'
        },
        rulesAndGuidelines: [
          'Entry permits must be matched with original government photo IDs.',
          'Strict 20 km/h speed limit inside all reserve sectors.',
          'No disembarking from safari vehicles under any circumstances.',
          'Plastic-free zone: single-use plastics are prohibited.',
          'Drones and camera flashes are strictly banned.'
        ],
        faqs: [
          {
            question: 'Which gate is best for first-time visitors in Tadoba?',
            answer: 'Moharli and Kolara are the most versatile core gateways with high permit allocations and excellent lodging infrastructure.'
          },
          {
            question: 'Are buffer zones worth visiting in Tadoba?',
            answer: 'Yes! Tadoba’s buffer zones like Agauzari, Junona, and Devada are among the most active and wildlife-rich buffer forests in all of India.'
          }
        ]
      },
      {
        name: 'Pench Tiger Reserve — Maharashtra',
        slug: 'pench-mh',
        state: 'Maharashtra',
        tagline: 'The Original Mowgli Heartland (Sillari and Mansinghdeo)',
        shortDesc: 'The southern expanse of the legendary Kipling wilderness, featuring dramatic teak forests, tranquil backwaters, and pristine riverine corridors.',
        editorialQuote: 'Here, the Pench river carves through weathered rocks and whispering teak, preserving the untamed spirit of the classic jungle books.',
        fullDesc: 'Pench Maharashtra encompasses 741 sq km across Nagpur district. Centered around the Sillari gate and the adjoining Mansinghdeo Sanctuary, it protects the vital southern wildlife corridor. Celebrated for its gentle terrain, high prey density, and picturesque waterholes, it offers exceptional photographic opportunities away from heavy tourist corridors.',
        heroImage: '/assets/img/safari-trail-mist.jpg',
        galleryImages: [
          '/assets/img/tiger-first-person-jeep.jpg',
          '/assets/img/forest-canopy-sunbeams.jpg',
          '/assets/img/leopard-stalking.jpg'
        ],
        areaSqKm: 741,
        tigerCount: '45+ Resident and Corridor Tigers',
        bestTimeToVisit: 'October to mid-June',
        coordinates: { lat: 21.5768, lng: 79.2341 },
        mapPosition: { x: 38, y: 64 },
        startingPrice: 6800,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Sillari Core Zone',
            type: 'core',
            gates: ['Sillari Gate'],
            vehicleQuotaPerDay: 30,
            description: 'Premier entry gate with classic deciduous woodland and historic river crossings.',
            highlight: 'Superb leopard and tiger track density.'
          },
          {
            name: 'Chorbaoli Buffer Zone',
            type: 'buffer',
            gates: ['Chorbaoli Gate'],
            vehicleQuotaPerDay: 25,
            description: 'Lush undulating corridor along the national highway eco-passages.',
            highlight: 'Fascinating twilight wildlife movement.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Wild Dog (Dhole)', 'Sambar Deer', 'Spotted Deer', 'Indian Wolf', 'Malabar Pied Hornbill'],
        howToReach: {
          air: 'Nagpur Airport (85 km / 1.5 hrs drive)',
          rail: 'Nagpur Junction (75 km)',
          road: 'Directly on NH 44 (Nagpur-Jabalpur corridor)'
        },
        rulesAndGuidelines: [
          'Maintain minimum 20-meter distance from wild animals.',
          'Mobile phones must remain on silent mode at all times.',
          'Guided naturalists are mandatory on every safari vehicle.'
        ],
        faqs: [
          {
            question: 'How does Pench Maharashtra differ from Pench MP?',
            answer: 'Pench Maharashtra covers the southern contiguous block via Sillari gate in Nagpur district, administered under Maharashtra Forest Department with its own independent booking quota.'
          }
        ]
      },
      {
        name: 'Umred-Karhandla Wildlife Sanctuary',
        slug: 'umred-karhandla',
        state: 'Maharashtra',
        tagline: 'The Gateway Corridor of Vidarbha',
        shortDesc: 'A dynamic wildlife corridor sanctuary famed as the home turf of legendary dispersing tigers like Jai and his progeny.',
        editorialQuote: 'Umred represents connectivity at its finest—a thriving bridge where tigers wander between Tadoba, Nagzira, and Pench.',
        fullDesc: 'Covering 189 sq km along the Wainganga river basin in Nagpur and Bhandara districts, Umred-Karhandla has gained international renown as one of central India’s fastest-growing tiger habitats, featuring open meadows, water storage reservoirs, and intimate safari tracks.',
        heroImage: '/assets/img/tiger-walking-ahead.jpg',
        galleryImages: [
          '/assets/img/bengal-tiger-portrait.jpg',
          '/assets/img/photographers-green-gypsy.jpg'
        ],
        areaSqKm: 189,
        tigerCount: '18+ Resident Tigers',
        bestTimeToVisit: 'November to May',
        coordinates: { lat: 20.8427, lng: 79.4891 },
        mapPosition: { x: 45, y: 69 },
        startingPrice: 6200,
        availability: 'FEW PERMITS',
        zones: [
          {
            name: 'Karhandla Zone',
            type: 'core',
            gates: ['Karhandla Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Premier sector known for grassland sightings and reservoir perimeters.',
            highlight: 'Historical territory of the iconic mega-tiger Jai.'
          },
          {
            name: 'Umred Zone',
            type: 'core',
            gates: ['Umred Gate'],
            vehicleQuotaPerDay: 15,
            description: 'Southern woodland sector offering intimate teak forest trails.',
            highlight: 'High bird diversity and sloth bear activity.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Sloth Bear', 'Spotted Deer', 'Blue Bull (Nilgai)', 'Honey Buzzard'],
        howToReach: {
          air: 'Nagpur Airport (60 km / 1 hr 15 min drive)',
          rail: 'Nagpur Junction (55 km) or Umred Local Station',
          road: 'Paved state highways connecting directly from Nagpur'
        },
        rulesAndGuidelines: [
          'Stay strictly within designated vehicle trails.',
          'Early booking advised due to limited vehicle permits per gate.'
        ],
        faqs: [
          {
            question: 'Is Umred suitable for a day trip from Nagpur?',
            answer: 'Yes, at just 60 km from Nagpur, Umred is the most convenient high-density tiger sanctuary for quick weekend excursions.'
          }
        ]
      },
      {
        name: 'Navegaon-Nagzira Tiger Reserve',
        slug: 'navegaon-nagzira',
        state: 'Maharashtra',
        tagline: 'The Verdant Highlands of Gondia',
        shortDesc: 'A picturesque biodiversity haven of shimmering lakes, rocky plateaus, and ancient tribal forest legends in eastern Maharashtra.',
        editorialQuote: 'Nagzira’s tranquil waters reflect the untouched beauty of the Central Indian highlands.',
        fullDesc: 'Nestled between Bhandara and Gondia districts, Navegaon-Nagzira Tiger Reserve spans 653 sq km of rugged hills, bamboo valleys, and scenic reservoirs including Navegaon Lake. It serves as a critical tiger corridor connecting Tadoba, Kanha, and Pench.',
        heroImage: '/assets/img/jungle-dirt-road.jpg',
        galleryImages: [
          '/assets/img/leopard-tree-gaze.jpg',
          '/assets/img/forest-canopy-sunbeams.jpg'
        ],
        areaSqKm: 653,
        tigerCount: '15+ Tigers and Active Translocation Area',
        bestTimeToVisit: 'October to June',
        coordinates: { lat: 21.2872, lng: 80.0528 },
        mapPosition: { x: 52, y: 62 },
        startingPrice: 6500,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Nagzira Core',
            type: 'core',
            gates: ['Nagzira Gate', 'Pitezari Gate'],
            vehicleQuotaPerDay: 24,
            description: 'Picturesque valley sector with natural water springs and watch towers.',
            highlight: 'Outstanding birdlife and leopard habitats.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Four-horned Antelope (Chausingha)', 'Sloth Bear', 'Otter', '300+ Avian Species'],
        howToReach: {
          air: 'Nagpur Airport (130 km)',
          rail: 'Gondia Junction (45 km)',
          road: 'Connected via NH 53 from Nagpur to Bhandara'
        },
        rulesAndGuidelines: ['Respect silence around water bodies', 'Carry warm layers for morning winter drives.'],
        faqs: [{ question: 'Is Nagzira good for birdwatching?', answer: 'Nagzira is one of Maharashtra’s finest bird sanctuaries with over 300 resident and migratory species recorded.' }]
      },
      {
        name: 'Melghat Tiger Reserve',
        slug: 'melghat',
        state: 'Maharashtra',
        tagline: 'The Highland Sanctuary of the Satpura Range',
        shortDesc: 'Among India’s initial 9 Project Tiger reserves, featuring colossal ravines, towering cliffs, and deep teak-dominated valleys.',
        editorialQuote: 'Melghat whispers of ancient wilderness where the forest owlet was rediscovered after a century of silence.',
        fullDesc: 'Covering an immense 1,677 sq km across the southern Satpura hill tracts in Amravati district, Melghat is drained by the Tapti river basin. Known for rugged topography and biodiversity, it is famous for the rediscovered Forest Owlet and thriving sloth bear populations.',
        heroImage: '/assets/img/forest-canopy-sunbeams.jpg',
        galleryImages: ['/assets/img/safari-gypsy-dust-trail.jpg', '/assets/img/leopard-stalking.jpg'],
        areaSqKm: 1677,
        tigerCount: '50+ Royal Bengal Tigers',
        bestTimeToVisit: 'December to May',
        coordinates: { lat: 21.4398, lng: 77.3475 },
        mapPosition: { x: 26, y: 63 },
        startingPrice: 6000,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Semanadoh and Harisal Core',
            type: 'core',
            gates: ['Semanadoh Gate', 'Kolkas Gate'],
            vehicleQuotaPerDay: 30,
            description: 'Rugged valley tracks descending to pristine rivers and tribal orchards.',
            highlight: 'Dramatic cliff vistas and rare raptor nesting sites.'
          }
        ],
        wildlifeHighlights: ['Bengal Tiger', 'Forest Owlet (Endangered)', 'Leopard', 'Caracal', 'Flying Squirrel', 'Barking Deer'],
        howToReach: {
          air: 'Nagpur (240 km) or Bhopal (280 km)',
          rail: 'Badnera / Amravati (110 km)',
          road: 'Well-connected from Amravati and Chikhaldara hill station'
        },
        rulesAndGuidelines: ['Mountain driving precautions apply', 'Local tribal guides accompany all safaris.'],
        faqs: [{ question: 'What makes Melghat unique?', answer: 'Its dramatic highland terrain, deep gorges, and the rare opportunity to spot the critically endangered Forest Owlet.' }]
      },
      {
        name: 'Bor Tiger Reserve',
        slug: 'bor',
        state: 'Maharashtra',
        tagline: 'India’s Smallest Wonder Tiger Reserve',
        shortDesc: 'A compact 138 sq km gem bordering Wardha and Nagpur, boasting surprisingly dense feline populations and serene reservoir tracks.',
        editorialQuote: 'Bor proves that size is no barrier to profound wilderness and conservation triumph.',
        fullDesc: 'Recognized as India’s smallest tiger reserve, Bor acts as a vital stepping-stone corridor between Pench, Tadoba, and Melghat. The Bor reservoir provides magnificent scenery and reliable wildlife congregations year-round.',
        heroImage: '/assets/img/tiger-grassland-gaze.jpg',
        galleryImages: ['/assets/img/safari-photographers-trail.jpg', '/assets/img/tiger-leaves-peek.jpg'],
        areaSqKm: 138,
        tigerCount: '10+ Resident Tigers and Corridor Cats',
        bestTimeToVisit: 'October to June',
        coordinates: { lat: 20.9744, lng: 78.6922 },
        mapPosition: { x: 37, y: 68 },
        startingPrice: 5800,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Bordi Core',
            type: 'core',
            gates: ['Bordi Gate'],
            vehicleQuotaPerDay: 16,
            description: 'Waterside track with close encounters and minimal tourist crowding.',
            highlight: 'Intimate and peaceful safari drives.'
          }
        ],
        wildlifeHighlights: ['Bengal Tiger', 'Leopard', 'Sambar', 'Spotted Deer', 'Golden Jackal', 'Marsh Crocodile'],
        howToReach: {
          air: 'Nagpur Airport (70 km / 1 hr 15 min drive)',
          rail: 'Wardha Junction (35 km) or Nagpur (70 km)',
          road: 'Scenic route through Hingni along NH 361'
        },
        rulesAndGuidelines: ['Only 16 vehicles permitted per day to preserve tranquil habitat.'],
        faqs: [{ question: 'Why choose Bor Tiger Reserve?', answer: 'Ideal for travelers seeking quiet safaris with virtually no vehicle convoy traffic.' }]
      },
      {
        name: 'Sahyadri Tiger Reserve',
        slug: 'sahyadri',
        state: 'Maharashtra',
        tagline: 'The Cloud Forests of the Western Ghats',
        shortDesc: 'A UNESCO World Heritage ecological hotspot spanning the crest of the Sahyadri mountains with misty evergreen valleys and waterfalls.',
        editorialQuote: 'Where the mist of the Arabian Sea meets the ancient basalt plateaus of the Western Ghats.',
        fullDesc: 'Combining Koyna Wildlife Sanctuary and Chandoli National Park, Sahyadri Tiger Reserve safeguards 1,165 sq km of evergreen and semi-evergreen montane rainforests. Known for exceptional botanical endemism, elusive leopards, and recovering tiger populations.',
        heroImage: '/assets/img/safari-trail-mist.jpg',
        galleryImages: ['/assets/img/jungle-dirt-road.jpg', '/assets/img/leopard-stalking.jpg'],
        areaSqKm: 1165,
        tigerCount: '7+ Recovering Population',
        bestTimeToVisit: 'November to May (Trekking and Safaris)',
        coordinates: { lat: 17.4833, lng: 73.7833 },
        mapPosition: { x: 12, y: 82 },
        startingPrice: 6500,
        availability: 'LIMITED',
        zones: [
          {
            name: 'Chandoli Core',
            type: 'core',
            gates: ['Chandoli Gate'],
            vehicleQuotaPerDay: 15,
            description: 'Highland plateau and reservoir trails through dense rainforest.',
            highlight: 'Rare Western Ghats endemic fauna and flora.'
          }
        ],
        wildlifeHighlights: ['Indian Leopard', 'Bengal Tiger', 'Gaur (Bison)', 'Mouse Deer', 'Malabar Giant Squirrel', 'Great Pied Hornbill'],
        howToReach: {
          air: 'Pune Airport (180 km) or Kolhapur Airport (100 km)',
          rail: 'Karad (55 km) or Sangli / Kolhapur',
          road: 'Accessible via NH 48 from Mumbai, Pune, or Goa'
        },
        rulesAndGuidelines: ['Strict eco-sensitive protocols', 'Permits require prior forest verification.'],
        faqs: [{ question: 'What makes Sahyadri unique compared to Vidarbha reserves?', answer: 'It is a Western Ghats rainforest rather than deciduous woodland, offering distinct biodiversity and dramatic mountain scenery.' }]
      },

      // --- MADHYA PRADESH ---
      {
        name: 'Bandhavgarh Tiger Reserve',
        slug: 'bandhavgarh',
        state: 'Madhya Pradesh',
        tagline: 'The Ancient Realm of the Royal Bengal',
        shortDesc: 'World-renowned for having one of the highest recorded tiger densities in the wild, set against the backdrop of a 2,000-year-old cliff-top fort.',
        editorialQuote: 'Bandhavgarh is the royal theater of Indian wildlife, where sheer sandstone cliffs watch over emerald sal meadows.',
        fullDesc: 'Spanning 1,536 sq km in the Umaria district of Madhya Pradesh, Bandhavgarh is steeped in mythology and natural majesty. Dominated by the ancient Bandhavgarh Fort and the reclining Shesh Shaiya Vishnu sculpture, the park features iconic core zones—Tala, Magadhi, and Khitauli—renowned worldwide for iconic tiger sightings and dramatic photography.',
        heroImage: '/assets/img/royal-bengal-prowl.jpg',
        galleryImages: [
          '/assets/img/photographer-fort-jeep.jpg',
          '/assets/img/tiger-golden-grassland.jpg',
          '/assets/img/tiger-foliage-portrait.jpg'
        ],
        areaSqKm: 1536,
        tigerCount: '135+ Royal Bengals (High Density)',
        bestTimeToVisit: 'October to June',
        coordinates: { lat: 23.7027, lng: 80.9992 },
        mapPosition: { x: 62, y: 35 },
        startingPrice: 8500,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Tala Core Zone',
            type: 'core',
            gates: ['Tala Gate'],
            vehicleQuotaPerDay: 40,
            description: 'The historic premium zone with dramatic hill topography and Charanganga river meadows.',
            highlight: 'Ancient ruins, Shesh Shaiya, and historic tiger dynasties.'
          },
          {
            name: 'Magadhi Core Zone',
            type: 'core',
            gates: ['Magadhi Gate (Gate 2)'],
            vehicleQuotaPerDay: 40,
            description: 'Open mixed forest with numerous perennial water springs and grassland tracks.',
            highlight: 'Consistently exceptional track record for tiger tracking.'
          },
          {
            name: 'Khitauli Core Zone',
            type: 'core',
            gates: ['Khitauli Gate (Gate 3)'],
            vehicleQuotaPerDay: 35,
            description: 'Picturesque northern sector with gentle rolling sal hills and wild elephant herds.',
            highlight: 'Magnificent wilderness vistas and serene photography.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Wild Elephant', 'Spotted Deer', 'Sloth Bear', 'Chousingha', 'Indian Vulture'],
        howToReach: {
          air: 'Jabalpur Airport (165 km / 3.5 hrs drive) or Khajuraho (250 km)',
          rail: 'Umaria (32 km) or Katni Junction (100 km)',
          road: 'Well-paved state highway directly connected to Jabalpur'
        },
        rulesAndGuidelines: [
          'Tala zone permits sell out months in advance; early booking is vital.',
          'Entry slots are strictly synchronized with sunrise and sunset.',
          'Littering or playing amplified music carries severe statutory penalties.'
        ],
        faqs: [
          {
            question: 'When does Bandhavgarh permit booking open?',
            answer: 'MP Forest department opens online core permits 120 days in advance. Popular zones like Tala fill within minutes.'
          }
        ]
      },
      {
        name: 'Kanha Tiger Reserve',
        slug: 'kanha',
        state: 'Madhya Pradesh',
        tagline: 'The Kipling Kingdom of Maidans and Sal',
        shortDesc: 'India’s most celebrated national park, offering vast open savannahs (maidans), towering sal trees, and the miraculous conservation story of the Hardground Barasingha.',
        editorialQuote: 'Kanha’s rolling grasslands are the closest an Indian forest comes to the timeless majesty of the Serengeti.',
        fullDesc: 'Covering 2,051 sq km across Mandla and Balaghat districts, Kanha is celebrated as the flagship of Project Tiger. It inspired Rudyard Kipling’s Jungle Book and is the only global habitat where the swamp deer (Barasingha) was brought back from the edge of extinction. Features world-famous zones: Kanha, Kisli, Mukki, and Sarhi.',
        heroImage: '/assets/img/elephants-safari-jeep.jpg',
        galleryImages: [
          '/assets/img/tiger-trail-jeep.jpg',
          '/assets/img/bengal-tiger-portrait.jpg',
          '/assets/img/forest-canopy-sunbeams.jpg'
        ],
        areaSqKm: 2051,
        tigerCount: '120+ Royal Bengals',
        bestTimeToVisit: 'October to June',
        coordinates: { lat: 22.3345, lng: 80.6115 },
        mapPosition: { x: 55, y: 48 },
        startingPrice: 8000,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Kanha Core Zone',
            type: 'core',
            gates: ['Khatia Gate'],
            vehicleQuotaPerDay: 45,
            description: 'The central maidan featuring expansive grasslands and the legendary Shravan Tal.',
            highlight: 'Iconic wide-open wildlife landscape photography.'
          },
          {
            name: 'Mukki Core Zone',
            type: 'core',
            gates: ['Mukki Gate'],
            vehicleQuotaPerDay: 40,
            description: 'Southern gateway characterized by meandering Banjar river corridors and sal forest.',
            highlight: 'Direct luxury lodge access and frequent tiger movements.'
          },
          {
            name: 'Kisli Core Zone',
            type: 'core',
            gates: ['Kisli Gate'],
            vehicleQuotaPerDay: 35,
            description: 'Connecting ridge between Khatia and Kanha meadows.',
            highlight: 'Dense gaur herds and leopard tracking.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Hardground Barasingha (Swamp Deer)', 'Indian Leopard', 'Dhole', 'Gaur', 'Blackbuck', 'Brown Fish Owl'],
        howToReach: {
          air: 'Jabalpur Airport (160 km) or Raipur Airport (200 km)',
          rail: 'Gondia Junction (145 km) or Jabalpur (160 km)',
          road: 'Excellent scenic highways from Nagpur, Jabalpur, and Raipur'
        },
        rulesAndGuidelines: [
          'Safari jeeps must strictly adhere to zone route tracks.',
          'Afternoon safaris are closed on Wednesday afternoons per MP forest policy.'
        ],
        faqs: [
          {
            question: 'What is special about the Barasingha in Kanha?',
            answer: 'Kanha is the only place on earth where the endemic southern hardground barasingha survived through dedicated habitat management.'
          }
        ]
      },
      {
        name: 'Pench Tiger Reserve — Madhya Pradesh',
        slug: 'pench-mp',
        state: 'Madhya Pradesh',
        tagline: 'The Classic Seoni Woodlands (Turia and Karmajhiri)',
        shortDesc: 'The northern heart of Kipling’s Mowgli territory in Seoni and Chhindwara, renowned for serene teak glades, open canopy visibility, and high predator density.',
        editorialQuote: 'Pench MP offers the quintessential dry deciduous safari experience with peerless light and gentle topography.',
        fullDesc: 'Covering 1,179 sq km along the MP-Maharashtra border, Pench MP is managed by the Madhya Pradesh Forest Department through its iconic Turia, Karmajhiri, and Jamtara gates. The crystal waters of the Pench river bisect the reserve, creating tranquil backwaters where tigers, wild dogs, and massive gaur herds gather.',
        heroImage: '/assets/img/safari-gypsy-dust-trail.jpg',
        galleryImages: [
          '/assets/img/tiger-first-person-jeep.jpg',
          '/assets/img/safari-gypsy-dust-trail.jpg',
          '/assets/img/tiger-grassland-gaze.jpg'
        ],
        areaSqKm: 1179,
        tigerCount: '75+ Royal Bengal Tigers',
        bestTimeToVisit: 'October to June',
        coordinates: { lat: 21.7588, lng: 79.2974 },
        mapPosition: { x: 42, y: 56 },
        startingPrice: 7200,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Turia Core Zone',
            type: 'core',
            gates: ['Turia Gate'],
            vehicleQuotaPerDay: 48,
            description: 'The most popular entry with high prey visibility and scenic waterholes.',
            highlight: 'Famed home of Collarwali and her descendants.'
          },
          {
            name: 'Karmajhiri Core Zone',
            type: 'core',
            gates: ['Karmajhiri Gate'],
            vehicleQuotaPerDay: 25,
            description: 'Northern sector featuring deeper forests and quieter safari trails.',
            highlight: 'Pristine wilderness and great leopard tracking.'
          },
          {
            name: 'Rukhad Buffer and Night Safari',
            type: 'buffer',
            gates: ['Rukhad Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Forested corridor between Pench and Kanha offering night drives.',
            highlight: 'Nocturnal wildlife exploration.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Indian Leopard', 'Sloth Bear', 'Dhole (Wild Dog)', 'Sambar', 'Spotted Deer', 'Ghost Tree (Kullu)'],
        howToReach: {
          air: 'Nagpur Airport (100 km / 2 hrs drive via NH 44)',
          rail: 'Nagpur Junction (90 km)',
          road: 'Directly off the 4-lane elevated corridor of NH 44'
        },
        rulesAndGuidelines: [
          'Wednesdays afternoon safaris remain closed across MP core zones.',
          'Gate check-in opens 30 minutes before sunrise.'
        ],
        faqs: [
          {
            question: 'Is Pench MP close to Nagpur?',
            answer: 'Yes, Turia gate is just a 2-hour drive from Nagpur airport, making it the most accessible MP core reserve.'
          }
        ]
      },
      {
        name: 'Satpura Tiger Reserve',
        slug: 'satpura',
        state: 'Madhya Pradesh',
        tagline: 'The Walking Wilderness and Backwaters',
        shortDesc: 'A unique wonderland of sandstone peaks, deep gorges, and the Denwa backwaters, offering rare walking safaris, canoeing, and intimate leopard tracking.',
        editorialQuote: 'Satpura is the quiet connoisseur’s forest—untamed, experiential, and profoundly atmospheric.',
        fullDesc: 'Encompassing 2,133 sq km in Hoshangabad district, Satpura is unlike any other Indian tiger reserve. It is one of the very few reserves in India that legally permits guided walking safaris inside core buffers. Accessed by boat across the Denwa river, it is famous for sloth bears, Indian leopards, and the Malabar giant squirrel.',
        heroImage: '/assets/img/bengal-tiger-portrait.jpg',
        galleryImages: ['/assets/img/safari-trail-mist.jpg', '/assets/img/leopard-stalking.jpg'],
        areaSqKm: 2133,
        tigerCount: '52+ Resident Tigers',
        bestTimeToVisit: 'October to mid-June',
        coordinates: { lat: 22.4573, lng: 78.2434 },
        mapPosition: { x: 34, y: 46 },
        startingPrice: 7800,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Madhai Core Zone',
            type: 'core',
            gates: ['Madhai Gate (Boat Crossing)'],
            vehicleQuotaPerDay: 30,
            description: 'Entered via motorboat across Denwa river into pristine mixed forests.',
            highlight: 'Walking safaris, night drives, and canoeing.'
          }
        ],
        wildlifeHighlights: ['Indian Leopard', 'Sloth Bear', 'Royal Bengal Tiger', 'Indian Giant Squirrel', 'Rusty-Spotted Cat', 'Blackbuck'],
        howToReach: {
          air: 'Bhopal Airport (140 km / 3.5 hrs drive)',
          rail: 'Pipariya (45 km) or Itarsi Junction (70 km)',
          road: 'Scenic route passing through Pachmarhi biosphere'
        },
        rulesAndGuidelines: ['Walking safaris strictly led by certified naturalists and armed forest guards.'],
        faqs: [{ question: 'Can we do walking safaris in Satpura?', answer: 'Yes! Satpura is the leading reserve in India where guided on-foot walking safaris and canoe excursions are officially permitted.' }]
      },
      {
        name: 'Panna Tiger Reserve',
        slug: 'panna',
        state: 'Madhya Pradesh',
        tagline: 'The Ken River Rebirth Saga',
        shortDesc: 'Renowned worldwide for one of history’s greatest conservation miracles—bringing tigers back from zero to over 55 thriving individuals along the Ken River gorges.',
        editorialQuote: 'Panna is proof that with political willpower and dedicated field science, nature can rise from the ashes.',
        fullDesc: 'Covering 1,598 sq km across Panna and Chhatarpur districts, Panna Tiger Reserve is dominated by the gorges and cascading waterfalls of the Ken River. Famous for dramatic vulture nesting cliffs, boat safaris, and flourishing tiger populations.',
        heroImage: '/assets/img/tiger-first-person-jeep.jpg',
        galleryImages: ['/assets/img/photographer-fort-jeep.jpg', '/assets/img/tiger-golden-grassland.jpg'],
        areaSqKm: 1598,
        tigerCount: '55+ Royal Bengal Tigers',
        bestTimeToVisit: 'October to May',
        coordinates: { lat: 24.6295, lng: 80.0818 },
        mapPosition: { x: 50, y: 22 },
        startingPrice: 7000,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Madla Core Zone',
            type: 'core',
            gates: ['Madla Gate'],
            vehicleQuotaPerDay: 32,
            description: 'Scenic gateway alongside the Ken river with teak plateaus.',
            highlight: 'Ken river boat safaris and tiger tracking.'
          },
          {
            name: 'Hinouta Core Zone',
            type: 'core',
            gates: ['Hinouta Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Gorge sector featuring Dhundhwa seha and vulture nesting viewpoints.',
            highlight: 'Spectacular cliff vistas and leopard territory.'
          }
        ],
        wildlifeHighlights: ['Royal Bengal Tiger', 'Leopard', 'Sloth Bear', 'Chinkara', 'King Vulture', 'Gharial', 'Caracal'],
        howToReach: {
          air: 'Khajuraho Airport (25 km / 30 mins drive)',
          rail: 'Khajuraho (25 km) or Satna Junction (80 km)',
          road: 'Paved highway connecting from Khajuraho UNESCO temples'
        },
        rulesAndGuidelines: ['Ken river boating subject to river water levels.'],
        faqs: [{ question: 'How close is Panna to Khajuraho?', answer: 'Madla gate is just 25 km (30 minutes drive) from the Khajuraho airport and UNESCO temple complex.' }]
      },
      {
        name: 'Sanjay-Dubri Tiger Reserve',
        slug: 'sanjay-dubri',
        state: 'Madhya Pradesh',
        tagline: 'The Ancient Sal Frontier of Sidhi',
        shortDesc: 'A sprawling 1,674 sq km untamed paradise of quiet sal forests, perennial rivers, and vital corridors connecting Bandhavgarh with Guru Ghasidas in Chhattisgarh.',
        editorialQuote: 'Dubri is wilderness in its purest sense—expansive, quiet, and deeply authentic.',
        fullDesc: 'Located in the Sidhi and Shahdol districts, Sanjay-Dubri Tiger Reserve is known historically as the forest where the world’s first white tiger was discovered in 1951. Today it thrives with rebounding tiger populations and serene bamboo forests.',
        heroImage: '/assets/img/jungle-dirt-road.jpg',
        galleryImages: ['/assets/img/royal-bengal-prowl.jpg', '/assets/img/forest-canopy-sunbeams.jpg'],
        areaSqKm: 1674,
        tigerCount: '35+ Tigers and Elephant Corridor',
        bestTimeToVisit: 'November to May',
        coordinates: { lat: 24.0833, lng: 81.8667 },
        mapPosition: { x: 74, y: 28 },
        startingPrice: 6200,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Dubri Core',
            type: 'core',
            gates: ['Dubri Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Vast sal woodland with zero vehicle congestion.',
            highlight: 'Unspoiled forest feel and active wild elephant herds.'
          }
        ],
        wildlifeHighlights: ['Bengal Tiger', 'Leopard', 'Wild Elephant', 'Sloth Bear', 'Barking Deer', 'Chousingha'],
        howToReach: {
          air: 'Varanasi Airport (220 km) or Jabalpur (250 km)',
          rail: 'Rewa (100 km) or Beohari (35 km)',
          road: 'Connected via state highways from Rewa and Shahdol'
        },
        rulesAndGuidelines: ['Ideal for true wilderness lovers seeking low tourist footfall.'],
        faqs: [{ question: 'Are wild elephants found in Sanjay Dubri?', answer: 'Yes, wild herds migrating from Chhattisgarh frequently range through Dubri’s dense sal forests.' }]
      },
      {
        name: 'Kuno National Park',
        slug: 'kuno',
        state: 'Madhya Pradesh',
        tagline: 'The Historic Home of Project Cheetah',
        shortDesc: 'India’s historic savannah sanctuary in Sheopur, chosen for the world’s first intercontinental translocation of cheetahs to restore Asian grasslands.',
        editorialQuote: 'At Kuno, the speed and elegance of the cheetah returns to the Indian landscape after seven decades of absence.',
        fullDesc: 'Covering 748 sq km of open grassland savannahs, Kardhai woodlands, and rocky ravines carved by the Kuno river, Kuno National Park stands at the center of world conservation history as the release site for Project Cheetah.',
        heroImage: '/assets/img/tiger-golden-grassland.jpg',
        galleryImages: ['/assets/img/photographers-green-gypsy.jpg', '/assets/img/safari-trail-mist.jpg'],
        areaSqKm: 748,
        tigerCount: 'Cheetah Sanctuary + Resident Leopards',
        bestTimeToVisit: 'October to April',
        coordinates: { lat: 25.6881, lng: 77.2755 },
        mapPosition: { x: 28, y: 14 },
        startingPrice: 6500,
        availability: 'AVAILABLE',
        zones: [
          {
            name: 'Ahera and Peepalbawdi Zones',
            type: 'core',
            gates: ['Tiktoli Gate', 'Ahera Gate'],
            vehicleQuotaPerDay: 20,
            description: 'Grassland savannahs and Kardhai groves bordering the Kuno river.',
            highlight: 'Grassland wildlife tracking and Project Cheetah territory.'
          }
        ],
        wildlifeHighlights: ['African Cheetah (Project Cheetah)', 'Indian Leopard', 'Striped Hyena', 'Chinkara (Indian Gazelle)', 'Nilgai', 'Golden Jackal'],
        howToReach: {
          air: 'Gwalior Airport (160 km / 3.5 hrs drive)',
          rail: 'Gwalior (160 km) or Kota (140 km)',
          road: 'Well-connected from Gwalior and Shivpuri'
        },
        rulesAndGuidelines: [
          'Strict speed and viewing discipline around cheetah observation sectors.'
        ],
        faqs: [
          {
            question: 'Can visitors see cheetahs on safari in Kuno?',
            answer: 'Yes, designated open safari sectors allow visitors to explore the savannah habitats where acclimated cheetahs roam.'
          }
        ]
      }
    ];

    // Display rates / headline species / prime-zone curation, applied so this file
    // stays the single place to edit the base records.
    for (const d of destinationsData) Object.assign(d, editorialFor(d));

    // Whole-package tiers come from the Content Master (sections 10 and 11), which is the
    // pricing source of truth. These also drive startingPrice so safari base prices stay
    // consistent with the advertised package floor.
    const missingPackages = [];
    for (const d of destinationsData) {
      const p = PACKAGES_BY_SLUG[d.slug];
      if (!p) { missingPackages.push(d.slug); continue; }
      Object.assign(d, {
        packages: p.packages,
        positioning: p.positioning,
        bestSuitedFor: p.bestSuitedFor,
        gateway: p.gateway,
        packageDuration: p.duration,
        safariPlan: p.safari,
        startingPrice: p.startingPrice,
      });
    }
    if (missingPackages.length) {
      console.warn(`[Seed] No package data in Content Master for: ${missingPackages.join(', ')}`);
    }

    const createdDestinations = await Destination.insertMany(destinationsData);
    console.log(`[Seed] Successfully seeded ${createdDestinations.length} destinations (7 MP + 7 MH).`);

    // 3. Seed Safaris for Destinations
    const safarisData = [];
    for (const dest of createdDestinations) {
      // 1. Classic Morning Jeep Safari
      safarisData.push({
        destination: dest._id,
        destinationSlug: dest.slug,
        destinationName: dest.name,
        state: dest.state,
        name: `Sunrise Core Track Safari — ${dest.name}`,
        slug: `${dest.slug}-morning-jeep`,
        safariType: 'Jeep Safari',
        slot: 'Morning',
        duration: '3.5 - 4 hours',
        vehicle: 'Open 4x4 Safari Jeep',
        capacity: 6,
        zones: dest.zones.map(z => z.name),
        basePrice: dest.startingPrice,
        description: `Early dawn safari entering at gate opening. Optimal light for wildlife photography, fresh feline pugmarks, and active alarm calls.`,
        inclusions: ['4x4 Safari Jeep Permit', 'Certified Forest Department Naturalist', 'Taxes and Entry Fees', 'Morning Coffee and Tea Pack'],
        exclusions: ['Camera telephoto lens permits (if applicable)', 'Hotel pickup outside gate boundary'],
        highlights: ['First tracks on sand trails', 'Golden hour morning illumination', 'Bird activity peak'],
        availableDays: ['Everyday except Wednesday afternoons in MP'],
        availabilityStatus: 'AVAILABLE'
      });

      // 2. Afternoon Twilight Safari
      safarisData.push({
        destination: dest._id,
        destinationSlug: dest.slug,
        destinationName: dest.name,
        state: dest.state,
        name: `Afternoon Waterhole Vigil — ${dest.name}`,
        slug: `${dest.slug}-afternoon-jeep`,
        safariType: 'Jeep Safari',
        slot: 'Afternoon',
        duration: '3.5 hours',
        vehicle: 'Open 4x4 Safari Jeep',
        capacity: 6,
        zones: dest.zones.map(z => z.name),
        basePrice: dest.startingPrice + 500,
        description: `Afternoon expedition focusing on waterholes, shaded riverbanks, and predator movement before sunset.`,
        inclusions: ['4x4 Safari Jeep', 'Forest Guide', 'Park Permit', 'Chilled Water and Snacks'],
        exclusions: ['Tips to driver/guide'],
        highlights: ['Waterbody congregations', 'Warm late afternoon rim light', 'Sunset exit vistas'],
        availableDays: ['Everyday'],
        availabilityStatus: 'AVAILABLE'
      });

      // 3. Dedicated Photography Safari
      safarisData.push({
        destination: dest._id,
        destinationSlug: dest.slug,
        destinationName: dest.name,
        state: dest.state,
        name: `Exclusive Photography Expedition — ${dest.name}`,
        slug: `${dest.slug}-photography-safari`,
        safariType: 'Private Photography Safari',
        slot: 'Morning',
        duration: '4 hours',
        vehicle: 'Modified Open 4x4 Safari Vehicle with Beanbag Mounts',
        capacity: 3,
        zones: dest.zones.map(z => z.name),
        basePrice: dest.startingPrice * 1.6,
        description: `Tailored specifically for photographers. Max 3 photographers per vehicle for 360-degree lens positioning, quiet driving, and patient positioning.`,
        inclusions: ['Specialist Wildlife Photographer Guide', 'Beanbags for lenses up to 600mm', 'Inverter charging port in vehicle'],
        exclusions: ['Personal camera equipment'],
        highlights: ['Unobstructed 360 shooting angles', 'Driver trained in vehicle angle alignment with sunlight'],
        availableDays: ['Everyday'],
        availabilityStatus: 'AVAILABLE'
      });
    }

    // Legal category of each site. Only the ones the site copy is unambiguous about are
// listed; everything else falls through to the schema default of 'Reserve', which is
// correct for the tiger reserves (Tadoba, Pench MH, Melghat, Bor, Sahyadri, Bandhavgarh,
// Navegaon-Nagzira, Panna). Needs a human decision, not a guess:
//   satpura / pench-mp -> officially "X National Park and Tiger Reserve", so either
//   value is defensible. Set them in the admin Safaris table.
const PROTECTED_AREA_TYPE = {
  'umred-karhandla': 'Sanctuary', // Umred-Karhandla Wildlife Sanctuary
  kuno: 'Sanctuary',              // Kuno, a sanctuary in the cheetah translocation range
  kanha: 'National Park',         // Kanha National Park
  'sanjay-dubri': 'National Park' // Sanjay Dubri National Park
};
for (const s of safarisData) {
  s.protectedAreaType = PROTECTED_AREA_TYPE[s.destinationSlug] ?? 'Reserve';
}

    const createdSafaris = await Safari.insertMany(safarisData);
    console.log(`[Seed] Seeded ${createdSafaris.length} Safari packages.`);

    // 4. Seed Initial Bookings
    const sampleBooking = await Booking.create({
      bookingRef: 'SNS-2026-8942',
      user: demoCustomer._id,
      customerInfo: {
        fullName: 'Rohan Deshmukh',
        email: 'traveler@shutterandstripes.com',
        phone: '+91 98765 43210',
        country: 'India',
        idType: 'Aadhaar Card',
        idNumber: 'XXXX-XXXX-4819'
      },
      destination: createdDestinations[0]._id,
      destinationName: 'Tadoba-Andhari Tiger Reserve',
      safari: createdSafaris[0]._id,
      safariName: createdSafaris[0].name,
      safariDate: '2026-11-15',
      slot: 'Morning (06:00 AM - 10:00 AM)',
      zone: 'Moharli Core Zone',
      vehicleType: 'Open 4x4 Safari Jeep',
      guests: { adults: 2, children: 0 },
      naturalistRequested: true,
      specialRequests: 'Interested in tiger photography; please allocate experienced naturalist driver.',
      totalAmount: 10000,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    console.log('[Seed] Sample booking created: SNS-2026-8942');

    // 5. Seed Gallery Items using the authentic local assets
    const galleryData = [
      {
        title: 'Eyes in the Sal Forest',
        imageUrl: '/assets/img/bengal-tiger-portrait.jpg',
        animal: 'Tiger',
        destinationName: 'Bandhavgarh Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Sachin / Shutter and Stripes',
        cameraGear: 'Sony A1 + 400mm f/2.8 GM',
        isFeatured: true
      },
      {
        title: 'Morning Patrol on the Red Soil',
        imageUrl: '/assets/img/tiger-trail-jeep.jpg',
        animal: 'Tiger',
        destinationName: 'Tadoba-Andhari Tiger Reserve',
        state: 'Maharashtra',
        photographer: 'Resident Naturalist Team',
        cameraGear: 'Canon EOS R5 + 100-500mm',
        isFeatured: true
      },
      {
        title: 'The Silent Watcher of the Thicket',
        imageUrl: '/assets/img/leopard-stalking.jpg',
        animal: 'Leopard',
        destinationName: 'Pench Tiger Reserve',
        state: 'Maharashtra',
        photographer: 'Shutter and Stripes Expeditions',
        cameraGear: 'Nikon Z9 + 600mm f/4',
        isFeatured: true
      },
      {
        title: 'Field Guide and Forest Knowledge',
        imageUrl: '/assets/img/tadoba-guide-briefing.jpg',
        animal: 'Safari Life',
        destinationName: 'Tadoba-Andhari Tiger Reserve',
        state: 'Maharashtra',
        photographer: 'Naturalist Documentation',
        cameraGear: 'Fujifilm X-T5 + 16-55mm f/2.8',
        isFeatured: true
      },
      {
        title: 'In Front of the Safari Vehicle',
        imageUrl: '/assets/img/tiger-walking-ahead.jpg',
        animal: 'Tiger',
        destinationName: 'Umred-Karhandla Wildlife Sanctuary',
        state: 'Maharashtra',
        photographer: 'Field Guide Team',
        cameraGear: 'Sony A7 IV + 200-600mm G',
        isFeatured: true
      },
      {
        title: 'God Rays Through the Bamboo Canopy',
        imageUrl: '/assets/img/forest-canopy-sunbeams.jpg',
        animal: 'Forest Landscape',
        destinationName: 'Kanha Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Shutter And Stripes Master Library',
        cameraGear: 'Sony A7R V + 24-70mm GM II',
        isFeatured: true
      },
      {
        title: 'Gentle Giants in Morning Mist',
        imageUrl: '/assets/img/elephants-safari-jeep.jpg',
        animal: 'Elephant',
        destinationName: 'Bandhavgarh Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Shutter And Stripes Expeditions',
        cameraGear: 'Canon R5 + 70-200mm f/2.8',
        isFeatured: true
      },
      {
        title: 'First-Person Safari Encounter',
        imageUrl: '/assets/img/tiger-first-person-jeep.jpg',
        animal: 'Tiger',
        destinationName: 'Panna Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Guest Perspective',
        cameraGear: 'Sony A7 III + 70-200mm',
        isFeatured: true
      },
      {
        title: 'Guardian of the Reserve — Tadoba STR Guide',
        imageUrl: '/assets/img/tadoba-str-guide.jpg',
        animal: 'Safari Life',
        destinationName: 'Tadoba-Andhari Tiger Reserve',
        state: 'Maharashtra',
        photographer: 'Shutter And Stripes Portraits',
        cameraGear: 'Leica Q2',
        isFeatured: true
      },
      {
        title: 'The Stare from the Shadows',
        imageUrl: '/assets/img/tiger-leaves-peek.jpg',
        animal: 'Tiger',
        destinationName: 'Tadoba-Andhari Tiger Reserve',
        state: 'Maharashtra',
        photographer: 'Field Naturalist Staff',
        cameraGear: 'Nikon D850 + 500mm f/4',
        isFeatured: true
      },
      {
        title: 'Golden Dust on the Safari Trail',
        imageUrl: '/assets/img/safari-gypsy-dust-trail.jpg',
        animal: 'Safari Life',
        destinationName: 'Pench Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Shutter And Stripes Team',
        cameraGear: 'Canon EOS R6',
        isFeatured: false
      },
      {
        title: 'The Leap of the Leopard',
        imageUrl: '/assets/img/leopard-tree-gaze.jpg',
        animal: 'Leopard',
        destinationName: 'Satpura Tiger Reserve',
        state: 'Madhya Pradesh',
        photographer: 'Shutter And Stripes Naturalists',
        cameraGear: 'Sony A1 + 600mm f/4',
        isFeatured: false
      }
    ];

    await Gallery.insertMany(galleryData);
    console.log('[Seed] Gallery seeded with authentic photography.');

    // 6. Seed Journal Articles
    const journalData = [
      {
        title: 'The Art of the Safari: Ethical Wildlife Photography in India',
        slug: 'ethical-wildlife-photography-guide',
        category: 'Photography',
        excerpt: 'Why patience, vehicle positioning, and absolute respect for animal distance trump aggressive lens pursuit every single time.',
        content: `### Beyond the Trophy Shot\n\nTrue wildlife photography begins long before you press the shutter. In the dry deciduous canopies of central India, animal ethics and respectful distance are paramount.\n\n#### The Golden Rules of Indian Jungle Photography:\n1. **Zero Animal Disturbance**: Never ask your driver to maneuver aggressively or cut off an animal's path.\n2. **Silence Over Speed**: Wildlife senses sound and vibrations. A vehicle that cuts its engine and waits quietly will always yield richer behavioral moments.\n3. **Natural Light Mastery**: Morning light in sal forests creates soft, diffused rims. Use high shutter speeds without relying on artificial lighting or flashes.\n\n*"A great photograph celebrates the animal’s kingdom, never its inconvenience."*`,
        coverImage: '/assets/img/photographer-fort-jeep.jpg',
        author: 'Sachin — Founder and Principal Naturalist',
        readTime: '6 min read',
        destinationTag: 'Bandhavgarh'
      },
      {
        title: 'Tadoba Unveiled: The Dynasty of the Bamboo Thickets',
        slug: 'tadoba-dynasty-bamboo-thickets',
        category: 'Destinations',
        excerpt: 'Understanding the terrain, waterholes, and seasonal movements of Maharashtra’s greatest tiger sanctuary.',
        content: `### Why Tadoba Captivates the World\n\nTadoba-Andhari in Chandrapur is legendary for a reason. Unlike many northern reserves that close during the monsoon, Tadoba’s buffer zones stay active all year.\n\nFrom the ancient Telia Dam to the rolling grasslands of Moharli, tigers here have coexisted alongside experienced tribal guides for decades, creating observational encounters that redefine human connection with nature.`,
        coverImage: '/assets/img/tadoba-moharli-gate.jpg',
        author: 'Vidarbha Field Research Team',
        readTime: '8 min read',
        destinationTag: 'Tadoba-Andhari'
      },
      {
        title: 'Comparing the Twin Sisters: Pench MP vs. Pench Maharashtra',
        slug: 'comparing-pench-mp-vs-pench-maharashtra',
        category: 'Safari Guide',
        excerpt: 'Understanding the distinct gateways, administration, and landscape character of the two sides of Kipling’s river.',
        content: `### One Forest, Two States, Two Unique Experiences\n\nMany travelers are confused when booking Pench. The reserve is split between Madhya Pradesh (Seoni and Chhindwara) and Maharashtra (Nagpur).\n\n- **Pench MP (Turia and Karmajhiri)**: Known for open teak woodlands, white ghost trees (Kullu), and expansive morning visibility.\n- **Pench Maharashtra (Sillari and Mansinghdeo)**: Denser riverine banks, quiet buffer corridors, and proximity to Nagpur airport.\n\nBoth are essential jewels of Central India's tiger landscape.`,
        coverImage: '/assets/img/safari-trail-mist.jpg',
        author: 'Editorial Desk',
        readTime: '5 min read',
        destinationTag: 'Pench'
      },
      {
        // ponytail: placeholder entry for Sachin's blog — replace content when written.
        title: 'Notes from the Forest Floor',
        slug: 'notes-from-the-forest-floor',
        category: 'Wildlife',
        excerpt: 'Field observations, tracking notes and seasonal natural-history updates from our core reserves.',
        content: `### Coming Soon\n\nThis is where Sachin's field notes will live — tracking data, seasonal sightings, and natural-history observations gathered across our reserves.\n\nSubscribe to be notified when the first entry publishes.`,
        coverImage: '/assets/img/photographer-fort-jeep.jpg',
        author: 'Sachin — Founder and Principal Naturalist',
        readTime: '4 min read',
        destinationTag: 'Core Reserves'
      }
    ];

    await Journal.insertMany(journalData);
    console.log('[Seed] Journal articles seeded.');

    // 7. Seed FAQs
    const faqData = [
      {
        category: 'Booking',
        question: 'How far in advance should I book tiger safari permits in MP and Maharashtra?',
        answer: 'For core zones in Bandhavgarh, Kanha, and Tadoba, permits are released online 120 days in advance by state forest departments. Because vehicle quotas are strictly limited to prevent habitat stress, we strongly recommend reserving your permits 90–120 days prior to travel.'
      },
      {
        category: 'Booking',
        question: 'What documents are required to confirm a safari booking?',
        answer: 'State forest departments mandate official government-issued photo identity proof (Passport for international travelers; Aadhaar card, Voter ID, or Driving License for Indian nationals). The exact ID used at the time of booking must be presented in original at the gate.'
      },
      {
        category: 'Safari',
        question: 'Are tiger sightings guaranteed on a safari?',
        answer: 'No. Shutter and Stripes operates with strict ethical integrity and never guarantees wildlife sightings. Forests are vast, wild, open ecosystems. However, our experienced local naturalists track fresh pugmarks, territorial scat, and deer/monkey alarm calls to maximize observational opportunities.'
      },
      {
        category: 'Safari',
        question: 'What is the difference between Core and Buffer safari zones?',
        answer: 'Core zones are the central, strictly protected inviolate breeding grounds of the tiger reserve with restricted vehicle permits. Buffer zones are peripheral conserved forests where wildlife thrives in harmony with local villages, often offering night safaris and year-round accessibility.'
      },
      {
        category: 'Payments',
        question: 'What is included in the Shutter and Stripes safari fee?',
        answer: 'Our transparent pricing covers the official forest department permit, registered open 4x4 safari vehicle hire, fuel, certified local forest naturalist guide fees, and all applicable statutory park taxes.'
      },
      {
        category: 'Wildlife Etiquette',
        question: 'What clothing and colors should I wear on an Indian safari?',
        answer: 'Wear muted earthy tones—khaki, olive green, beige, brown, and tan. Bright neon colors, white, and reflective fabrics startle wildlife and are discouraged. Layering is essential: winter mornings can drop below 5°C while afternoons remain comfortably warm.'
      }
    ];

    await FAQ.insertMany(faqData);
    console.log('[Seed] FAQs seeded.');

    // 8. Seed Customer Reviews
    const reviewsData = [
      {
        destinationName: 'Tadoba-Andhari Tiger Reserve',
        author: 'Arjun Singhania',
        authorLocation: 'Mumbai, India',
        rating: 5,
        title: 'Masterclass in Ethical Field Guiding',
        comment: 'Our naturalist guide in Moharli was extraordinary. He positioned our safari jeep with immense patience without crowding the animals. Seeing a tigress emerge from the bamboo was unforgettable.',
        safariType: 'Private Photography Safari',
        date: 'February 2026'
      },
      {
        destinationName: 'Bandhavgarh Tiger Reserve',
        author: 'Claire and Matthew Davies',
        authorLocation: 'Bristol, UK',
        rating: 5,
        title: 'The Photography Equipment Setup was Flawless',
        comment: 'As wildlife photographers, having beanbags, 360-degree freedom, and an experienced driver who understood lighting angles made our trip to Tala zone a dream come true.',
        safariType: 'Exclusive Photography Expedition',
        date: 'January 2026'
      },
      {
        destinationName: 'Pench Tiger Reserve — Madhya Pradesh',
        author: 'Vikram and Priya Nair',
        authorLocation: 'Bengaluru, India',
        rating: 5,
        title: 'Seamless Booking and Transparent Communication',
        comment: 'Booking permits in India can be daunting, but Shutter and Stripes managed everything effortlessly. The morning light in Turia was pure magic.',
        safariType: 'Jeep Safari',
        date: 'March 2026'
      }
    ];

    await Review.insertMany(reviewsData);
    console.log('[Seed] Reviews seeded.');

    // 9. Seed CMS Content (Homepage and Our Story and Settings)
    await CMSContent.create({
      key: 'homepage',
      data: {
        heroHeadline: 'CHASE THE WILD.',
        heroSubtitle: 'Curated wildlife expeditions, local naturalist mastery, and ethical photography across Madhya Pradesh and Maharashtra.',
        statesOverview: {
          mpDescription: 'The heart of India featuring world-renowned tiger bastions like Bandhavgarh, Kanha, Pench MP, and Satpura.',
          mhDescription: 'Rugged basalt terrains, dense bamboo valleys, and legendary feline dynasties in Tadoba, Pench MH, and Umred.'
        }
      }
    });

    await CMSContent.create({
      key: 'our_story',
      data: {
        heroTitle: 'OUR STORY',
        heroSubtitle: 'Where photography meets forest wisdom, guided by the people who call the jungle home.',
        whyWeExist: 'Shutter and Stripes was born from a fundamental belief: that genuine wildlife encounters require deep patience, localized ecological knowledge, and unwavering reverence for wild habitats.',
        shutterPhilosophy: 'The Shutter represents deliberate observation, framing moments through patient stillness rather than intrusive proximity. Every frame is a tribute to biodiversity.',
        stripesPhilosophy: 'The Stripes embody the spirit of the Royal Bengal Tiger—power, mystery, and the delicate equilibrium of Indian wilderness that demands our fiercest protection.',
        indianWilderness: 'Central India is one of the world’s greatest wildlife corridors. Spanning the ancient sal trees of Madhya Pradesh to the rugged teak ridges of Maharashtra, these forests represent living natural heritage.',
        philosophyPoints: [
          { title: 'Locals First', desc: 'Our naturalists and drivers are born and raised in forest fringe communities, possessing generational tracking instincts.' },
          { title: 'Ethical Photography', desc: 'We never corner animals, speed on tracks, or prioritize a camera shot over an animal’s peace.' },
          { title: 'Conservation Support', desc: 'Direct contributions to anti-poaching patrol camps and local community livelihood programs.' }
        ],
        finalCta: {
          headline: 'THE WILD IS WAITING.',
          subheadline: 'Step into the realm of the Royal Bengal Tiger with those who know its trails by heart.'
        }
      }
    });

    await SiteSettings.create({
      siteName: 'SHUTTER AND STRIPES',
      tagline: 'Guided by Locals • Inspired by Nature',
      contactEmail: 'concierge@shutterandstripes.com',
      contactPhone: '+91 (0) 712 258 4930',
      officeAddress: 'Civil Lines, Nagpur, Maharashtra 440001 (Gateway to Central Indian Tiger Reserves)',
      emergencySupport: '+91 98230 45678'
    });

    console.log('[Seed] CMS Content and Site Settings seeded.');
    console.log('[Seed] Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
