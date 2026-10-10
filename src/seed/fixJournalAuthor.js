import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Journal } from '../models/Journal.js';

const AUTHOR_UPDATES = {
  'ethical-wildlife-photography-guide': 'Resident Naturalist',
};

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[JournalAuthor] Connected to DB: ${mongoose.connection.name}`);

  for (const [slug, author] of Object.entries(AUTHOR_UPDATES)) {
    const res = await Journal.updateOne({ slug }, { $set: { author } });
    console.log(`[JournalAuthor] ${slug} -> "${author}" (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
  }

  await mongoose.disconnect();
  console.log('[JournalAuthor] Done.');
}

run().catch(err => {
  console.error('[JournalAuthor] Failed:', err);
  process.exit(1);
});
