import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';

const IMAGE_UPDATES = {
  'bandhavgarh': '/assets/img/Gallary/IMG_5316.webp',
  'kheoni': '/assets/img/Gallary/IMG_5306.webp',
  'kanha': '/assets/img/reserves/kanha-barasingha.jpg',
  'kuno': '/assets/img/reserves/kuno-cheetah.jpg',
  'panna': '/assets/img/Gallary/IMG_5260.webp',
  'pench-mp': '/assets/img/Gallary/IMG_5317.webp',
  'ratapani': '/assets/img/Gallary/IMG_5301.webp',
  // sanjay-dubri: no change
  // satpura: no change
  'bor': '/assets/img/Gallary/IMG_5261.webp',
  'melghat': '/assets/img/Gallary/IMG_5259.webp',
  'mogarkasa': '/assets/img/reserves/mogarkasa-black-leopard.jpg',
  'navegaon-nagzira': '/assets/img/reserves/nagzira-wild-dogs.jpg',
  // pench-mh: no change
  'tadoba-andhari': '/assets/img/Gallary/IMG_5250.webp',
  'umred-karhandla': '/assets/img/Gallary/IMG_5262.webp',
  'tipeshwar': '/assets/img/Gallary/IMG_5312.webp',
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
