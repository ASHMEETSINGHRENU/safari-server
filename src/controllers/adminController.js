import { Booking } from '../models/Booking.js';
import { Destination } from '../models/Destination.js';
import { Safari } from '../models/Safari.js';
import { User } from '../models/User.js';
import { Inquiry } from '../models/Inquiry.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
    const totalDestinations = await Destination.countDocuments();
    const totalSafaris = await Safari.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalInquiries = await Inquiry.countDocuments({ status: 'new' });

    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['confirmed', 'completed', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(6);
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);

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
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
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

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    res.json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    next(error);
  }
};
