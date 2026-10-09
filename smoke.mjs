import mongoose from 'mongoose';
import app from './src/app.js';
import { ownsBooking, isStaff } from './src/utils/ownership.js';
import { regexEscape } from './src/utils/search.js';
import { matchesBookingContact } from './src/utils/contact.js';
import { roleChangeError } from './src/utils/teamAccess.js';

// No DB in this smoke test; fail queries fast instead of buffering for 10s each.
mongoose.set('bufferTimeoutMS', 100);

let failures = 0;
const expect = (label, actual, want) => {
  const ok = actual === want;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label} -> ${actual} (want ${want})`);
};

const server = app.listen(5099, async () => {
  const call = async (path, opts) => {
    const r = await fetch(`http://127.0.0.1:5099${path}`, opts);
    return { status: r.status, body: await r.text() };
  };
  const check = async (label, path, opts) => {
    try {
      const r = await call(path, opts);
      console.log(`     ${label} -> ${r.status} ${r.body.slice(0, 90)}`);
      return r;
    } catch (e) {
      failures++;
      console.log(`FAIL ${label} -> ERROR ${e.message}`);
    }
  };

  const health = await check('health', '/api/health');
  expect('health 200', health.status, 200);

  const evil = await check('bookingRef_evilOrigin', '/api/v1/bookings/ref/SNS-2026-0001', {
    headers: { Origin: 'https://evil.example' }
  });
  expect('evil origin 403', evil.status, 403);
  expect('evil origin leaks no stack', JSON.parse(evil.body).stack, null);
  expect('evil origin leaks no origin echo', /evil\.example/.test(evil.body), false);

  // Booking refs are customer data: no auth must mean no data.
  const unauth = await check('bookingRef_goodOrigin', '/api/v1/bookings/ref/SNS-2026-0001', {
    headers: { Origin: 'http://localhost:5174' }
  });
  expect('bookingRef requires auth', unauth.status, 401);

  const evilLogin = await check('login_evilOrigin', '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
    body: JSON.stringify({ email: 'a@b.co', password: 'x' })
  });
  expect('evil origin blocked on login too', evilLogin.status, 403);

  // Rate limiter: hammer login 25x and confirm it starts rejecting.
  let limited = 0;
  for (let i = 0; i < 25; i++) {
    const r = await fetch('http://127.0.0.1:5099/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5174' },
      body: JSON.stringify({ email: 'a@b.co', password: 'x' })
    });
    if (r.status === 429) limited++;
  }
  expect('ratelimit blocks 5/25', limited, 5);

  const h = await fetch('http://127.0.0.1:5099/api/health');
  expect('helmet x-content-type-options', h.headers.get('x-content-type-options'), 'nosniff');
  expect('helmet x-dns-prefetch-control', h.headers.get('x-dns-prefetch-control'), 'off');
  expect('helmet hides x-powered-by', h.headers.get('x-powered-by'), null);

  // Booking ownership (src/utils/ownership.js). Pure, so no DB needed. The guest case
  // is the regression guard: a guard written as `booking.user && booking.user != user`
  // short-circuits to false for guest bookings and lets anyone cancel them.
  const attacker = { _id: 'u_attacker', role: 'customer', email: 'attacker@evil.com' };
  const guestBooking = { user: undefined, customerInfo: { email: 'victim@real.com' } };
  const ownById = { user: 'u_attacker', customerInfo: { email: 'someone@else.com' } };
  const ownByEmail = { user: undefined, customerInfo: { email: 'ATTACKER@evil.com' } };
  const foreign = { user: 'u_victim', customerInfo: { email: 'victim@real.com' } };
  const noEmail = { user: 'u_victim', customerInfo: {} };

  expect('blocks a guest booking owned by someone else', ownsBooking(guestBooking, attacker), false);
  expect('owns own booking by id', ownsBooking(ownById, attacker), true);
  expect('owns own booking by email, case-insensitive', ownsBooking(ownByEmail, attacker), true);
  expect('blocks a stranger booking', ownsBooking(foreign, attacker), false);
  expect('blocks a booking with no email', ownsBooking(noEmail, attacker), false);
  expect('booking staff recognised', isStaff({ role: 'super_admin' }), true);
  expect('booking_manager is booking staff', isStaff({ role: 'booking_manager' }), true);
  expect('content_manager has no booking authority', isStaff({ role: 'content_manager' }), false);
  expect('customer is not staff', isStaff(attacker), false);
  expect('unknown role is not staff', isStaff({ role: 'wizard' }), false);

  // Access management is team-only: travelers have no console access to change.
  expect('blocks a role change on a traveler', roleChangeError('customer', 'booking_manager')?.status, 403);
  expect('rejects a customer target role', roleChangeError('booking_manager', 'customer')?.status, 400);
  expect('rejects a bogus role', roleChangeError('booking_manager', 'wizard')?.status, 400);
  expect('rejects the retired admin role', roleChangeError('booking_manager', 'admin')?.status, 400);
  expect('allows a staff role change', roleChangeError('booking_manager', 'content_manager'), null);

  // Search terms reach Mongo as $regex. Unescaped, "(a+)+$" is a catastrophic
  // backtracker and an unbalanced "[" throws, so the term must be literal.
  expect('regex escapes metacharacters', regexEscape('a+b(c)'), 'a\\+b\\(c\\)');
  expect('regex escapes a ReDoS payload', regexEscape('(a+)+$'), '\\(a\\+\\)\\+\\$');
  expect('regex escapes an unbalanced bracket', regexEscape('tadoba['), 'tadoba\\[');
  expect('regex leaves plain text alone', regexEscape('Tadoba'), 'Tadoba');

  // Guest lookup: the ref alone must not unlock a booking, the email/phone must match.
  const bookingRow = { customerInfo: { email: 'Victim@Real.com', phone: '+91 98765 43210' } };
  expect('tracks with matching email, case-insensitive', matchesBookingContact(bookingRow, { email: 'victim@real.com' }), true);
  expect('tracks with matching phone, format-insensitive', matchesBookingContact(bookingRow, { phone: '919876543210' }), true);
  expect('rejects a wrong email', matchesBookingContact(bookingRow, { email: 'attacker@evil.com' }), false);
  expect('rejects a too-short phone', matchesBookingContact(bookingRow, { phone: '1234' }), false);
  expect('rejects empty contact', matchesBookingContact(bookingRow, {}), false);
  expect('rejects a booking with no email', matchesBookingContact({ customerInfo: {} }, { email: 'a@b.co' }), false);

  // Reaching track without a contact is rejected before any DB access.
  const trackNoContact = await check('track_noContact', '/api/v1/bookings/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5174' },
    body: JSON.stringify({ ref: 'SNS-2026-0001' })
  });
  expect('track requires a contact', trackNoContact.status, 400);

  server.close();
  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
});
