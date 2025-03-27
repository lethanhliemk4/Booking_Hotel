import { bookingRepository } from '../repositories/booking-repository.js';
import { roomRepository } from '../repositories/room-repository.js';
import { userRepository } from '../repositories/user-repository.js';
import { sendEmail } from '../config/nodemailer.js';

export const bookingService = {
  createBooking: async ({ roomId, checkInDate, checkOutDate }, userId) => {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    const overlappingBookings = await bookingRepository.findOverlapping(roomId, checkInDate, checkOutDate);
    if (overlappingBookings.length > 0) throw new Error('Room not available');

    const days = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    const totalPrice = days * room.price;

    const booking = await bookingRepository.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    try {
      const user = await userRepository.findById(userId);
      if (user && user.email) {
        await sendEmail(user.email, 'Booking Created', `Your booking (ID: ${booking._id}) is pending confirmation.`);
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Continue even if email fails
    }

    return booking;
  },

  getUserBookings: async (userId) => await bookingRepository.findByUserId(userId),
  
  getAllBookings: async () => await bookingRepository.findAll(), // Added for admin

  getBookingById: async (id, userId) => {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId.toString() !== userId) throw new Error('Unauthorized');
    return booking;
  },

  updateBooking: async (id, data) => {
    const booking = await bookingRepository.update(id, data);
    try {
      const user = await userRepository.findById(booking.userId);
      if (user && user.email) {
        await sendEmail(user.email, 'Booking Updated', `Your booking (ID: ${id}) has been updated to ${data.status}.`);
      }
    } catch (emailError) {
      console.error('Failed to send booking update email:', emailError);
      // Continue even if email fails
    }
    return booking;
  },

  // Add confirmBooking method
  confirmBooking: async (id) => {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'pending') throw new Error('Booking cannot be confirmed as it is not in pending status');

    return await bookingService.updateBooking(id, { status: 'confirmed', updatedAt: Date.now() });
  },
};