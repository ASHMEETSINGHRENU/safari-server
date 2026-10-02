import mongoose from 'mongoose';
import app from './src/app.js';

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

  server.close();
  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
});
