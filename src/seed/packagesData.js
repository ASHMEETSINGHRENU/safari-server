// Extracted from Shutter_and_Stripes_Website_Content_Master.md sections 10 and 11,
// re-priced from "Tour package details_updated (1).docx". 17 destinations, 3 tiers each.
// This is the deployed price authority: quoteFor() in src/utils/pricing.js reads it via
// the destination's packages[].
//
// Whole packages only. Park permit, vehicle, naturalist guide, meals, transfers and
// forest dues are all inside the tier price and are never itemised alongside it.
// min is the quote basis (what the server charges); max is the advertised ceiling and
// openEnded marks tiers quoted as "up to" (rendered with a trailing +).
//
// A tier priced 0 is NOT offered for that reserve. packagesOf() (client) and quoteFor()
// (server) drop min <= 0 tiers, so a reserve showing "Budget: 0" simply renders without
// a Budget option and, when only Mid-Range is priced, quotes Mid-Range.
//
// When the master doc changes, re-extract these tiers. The markdown tables are
// irregular (one table divider leaked in as an includes entry), so check that no
// entry is only punctuation before committing.
export const PACKAGES_BY_SLUG = {
  "tadoba-andhari": {
    "positioning": "The Sighting Capital",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 33500,
    "packages": [
      {
        "label": "Budget",
        "min": 33500,
        "max": 33500,
        "openEnded": false,
        "includes": [
          "Standard AC rooming at TADOBA SAFARI STAY NATURE'S SPROUT",
          "Fixed multi-cuisine home-style dinners",
          "Grouped station transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 36000,
        "max": 36000,
        "openEnded": false,
        "includes": [
          "Premium independent forest cottage layouts at Tathastu Tadoba",
          "Lavish multi-cuisine buffet spreads",
          "Core track registry",
          "Private AC sedan transport"
        ]
      },
      {
        "label": "Luxury",
        "min": 48000,
        "max": 48000,
        "openEnded": false,
        "includes": [
          "Ultra-premium signature villas at WelcomHeritage Tadoba Vanya Villas Resort & Spa",
          "Tailored bush fine-dining menus",
          "Dedicated master naturalists",
          "Private luxury SUV transfers"
        ]
      }
    ]
  },
  "pench-mh": {
    "positioning": "The Sillari Hub",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Basic eco-resort stays near Sillari",
          "Standard Indian menus",
          "Scheduled group transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 35000,
        "max": 35000,
        "openEnded": false,
        "includes": [
          "Deluxe cottages at Olive Resorts Pench",
          "Multi-cuisine pool-view buffets",
          "Sillari core tracking",
          "Private sedan setups"
        ]
      },
      {
        "label": "Luxury",
        "min": 47000,
        "max": 47000,
        "openEnded": false,
        "includes": [
          "Boutique private glamping villas near the boundary",
          "Bespoke estate dining",
          "Veteran trackers",
          "Private premium SUV allocations"
        ]
      }
    ]
  },
  "melghat": {
    "positioning": "The Satpura Highland Fortress",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 29500,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Authentic eco-lodge cabins at Semadoh Forest Rest House",
          "Local traditional meals",
          "Shared buffer tracks"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 29500,
        "max": 29500,
        "openEnded": false,
        "includes": [
          "Deluxe rooms at Green Valley Resort Chikhaldara",
          "Comprehensive core track drives",
          "Buffet-style dining",
          "Private transfers"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Elite view-villas at premium highland properties",
          "Customized private field menus",
          "Exclusive master trackers",
          "Luxury private SUV transport"
        ]
      }
    ]
  },
  "navegaon-nagzira": {
    "positioning": "The Central Bamboo Forest",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Clean rooms at Mahaforest Eco-Resorts",
          "Basic multi-cuisine fixed blocks",
          "Entry transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Deluxe cabins at Nagzira Nature Camp",
          "Pool access",
          "Core tracking priority",
          "Private AC transfers"
        ]
      },
      {
        "label": "Luxury",
        "min": 42500,
        "max": 42500,
        "openEnded": false,
        "includes": [
          "Premium boutique canvas tents",
          "Tailored bush-lit dinners",
          "Veteran tracking experts",
          "Premium luxury SUV travel"
        ]
      }
    ]
  },
  "bor": {
    "positioning": "The Micro-Reserve Pioneer",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Standard rooming layouts at MTDC Bor",
          "Home-cooked regional platters",
          "Scheduled entries"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Modern AC cottage rooms at Bor Wildlife Resort",
          "Fresh multi-cuisine buffets",
          "Private AC sedan pickup from Nagpur"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Premium lakeside eco-suites",
          "Gourmet terrace dining setups",
          "Veteran guides",
          "Private SUV transfers"
        ]
      }
    ]
  },
  "tipeshwar": {
    "positioning": "The Breeding Haven",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Standard nature lodges near Sunna",
          "Hot local-style meals",
          "Direct pickups"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 35000,
        "max": 35000,
        "openEnded": false,
        "includes": [
          "Deluxe rooms at Tipeshwar Tiger Resort",
          "Swimming pool utilities",
          "Core-zone track tracking",
          "Private vehicles"
        ]
      },
      {
        "label": "Luxury",
        "min": 48000,
        "max": 48000,
        "openEnded": false,
        "includes": [
          "Boutique high-end luxury wilderness camps",
          "Bespoke menu spreads",
          "Master trackers",
          "Private premium cars"
        ]
      }
    ]
  },
  "umred-karhandla": {
    "positioning": "The Migratory Corridor",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Traditional rural eco-homestays",
          "Regional hand-cooked selections",
          "Direct drops"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 38500,
        "max": 38500,
        "openEnded": false,
        "includes": [
          "Premium AC cottages at local wildlife resorts",
          "Buffet blocks",
          "Private vehicle drops from Nagpur"
        ]
      },
      {
        "label": "Luxury",
        "min": 47000,
        "max": 47000,
        "openEnded": false,
        "includes": [
          "Boutique concept countryside hideaways",
          "Fine-dining inclusions",
          "Private naturalists",
          "Luxury SUV pickups"
        ]
      }
    ]
  },
  "mogarkasa": {
    "positioning": "The Black Panther Frontier",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Basic eco-tented rest houses or village homestays near Pawani",
          "Home-cooked Vidarbha cuisine",
          "Grouped highway transit"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Comfort cottages at organic farm-stay properties such as Anandvan Agrotourism",
          "Farm-to-table buffet spreads",
          "Guaranteed slots via the new Mogarkasa access",
          "Private sedan pickups"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Premium safari villas bordering the Pench-Mogarkasa corridor",
          "Bespoke outdoor dynamic dining spreads",
          "Master naturalists specializing in melanistic tracking",
          "Luxury private SUV transfers"
        ]
      }
    ]
  },
  "kanha": {
    "positioning": "The Meadow Heritage",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Cozy accommodation near Khatia at Kanha Resort",
          "Fixed Indian menus",
          "Core tracking block access"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 36000,
        "max": 36000,
        "openEnded": false,
        "includes": [
          "Independent earth cottages at Kanha Earth Lodge",
          "Farm-to-table organic buffets",
          "Primary core tracks registry: Kanha/Kisli/Mukki",
          "Private sedan support"
        ]
      },
      {
        "label": "Luxury",
        "min": 48500,
        "max": 48500,
        "openEnded": false,
        "includes": [
          "Opulent river-view tented platforms at Banjaar Tola, A Taj Safari, Kanha National Park",
          "Signature Taj fine-dining hospitality",
          "Veteran master naturalists",
          "Premium luxury private SUV transfers"
        ]
      }
    ]
  },
  "bandhavgarh": {
    "positioning": "The Royal Tiger Fortress",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Clean courtyard safari units near Tala",
          "Full buffet tracks",
          "Reliable pickups"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 35000,
        "max": 35000,
        "openEnded": false,
        "includes": [
          "Premium forest huts at Kings Lodge Bandhavgarh",
          "Multi-cuisine pool decks",
          "Tala/Magdhi core zone entry",
          "Private AC vehicles"
        ]
      },
      {
        "label": "Luxury",
        "min": 48500,
        "max": 48500,
        "openEnded": false,
        "includes": [
          "Royal-style heritage villas at Mahua Kothi, A Taj Safari",
          "Private star-lit bush dinners",
          "Veteran tracking trackers",
          "Executive SUV transfers"
        ]
      }
    ]
  },
  "pench-mp": {
    "positioning": "The Original Kipling Woods",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 32000,
    "packages": [
      {
        "label": "Budget",
        "min": 32000,
        "max": 32000,
        "openEnded": false,
        "includes": [
          "Comfort safari rooms at The Pench International",
          "A Jungle water resort",
          "Multi-cuisine fixed menus",
          "Shared pickups"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 36000,
        "max": 36000,
        "openEnded": false,
        "includes": [
          "Chic contemporary forest cabins at Sterling Padam Pench",
          "Expansive buffets",
          "Turia core tracking",
          "Private AC sedan support"
        ]
      },
      {
        "label": "Luxury",
        "min": 48000,
        "max": 48000,
        "openEnded": false,
        "includes": [
          "Opulent river suites or machans at Baghvan, A Taj Safari",
          "All-inclusive private-property fine dining",
          "Signature master naturalists",
          "Luxury premium SUV drives"
        ]
      }
    ]
  },
  "satpura": {
    "positioning": "The Multimodal Ecosphere",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 15500,
    "packages": [
      {
        "label": "Budget",
        "min": 15500,
        "max": 19000,
        "openEnded": false,
        "includes": [
          "Clean backwater-view units near Madhai",
          "Traditional village-style buffets",
          "Core access transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 25000,
        "max": 33000,
        "openEnded": false,
        "includes": [
          "Luxury cottages at Denwa Backwater Escape",
          "Panoramic reservoir perspectives",
          "Private canoe reservations",
          "Private vehicle setups"
        ]
      },
      {
        "label": "Luxury",
        "min": 45000,
        "max": 75000,
        "openEnded": true,
        "includes": [
          "High-end eco-suites at Forsyth Lodge",
          "Premium private deck dining",
          "Master naturalists",
          "Premium private SUV transfers"
        ]
      }
    ]
  },
  "panna": {
    "positioning": "The Diamond & River Gorges",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 34000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Comfortable local heritage homestays near Madla",
          "Fixed menu buffets",
          "Airport/station drops"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 34000,
        "max": 34000,
        "openEnded": false,
        "includes": [
          "River-facing independent cottage rooms at Ken River Lodge",
          "Organic local spreads",
          "Integrated Khajuraho heritage excursions",
          "Private sedans"
        ]
      },
      {
        "label": "Luxury",
        "min": 45000,
        "max": 45000,
        "openEnded": false,
        "includes": [
          "Stone-sculpted river villas at Pashan Garh, A Taj Safari",
          "Private stream-side fine-dining alignments",
          "Master naturalists",
          "High-end private SUV transfers"
        ]
      }
    ]
  },
  "sanjay-dubri": {
    "positioning": "The Deep Sal Wilderness",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 35000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Clean forest rest-houses near Dubri",
          "Simple traditional buffet menus",
          "Entry transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 35000,
        "max": 35000,
        "openEnded": false,
        "includes": [
          "Riverside cottage tracks at Parsili Resort, MP Tourism",
          "Scenic river-deck breakfast spreads",
          "Core track blocks",
          "Private sedan vehicles"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Boutique deep-forest glamping suites",
          "Curated private estate dining",
          "Veteran trackers",
          "Premium SUV transfers"
        ]
      }
    ]
  },
  "ratapani": {
    "positioning": "The Ancient Heritage Frontier",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 37500,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Clean transit eco-lodges near Bhimbetka",
          "Classic Indian set menus",
          "Direct drop coordination"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 37500,
        "max": 37500,
        "openEnded": false,
        "includes": [
          "Premium cottage rooms at MP Tourism Highway Retreat near Kolar Dam",
          "Fresh multi-cuisine spreads",
          "Private sedan from Bhopal"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Boutique premium rural-luxe forest villas",
          "All-inclusive personalized estate meals",
          "Veteran naturalists",
          "Luxury SUV transfers"
        ]
      }
    ]
  },
  "kuno": {
    "positioning": "The Global Cheetah Sanctuary",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 35000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Clean nature-adjacent rooms near Tiktoli",
          "Simple hot local dishes",
          "Station transfers"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 35000,
        "max": 35000,
        "openEnded": false,
        "includes": [
          "Premium AC cottages at Kuno Wildlife Resort or MP Tourism jungle huts",
          "Multi-cuisine pool buffet tracks",
          "Private sedan vehicles"
        ]
      },
      {
        "label": "Luxury",
        "min": 42500,
        "max": 42500,
        "openEnded": false,
        "includes": [
          "Ultra-luxury custom safari glamping tents",
          "Personalized private bush fine-dining blocks",
          "Elite tracking naturalists",
          "Premium private SUV transfers"
        ]
      }
    ]
  },
  "kheoni": {
    "positioning": "The Uncharted Wild Heart",
    "bestSuitedFor": null,
    "gateway": null,
    "duration": null,
    "safari": null,
    "startingPrice": 42000,
    "packages": [
      {
        "label": "Budget",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Standard non-AC or standard AC rooming at the official Forest Department Rest House",
          "Basic local Malwi meals",
          "Direct pickups"
        ]
      },
      {
        "label": "Mid-Range",
        "min": 42000,
        "max": 42000,
        "openEnded": false,
        "includes": [
          "Eco-cottage accommodations at the official Kheoni Eco Jungle Camp operated by the MP Ecotourism Board",
          "Local farm spreads",
          "Priority safari permit clearance",
          "Private sedan from Indore"
        ]
      },
      {
        "label": "Luxury",
        "min": 0,
        "max": 0,
        "openEnded": false,
        "includes": [
          "Premium wooden chalets within designated eco-zones",
          "Curated open-air jungle dinners",
          "Expert community tracking naturalists",
          "Private premium SUV transfers"
        ]
      }
    ]
  }
};
