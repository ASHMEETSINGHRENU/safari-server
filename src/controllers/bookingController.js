import { randomInt } from 'node:crypto';
import { Booking } from '../models/Booking.js';
import { quoteFor, findDestinationForBooking } from '../utils/pricing.js';
import { ownsBooking, isStaff } from '../utils/ownership.js';
import { regexEscape } from '../utils/search.js';

// Read aloud over the phone, so the shape stays SNS-2026-1234. That is only 10k refs
// per year, which the unique index enforces by throwing: retry rather than 500.
const newBookingRef = () => `SNS-${new Date().getFullYear()}-${randomInt(1000, 10000)}`;
const REF_ATTEMPTS = 5;

export const createBooking = async (req, res, next) => {
  try {
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
      user: req.user ? req.user._id : undefined,
      destination: dest?._id,
      destinationName: dest?.name ?? req.body.destinationName,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: quote.total,
      packageLabel: quote.tier,
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

    res.status(201).json({
      success: true,
      message: 'Safari booking confirmed successfully.',
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
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();
    res.json({ success: true, message: 'Booking status updated.', booking });
  } catch (error) {
    next(error);
  }
};
