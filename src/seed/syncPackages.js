// Applies the re-priced package tiers (packagesData.js) to destinations already in the
// database. Price-only: unlike sync:editorial it never touches editorial copy or zones,
// so it is safe to run against a hand-edited database. Run after editing packagesData.js.
import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';
import { PACKAGES_BY_SLUG } from './packagesData.js';

const run = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });

  let updated = 0;
  const missing = [];
  for (const [slug, pkg] of Object.entries(PACKAGES_BY_SLUG)) {
    const res = await Destination.updateOne(
      { slug },
      { $set: { packages: pkg.packages, startingPrice: pkg.startingPrice } }
    );
    if (res.matchedCount === 0) missing.push(slug);
    else updated += 1;
  }

  console.log(`[SyncPrices] Updated ${updated}/${Object.keys(PACKAGES_BY_SLUG).length} destinations.`);
  if (missing.length) console.warn(`[SyncPrices] No destination in DB for: ${missing.join(', ')}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[SyncPrices] Failed:', err.message);
  process.exit(1);
});
