// Imports every WebP in client/public/assets/img/Gallary plus the Hero slides into the
// CMS Gallery collection. Upserts by imageUrl, so it is safe to re-run and never wipes
// other collections (unlike `npm run seed`). Titles/categories are placeholders meant to
// be curated later in the admin CMS.
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MONGO_URI } from '../config/env.js';
import { Gallery } from '../models/Gallery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_ROOT = path.resolve(__dirname, '../../../client/public/assets/img');

const readWebp = (subdir, re) =>
  fs.existsSync(path.join(IMG_ROOT, subdir))
    ? fs.readdirSync(path.join(IMG_ROOT, subdir)).filter(f => f.endsWith('.webp') && (!re || re.test(f)))
    : [];

const buildItem = (subdir, file, title) => ({
  title,
  imageUrl: `/assets/img/${subdir}/${file}`,
});

const run = async () => {
  const gallery = readWebp('Gallary').map(f =>
    buildItem('Gallary', f, `Field Frame ${f.match(/\d+/)?.[0] ?? ''}`.trim())
  );
  const hero = readWebp('Hero', /^hero-/).map(f =>
    buildItem('Hero', f, `Signature Frame ${f.match(/\d+/)?.[0] ?? ''}`.trim())
  );

  const items = [...hero, ...gallery].map(i => ({ ...i, animal: 'Safari Life', isFeatured: /Hero\//.test(i.imageUrl) }));

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log(`[Gallery] Target: ${mongoose.connection.host}/${mongoose.connection.name}`);

  let inserted = 0;
  for (const item of items) {
    const res = await Gallery.updateOne(
      { imageUrl: item.imageUrl },
      { $setOnInsert: item },
      { upsert: true }
    );
    if (res.upsertedCount) inserted++;
  }

  const total = await Gallery.countDocuments({});
  console.log(`[Gallery] ${inserted} new image(s) added, ${items.length - inserted} already present.`);
  console.log(`[Gallery] Done. ${total} gallery items now in the database.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('[Gallery] Failed:', err.message);
  process.exit(1);
});
