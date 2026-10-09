// Pure contact-matching for guest booking lookup. Kept dependency-free so it can be
// exercised without a database, the same way ownership.js is.
export const phoneDigits = (v = '') => String(v).replace(/\D/g, '');

// A booking ref is guessable; the email or phone on the booking is the shared secret.
// Both sides are normalised (email lowercased, phone digit-only) before comparing.
export const matchesBookingContact = (booking, { email, phone } = {}) => {
  const wantEmail = String(email || '').trim().toLowerCase();
  const wantPhone = phoneDigits(phone);
  const bookingEmail = String(booking?.customerInfo?.email || '').trim().toLowerCase();
  const bookingPhone = phoneDigits(booking?.customerInfo?.phone);

  const emailMatch = wantEmail.length > 0 && wantEmail === bookingEmail;
  const phoneMatch = wantPhone.length >= 8 && wantPhone === bookingPhone;
  return emailMatch || phoneMatch;
};
