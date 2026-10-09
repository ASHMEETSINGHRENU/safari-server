import bcrypt from 'bcryptjs';
import { Booking } from '../models/Booking.js';
import { Destination } from '../models/Destination.js';
import { Safari } from '../models/Safari.js';
import { User } from '../models/User.js';
import { Inquiry } from '../models/Inquiry.js';
import { STAFF_ROLES, roleChangeError } from '../utils/teamAccess.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    // New leads land as under_review; count them with legacy 'pending'.
    const pendingBookings = await Booking.countDocuments({ bookingStatus: { $in: ['pending', 'under_review'] } });
    const totalDestinations = await Destination.countDocuments();
    const totalSafaris = await Safari.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalInquiries = await Inquiry.countDocuments({ status: 'new' });

    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['confirmed', 'completed', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent bookings/inquiries carry traveler PII, so only booking staff receive them.
    const isBookingStaff = ['super_admin', 'booking_manager'].includes(req.user?.role);
    const recentBookings = isBookingStaff ? await Booking.find().sort({ createdAt: -1 }).limit(6) : [];
    const recentInquiries = isBookingStaff ? await Inquiry.find().sort({ createdAt: -1 }).limit(5) : [];

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalDestinations,
        totalSafaris,
        totalUsers,
        totalInquiries,
        totalRevenue
      },
      recentBookings,
      recentInquiries
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { kind } = req.query;
    const filter =
      kind === 'team' ? { role: { $in: STAFF_ROLES } }
      : kind === 'customer' ? { role: 'customer' }
      : {};
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, country } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
    }
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid team role.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      phone,
      country: country || 'India',
    });

    const { passwordHash: _omit, ...safe } = user.toObject();
    res.status(201).json({ success: true, message: 'Team member added.', user: safe });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (role) {
      const err = roleChangeError(user.role, role);
      if (err) return res.status(err.status).json({ success: false, message: err.message });
      user.role = role;
    }
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    const { passwordHash: _omit, ...safe } = user.toObject();
    res.json({ success: true, message: 'User updated successfully.', user: safe });
  } catch (error) {
    next(error);
  }
};
