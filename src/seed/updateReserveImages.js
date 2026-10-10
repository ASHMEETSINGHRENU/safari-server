import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';

const IMAGE_UPDATES = {
  'bandhavgarh': '/assets/img/Gallary/IMG_5316.webp',
  'bor': '/assets/img/reserves/bor-tiger.webp',
  'kanha': '/assets/img/reserves/kanha.webp',
  'kheoni': '/assets/img/reserves/kheoni.webp',
  'kuno': '/assets/img/reserves/kuno.webp',
  'mogarkasa': '/assets/img/reserves/mogarkasa-black-leopard.jpg',
  'navegaon-nagzira': '/assets/img/reserves/nagzira-wild-dogs.jpg',
  'panna': '/assets/img/Gallary/IMG_5260.webp',
  'pench-mp': '/assets/img/reserves/pench.webp',
  'ratapani': '/assets/img/Gallary/IMG_5301.webp',
  'satpura': '/assets/img/reserves/satpura.webp',
  // sanjay-dubri: no change
  'tadoba-andhari': '/assets/img/Gallary/IMG_5250.webp',
  'tipeshwar': '/assets/img/reserves/tipeshwar.webp',
  'umred-karhandla': '/assets/img/reserves/umred.webp',
};

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Images] Connected to DB: ${mongoose.connection.name}`);

  for (const [slug, heroImage] of Object.entries(IMAGE_UPDATES)) {
    const res = await Destination.updateOne({ slug }, { $set: { heroImage } });
    console.log(`[Images] ${slug} -> ${heroImage} (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
  }

  await mongoose.disconnect();
  console.log('[Images] Done updating reserve images.');
}

run().catch(err => {
  console.error('[Images] Failed:', err);
  process.exit(1);
});
