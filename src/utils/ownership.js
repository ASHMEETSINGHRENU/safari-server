/**
 * Who may act on a booking.
 *
 * A booking is a guest booking when no token was supplied at checkout, so `user` is
 * empty and the only link is the email on customerInfo. Both links must count, and
 * the absence of one must never mean "allowed": a guard written as
 * `booking.user && booking.user != user` short-circuits to false for guest bookings
 * and silently authorises everyone. Hence one helper, two call sites.
 */

// Allowlist, not `role !== 'customer'`: an unrecognised role must fail closed.
const STAFF_ROLES = ['super_admin', 'admin', 'booking_manager', 'content_manager'];

export const isStaff = (user) => !!user && STAFF_ROLES.includes(user.role);

export const ownsBooking = (booking, user) => {
  if (!booking || !user) return false;
  if (booking.user && booking.user.toString() === user._id.toString()) return true;
  const bookingEmail = (booking.customerInfo?.email || '').toLowerCase();
  const userEmail = (user.email || '').toLowerCase();
  return !!bookingEmail && bookingEmail === userEmail;
};