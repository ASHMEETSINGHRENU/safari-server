import mongoose from 'mongoose';
import app from './src/app.js';
import { ownsBooking, isStaff } from './src/utils/ownership.js';
import { regexEscape } from './src/utils/search.js';

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
  expect('staff recognised', isStaff({ role: 'super_admin' }), true);
  expect('customer is not staff', isStaff(attacker), false);
  expect('unknown role is not staff', isStaff({ role: 'wizard' }), false);

  // Search terms reach Mongo as $regex. Unescaped, "(a+)+$" is a catastrophic
  // backtracker and an unbalanced "[" throws, so the term must be literal.
  expect('regex escapes metacharacters', regexEscape('a+b(c)'), 'a\\+b\\(c\\)');
  expect('regex escapes a ReDoS payload', regexEscape('(a+)+$'), '\\(a\\+\\)\\+\\$');
  expect('regex escapes an unbalanced bracket', regexEscape('tadoba['), 'tadoba\\[');
  expect('regex leaves plain text alone', regexEscape('Tadoba'), 'Tadoba');

  server.close();
  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
});
