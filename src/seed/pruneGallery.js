// Removes Gallery items whose imageUrl no longer exists on disk (e.g. retired dummy art).
// Upsert-side companion to addGallery.js; touches only the Gallery collection.
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MONGO_URI } from '../config/env.js';
import { Gallery } from '../models/Gallery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, '../../../client/public');
const exists = (u) => /^https?:/.test(u || '') || fs.existsSync(path.join(PUB, String(u).replace(/^\//, '')));

const run = async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Gallery] Target: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const items = await Gallery.find({}).select('imageUrl title').lean();
  const stale = items.filter((i) => !exists(i.imageUrl));
  stale.forEach((i) => console.log(`[Gallery] stale: ${i.imageUrl}  (${i.title})`));

  if (!apply) {
    console.log(`[Gallery] Dry run: ${stale.length} stale item(s). Re-run with --apply to delete.`);
  } else if (stale.length) {
    const { deletedCount } = await Gallery.deleteMany({ _id: { $in: stale.map((i) => i._id) } });
    console.log(`[Gallery] Deleted ${deletedCount} stale item(s).`);
  }

  const total = await Gallery.countDocuments({});
  console.log(`[Gallery] Done. ${total} gallery items now in the database.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[Gallery] Failed:', err.message);
  process.exit(1);
});
