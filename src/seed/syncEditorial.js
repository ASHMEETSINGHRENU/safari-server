// Applies the editorial display extras (package tiers, positioning copy, headline
// species, prime-zone curation) to destinations that already exist in the database.
//
// Use this instead of `npm run seed` when the reserves are already live: seed wipes
// every collection, which throws away hand-edited copy, reviews, and bookings.
import mongoose from 'mongoose';
import { MONGO_URI } from '../config/env.js';
import { Destination } from '../models/Destination.js';
import { editorialFor } from './editorial.js';
import { PACKAGES_BY_SLUG } from './packagesData.js';

const run = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  // lean(): plain objects, so spreading a zone in editorialFor copies the zone's own
  // fields instead of mongoose subdocument internals like __parentArray.
  const destinations = await Destination.find({}).lean();

  let prime = 0;
  let priced = 0;
  const missing = [];
  for (const d of destinations) {
    const fields = editorialFor(d);
    prime += fields.zones.filter(z => z.isPrime).length;

    // Package tiers are authoritative from the Content Master. A reserve with no
    // entry keeps its existing tiers (or none) and is reported rather than guessed.
    const pkg = PACKAGES_BY_SLUG[d.slug];
    if (pkg) {
      fields.packages = pkg.packages;
      if (pkg.positioning) fields.positioning = pkg.positioning;
      if (pkg.bestSuitedFor) fields.bestSuitedFor = pkg.bestSuitedFor;
      if (pkg.gateway) fields.gateway = pkg.gateway;
      if (pkg.duration) fields.packageDuration = pkg.duration;
      if (pkg.safariPlan) fields.safariPlan = pkg.safariPlan;
      priced += 1;
    } else {
      missing.push(d.slug);
    }

    await Destination.updateOne({ _id: d._id }, { $set: fields });
  }

  console.log(`[Sync] Updated ${destinations.length} destinations (${prime} prime zones flagged).`);
  console.log(`[Sync] Applied package tiers to ${priced}/${destinations.length} destinations.`);
  if (missing.length) {
    console.warn(`[Sync] No package data in the Content Master for: ${missing.join(', ')}`);
    console.warn('[Sync] Those reserves will show "On request" until the master is updated.');
  }
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('[Sync] Failed:', err.message);
  process.exit(1);
});
