import { Booking } from '../models/Booking.js';

export const createBooking = async (req, res, next) => {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `SNS-${new Date().getFullYear()}-${randomSuffix}`;

    const bookingData = {
      ...req.body,
      bookingRef,
      user: req.user ? req.user._id : undefined,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    };

    const booking = await Booking.create(bookingData);
    res.status(201).json({
      success: true,
      message: 'Safari booking confirmed successfully.',
      booking
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

    // Ensure authorized user
    if (req.user.role === 'customer' && 
        booking.user && booking.user.toString() !== req.user._id.toString() &&
        booking.customerInfo.email.toLowerCase() !== req.user.email.toLowerCase()) {
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
      query.$or = [
        { bookingRef: { $regex: search, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { destinationName: { $regex: search, $options: 'i' } }
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
