import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';

const TAGLINE_UPDATES = {
  'pench-mh': 'The Original Mowgli Heartland',
  'pench-mp': 'The Classic Seoni Woodlands',
};

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Taglines] Connected to DB: ${mongoose.connection.name}`);

  for (const [slug, tagline] of Object.entries(TAGLINE_UPDATES)) {
    const res = await Destination.updateOne({ slug }, { $set: { tagline } });
    console.log(`[Taglines] ${slug} -> "${tagline}" (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
  }

  await mongoose.disconnect();
  console.log('[Taglines] Done.');
}

run().catch(err => {
  console.error('[Taglines] Failed:', err);
  process.exit(1);
});
