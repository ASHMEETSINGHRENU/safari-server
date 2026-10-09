// Deletes one or more destinations by slug: `node src/seed/removeDestination.js radhanagari`.
//
// Targeted cleanup for a reserve retired from the Content Master — unlike `npm run seed`
// it never touches other collections, so hand-edited copy, reviews and bookings survive.
import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';

const slugs = process.argv.slice(2);

const run = async () => {
  if (!slugs.length) {
    console.error('[Remove] Usage: node src/seed/removeDestination.js <slug> [slug...]');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Remove] Target: ${mongoose.connection.host}/${mongoose.connection.name}`);

  for (const slug of slugs) {
    const { deletedCount } = await Destination.deleteOne({ slug });
    console.log(`[Remove] ${deletedCount ? 'deleted' : 'not found'}: ${slug}`);
  }

  const total = await Destination.countDocuments({});
  console.log(`[Remove] Done. ${total} destinations now in the database.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('[Remove] Failed:', err.message);
  process.exit(1);
});
