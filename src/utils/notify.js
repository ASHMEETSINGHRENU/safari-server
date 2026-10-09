// Best-effort transactional mail. Uses Resend's HTTP API over Node's global fetch,
// so there is no SMTP dependency to install or keep alive. With RESEND_API_KEY
// unset this is a no-op: dev, CI and a pre-launch deploy never need mail creds,
// and a mail outage must never fail or slow a booking request.
const RESEND_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || 'Shutter and Stripes <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
const SITE_URL = process.env.CLIENT_URL || 'https://safari-client-topaz.vercel.app';

// Booking fields are user-supplied and land in HTML email, so escape them.
const esc = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const row = (k, v) => `<tr><td style="padding:3px 10px;color:#6b7280">${k}</td><td style="padding:3px 10px;font-weight:600">${esc(v)}</td></tr>`;

const bookingRows = (b) =>
  row('Reference', b.bookingRef) +
  row('Reserve', b.destinationName) +
  row('Safari', b.safariName) +
  row('Date', b.safariDate) +
  row('Guests', `${b.guests?.adults ?? 1} adult(s)${b.guests?.children ? `, ${b.guests.children} child(ren)` : ''}`) +
  row('Total', `INR ${Number(b.totalAmount || 0).toLocaleString('en-IN')}`);

export const sendMail = async ({ to, subject, html }) => {
  if (!RESEND_KEY || !to) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, to, subject, html })
    });
    if (!res.ok) console.error('[notify] Resend rejected:', res.status, await res.text());
  } catch (error) {
    console.error('[notify] send failed:', error.message);
  }
};

const wrap = (heading, bodyHtml) =>
  `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2E3A23">
     <h2 style="color:#2E3A23">${heading}</h2>
     ${bodyHtml}
     <p style="font-size:12px;color:#6b7280">Shutter and Stripes — Central Indian Wild.
     <a href="${SITE_URL}" style="color:#D4A35B">Visit the site</a></p>
   </div>`;

export const notifyBookingReceived = async (booking) => {
  const body = `<p>We received your safari request and our team will confirm availability within 24 hours. Nothing has been charged yet.</p>
    <table>${bookingRows(booking)}</table>
    <p>You can follow the request anytime at <a href="${SITE_URL}/track?ref=${encodeURIComponent(booking.bookingRef)}">${SITE_URL}/track</a>.</p>`;
  await Promise.all(
    [
      sendMail({ to: booking.customerInfo?.email, subject: `Safari request received — ${booking.bookingRef}`, html: wrap('Your safari request is under review', body) }),
      ADMIN_EMAIL ? sendMail({ to: ADMIN_EMAIL, subject: `New booking ${booking.bookingRef}`, html: wrap('New booking request', `<table>${bookingRows(booking)}</table><p>${esc(booking.customerInfo?.fullName)} · ${esc(booking.customerInfo?.phone)}</p>`) }) : null
    ].filter(Boolean)
  );
};

const STATUS_COPY = {
  confirmed: ['Your safari is confirmed', 'Your booking has been confirmed by our team. We will share the permit details shortly.'],
  alternative_suggested: ['An alternative is available', 'Your requested date/reserve was unavailable. We have suggested an alternative — open your trip to review it.'],
  cancelled: ['Your booking was cancelled', 'Your safari booking has been cancelled. Our team will follow up on any deductions.'],
  completed: ['Thank you for travelling with us', 'We hope you had an unforgettable safari. Safe travels home.']
};

export const notifyBookingStatus = async (booking, status) => {
  const copy = STATUS_COPY[status];
  if (!copy || !booking.customerInfo?.email) return;
  const body = `<p>${copy[1]}</p><table>${bookingRows(booking)}</table>`;
  await sendMail({
    to: booking.customerInfo.email,
    subject: `${copy[0]} — ${booking.bookingRef}`,
    html: wrap(copy[0], body)
  });
};
