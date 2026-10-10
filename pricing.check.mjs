// Self-check for the package pricing authority (src/utils/pricing.js).
// No test framework: plain asserts, run with `npm run check:pricing`.
import assert from 'node:assert/strict';
import { quoteFor, tripDuration, endDateFor } from './src/utils/pricing.js';
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
    assert.ok(
      entry.packages.some(t => t.min > 0),
      `${slug} has at least one priced (non-zero) tier`
    );
    for (const t of entry.packages) {
      assert.ok(t.min >= 0, `${slug} ${t.label} min not negative (0 = not offered)`);
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

  for (const [slug, entry] of Object.entries(PACKAGES_BY_SLUG)) {
    assert.ok(
      /\d+\s*Days?\s*\/\s*\d+\s*Nights?/i.test(entry.duration ?? ''),
      `${slug} has a standard duration string`
    );
  }
  ok(`all ${slugs.length} destinations carry a standard duration`);
}

console.log('[pricing] tripDuration / endDateFor');
{
  assert.deepEqual(tripDuration('3 Days / 2 Nights'), { days: 3, nights: 2 });
  assert.deepEqual(
    tripDuration('3 Days / 2 Nights (Includes 3 Open Gypsy Safaris)'),
    { days: 3, nights: 2 },
    'trailing add-on copy is ignored'
  );
  assert.deepEqual(tripDuration(undefined), { days: 3, nights: 2 }, 'missing duration falls back to 3/2');
  assert.deepEqual(tripDuration('on request'), { days: 3, nights: 2 }, 'unparseable falls back to 3/2');
  ok('parses days/nights and falls back to the house standard');

  assert.equal(endDateFor('2026-11-12', '3 Days / 2 Nights'), '2026-11-14', '3D/2N spans three days inclusive');
  assert.equal(endDateFor('2026-11-12', '2 Days / 1 Night'), '2026-11-13', '2D/1N ends the next day');
  assert.equal(endDateFor('2026-06-28', '4 Days / 3 Nights'), '2026-07-01', 'spans across a month boundary');
  assert.equal(endDateFor('', '3 Days / 2 Nights'), null, 'unparseable start date yields null');
  ok('endDateFor returns the inclusive last day (month-boundary safe)');
  assert.equal(endDateFor('2026-02-27', '3 Days / 2 Nights'), '2026-03-01', 'handles short months');
  ok('endDateFor is calendar-correct across a 28-day February');
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

console.log('[pricing] zero-priced tiers');
{
  const melghat = { slug: 'melghat', packages: PACKAGES_BY_SLUG.melghat.packages };
  const r = await quoteFor({ destination: melghat, adults: 1, children: 0 });
  assert.equal(r.tier, 'Mid-Range');
  assert.equal(r.perPerson, 29500);
  ok('a reserve with no priced Budget drops to its priced Mid-Range tier');
}

{
  const allZero = {
    slug: 'x',
    packages: [
      { label: 'Budget', min: 0, max: 0, openEnded: false, includes: ['room'] },
      { label: 'Mid-Range', min: 0, max: 0, openEnded: false, includes: ['room'] }
    ]
  };
  await quoteFor({ destination: allZero, adults: 1 }).then(
    () => { throw new Error('expected a rejection when no tier is priced'); },
    (err) => {
      assert.equal(err.status, 409);
      ok('a destination whose every tier is zero is treated as on request (409)');
    }
  );
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
