import { Destination } from '../models/Destination.js';

/**
 * Server-side price authority.
 *
 * The client may pick a package tier but never a price: totals are always derived
 * from the destination's seeded package tiers (whole packages only — park permit,
 * vehicle, guide and forest dues are bundled in). Guests multiply the per-person tier.
 */
export async function quoteFor({ destination, packageLabel, adults, children }) {
  if (!destination) {
    throw Object.assign(new Error('Destination is required to price a booking.'), { status: 400 });
  }

  // A tier priced 0 is not offered for this reserve — never quote it.
  const tiers = (destination.packages ?? []).filter((t) => t.min > 0);
  if (tiers.length === 0) {
    throw Object.assign(
      new Error('This destination has no published package pricing yet. Our team will confirm the quote.'),
      { status: 409 }
    );
  }

  const tier =
    tiers.find((t) => t.label === packageLabel) ?? tiers[0];

  const adultCount = Number(adults) > 0 ? Number(adults) : 1;
  const childCount = Number(children) > 0 ? Number(children) : 0;
  // Children travel on the same all-inclusive package at half the per-person rate.
  const perPerson = tier.min;
  const total = perPerson * adultCount + Math.round(perPerson * 0.5) * childCount;

  return {
    tier: tier.label,
    perPerson,
    adults: adultCount,
    children: childCount,
    total,
  };
}

/** Resolve a destination by id (preferred) or slug. */
export async function findDestinationForBooking({ destination, destinationSlug }) {
  const query = destination ? { _id: destination } : { slug: destinationSlug };
  if (!query._id && !query.slug) return null;
  return Destination.findOne(query);
}

// A reserve's standard trip length, e.g. "3 Days / 2 Nights" -> { days: 3, nights: 2 }.
// Add-on copy ("...Includes 3 Open Gypsy Safaris") is ignored; an unparseable or missing
// string falls back to the house-standard 3 Days / 2 Nights.
const DURATION_RE = /(\d+)\s*Days?\s*\/\s*(\d+)\s*Nights?/i;
export function tripDuration(packageDuration) {
  const m = DURATION_RE.exec(String(packageDuration ?? ''));
  return m ? { days: Number(m[1]), nights: Number(m[2]) } : { days: 3, nights: 2 };
}

/** Inclusive last day of the trip as YYYY-MM-DD, or null for an unparseable start date. */
export function endDateFor(safariDate, packageDuration) {
  const start = new Date(`${String(safariDate ?? '')}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setDate(start.getDate() + tripDuration(packageDuration).days - 1);
  const y = start.getFullYear();
  const mo = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}
