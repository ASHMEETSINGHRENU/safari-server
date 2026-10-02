// Self-check for the package pricing authority (src/utils/pricing.js).
// No test framework: plain asserts, run with `npm run check:pricing`.
import assert from 'node:assert/strict';
import { quoteFor } from './src/utils/pricing.js';
import { PACKAGES_BY_SLUG } from './src/seed/packagesData.js';

let checks = 0;
const ok = (name) => {
  checks++;
  console.log(`  ok  ${name}`);
};

const dest = (slug) => ({ slug, packages: PACKAGES_BY_SLUG[slug].packages });
const SLUG = 'tadoba-andhari';
const [budget, midRange, luxury] = PACKAGES_BY_SLUG[SLUG].packages;
const quote = (opts) => quoteFor({ destination: dest(SLUG), ...opts });

console.log('[pricing] package dataset');
{
  const slugs = Object.keys(PACKAGES_BY_SLUG);
  assert.equal(slugs.length, 17, 'expected 17 destinations from the Content Master');
  ok(`all ${slugs.length} destinations have Budget / Mid-Range / Luxury`);

  let tiers = 0;
  for (const [slug, entry] of Object.entries(PACKAGES_BY_SLUG)) {
    assert.deepEqual(
      entry.packages.map(t => t.label),
      ['Budget', 'Mid-Range', 'Luxury'],
      `${slug} tier labels`
    );
    for (const t of entry.packages) {
      assert.ok(t.min > 0, `${slug} ${t.label} min > 0`);
      assert.ok(t.max >= t.min, `${slug} ${t.label} max >= min`);
      assert.ok(Array.isArray(t.includes) && t.includes.length > 0, `${slug} ${t.label} has inclusions`);
      for (const item of t.includes) {
        assert.ok(
          !/^[-|:*#\s.]+$/.test(item),
          `${slug} ${t.label} includes punctuation-only "${item}" (markdown table divider?)`
        );
      }
      tiers++;
    }
  }
  assert.equal(tiers, 51, 'expected 51 tiers from the Content Master');
  ok(`all ${tiers} tiers have ordered ranges and real inclusions`);
}

console.log('[pricing] quoteFor');
{
  const r = await quote({ packageLabel: 'Luxury', adults: 2, children: 0 });
  assert.equal(r.tier, 'Luxury');
  assert.equal(r.perPerson, luxury.min);
  assert.equal(r.total, luxury.min * 2);
  ok('charges the requested luxury tier, not the budget floor');
}

{
  const r = await quote({ packageLabel: 'Nonsense', adults: 1, children: 0 });
  assert.equal(r.tier, 'Budget');
  assert.equal(r.perPerson, budget.min);
  ok('unknown tier label falls back to Budget');
}

{
  const r = await quote({ adults: 1, children: 0 });
  assert.equal(r.tier, 'Budget');
  ok('omitted tier label defaults to Budget');
}

{
  const r = await quote({ packageLabel: 'Mid-Range', adults: 2, children: 2 });
  assert.equal(r.total, midRange.min * 2 + Math.round(midRange.min * 0.5) * 2);
  ok('children are charged half the per-person rate');
}

{
  const r = await quote({ packageLabel: 'Budget', adults: 0, children: 0 });
  assert.equal(r.adults, 1, 'adults coerced to at least 1');
  assert.equal(r.total, budget.min);
  ok('zero guests cannot produce a free booking');
}

{
  const r = await quote({ packageLabel: 'Budget', adults: '3', children: '1' });
  assert.equal(r.adults, 3);
  assert.equal(r.total, budget.min * 3 + Math.round(budget.min * 0.5));
  ok('string guests from JSON are coerced to numbers');
}

console.log('[pricing] rejections');
{
  await quoteFor({ destination: null, adults: 1 }).then(
    () => { throw new Error('expected a rejection for a missing destination'); },
    (err) => {
      assert.equal(err.status, 400);
      ok('rejects a missing destination with 400');
    }
  );
}

{
  await quoteFor({ destination: { slug: 'unpriced', packages: [] }, adults: 1 }).then(
    () => { throw new Error('expected a rejection for an unpriced destination'); },
    (err) => {
      assert.equal(err.status, 409);
      assert.match(err.message, /on request|confirm the quote/i);
      ok('rejects a destination with no published packages with 409');
    }
  );
}

console.log(`\n[pricing] ${checks} checks passed`);
