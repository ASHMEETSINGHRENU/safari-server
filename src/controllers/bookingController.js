import { randomInt } from 'node:crypto';
import { Booking } from '../models/Booking.js';
import { quoteFor, findDestinationForBooking, endDateFor } from '../utils/pricing.js';
import { ownsBooking, isStaff } from '../utils/ownership.js';
import { regexEscape } from '../utils/search.js';
import { notifyBookingReceived, notifyBookingStatus } from '../utils/notify.js';
import { phoneDigits, matchesBookingContact } from '../utils/contact.js';

// Trust-boundary validation. The client validates for UX; the server must not
// trust it for anything that reaches the database or gets mailed back.
const LEAD_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateBookingInput = (body = {}) => {
  const c = body.customerInfo || {};
  if (!body.destination) return 'A reserve must be selected.';
  if (!String(body.safariDate || '').trim()) return 'A safari date is required.';
  if (String(c.fullName || '').trim().length < 3) return 'Lead traveler full name is required.';
  if (!LEAD_EMAIL.test(String(c.email || '').trim())) return 'A valid email address is required.';
  if (phoneDigits(c.phone).length < 8) return 'A valid phone number is required.';
  if (String(c.idNumber || '').trim().length < 4) return 'Lead traveler ID number is required for forest permits.';
  return null;
};

// Read aloud over the phone, so the shape stays SNS-2026-1234. That is only 10k refs
// per year, which the unique index enforces by throwing: retry rather than 500.
const newBookingRef = () => `SNS-${new Date().getFullYear()}-${randomInt(1000, 10000)}`;
const REF_ATTEMPTS = 5;

export const createBooking = async (req, res, next) => {
  try {
    const invalid = validateBookingInput(req.body);
    if (invalid) return res.status(400).json({ success: false, message: invalid });

    const dest = await findDestinationForBooking({
      destination: req.body.destination,
      destinationSlug: req.body.destinationSlug,
    });

    const quote = await quoteFor({
      destination: dest,
      packageLabel: req.body.packageLabel,
      adults: req.body.guests?.adults,
      children: req.body.guests?.children,
    });

    const bookingData = {
      ...req.body,
      user: req.user?._id,
      destination: dest?._id,
      destinationName: dest?.name ?? req.body.destinationName,
      bookingStatus: 'under_review',
      paymentStatus: 'pending',
      totalAmount: quote.total,
      packageLabel: quote.tier,
      // Authoritative trip span from the reserve's duration, never the client's copy.
      endDate: endDateFor(req.body.safariDate, dest?.packageDuration),
    };

    let booking;
    for (let attempt = 1; ; attempt++) {
      try {
        booking = await Booking.create({ ...bookingData, bookingRef: newBookingRef() });
        break;
      } catch (error) {
        if (error?.code !== 11000 || attempt >= REF_ATTEMPTS) throw error;
      }
    }

    // Fire-and-forget: mail must never delay or fail the booking response.
    notifyBookingReceived(booking).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Booking request received. Our team will review availability and call you back.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { user: req.user._id },
        { 'customerInfo.email': req.user.email.toLowerCase() }
      ]
    };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingByRef = async (req, res, next) => {
  try {
    const { ref } = req.params;
    const booking = await Booking.findOne({ bookingRef: ref.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking permit reference not found.' });
    }
    // A booking ref is guessable (year + 4 digits) and the document holds Aadhaar /
    // passport numbers, so never hand it to an unauthenticated caller. Admins see the
    // full record via getAllBookings; everyone else must own the booking.
    if (!isStaff(req.user) && !ownsBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking.' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

// Same guard as getBookingByRef: staff may act on any booking, everyone else only
    // on their own. A guest booking has no `user`, so ownership falls back to email.
    if (!isStaff(req.user) && !ownsBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking.' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled.', booking });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let query = {};
    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
if (search) {
      const term = regexEscape(search);
      query.$or = [
        { bookingRef: { $regex: term, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: term, $options: 'i' } },
        { 'customerInfo.email': { $regex: term, $options: 'i' } },
        { destinationName: { $regex: term, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, suggestion } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    // Lead rep sends a counter-offer (or clears it) alongside the status change.
    if (suggestion !== undefined) booking.suggestion = suggestion || undefined;

    await booking.save();
    if (bookingStatus) notifyBookingStatus(booking, bookingStatus).catch(() => {});
    res.json({ success: true, message: 'Booking status updated.', booking });
  } catch (error) {
    next(error);
  }
};

// Guest lookup. A booking ref is guessable (year + 4 digits), so the caller must
// also prove the email or phone on the booking. Both "not found" and "wrong
// contact" return the same 404 so the endpoint cannot confirm a ref exists.
export const trackBooking = async (req, res, next) => {
  try {
    const ref = String(req.body?.ref || '').trim().toUpperCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = phoneDigits(req.body?.phone);
    const miss = () => res.status(404).json({ success: false, message: 'No booking matches that reference and contact.' });

    if (!ref || (!email && phone.length < 8)) {
      return res.status(400).json({ success: false, message: 'Provide the booking reference and the email or phone used to book.' });
    }

    const booking = await Booking.findOne({ bookingRef: ref });
    if (!booking || !matchesBookingContact(booking, { email, phone })) return miss();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
