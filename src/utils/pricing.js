import { Destination } from '../models/Destination.js';

// Flat upgrade over the guide bundled in every package: one naturalist per booking.
export const NATURALIST_FEE = 1000;

/**
 * Server-side price authority.
 *
 * The client may pick a package tier but never a price: totals are always derived
 * from the destination's seeded package tiers (whole packages only — park permit,
 * vehicle, guide and forest dues are bundled in). Guests multiply the per-person tier.
 */
export async function quoteFor({ destination, packageLabel, adults, children, naturalistRequested }) {
  if (!destination) {
    throw Object.assign(new Error('Destination is required to price a booking.'), { status: 400 });
  }

  const tiers = destination.packages ?? [];
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
  const naturalistFee = naturalistRequested ? NATURALIST_FEE : 0;
  const total = perPerson * adultCount + Math.round(perPerson * 0.5) * childCount + naturalistFee;

  return {
    tier: tier.label,
    perPerson,
    adults: adultCount,
    children: childCount,
    naturalistFee,
    total,
  };
}

/** Resolve a destination by id (preferred) or slug. */
export async function findDestinationForBooking({ destination, destinationSlug }) {
  const query = destination ? { _id: destination } : { slug: destinationSlug };
  if (!query._id && !query.slug) return null;
  return Destination.findOne(query);
}
