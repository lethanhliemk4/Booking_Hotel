import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import authRoutes from './routes/auth-routes.js';
import roomRoutes from './routes/room-routes.js';
import hotelRoutes from './routes/hotel-routes.js';
import bookingRoutes from './routes/booking-routes.js';
import paymentRoutes from './routes/payment-routes.js';
import reviewRoutes from './routes/review-routes.js';
import messageRoutes from './routes/message-routes.js';
import adminRoutes from './routes/admin-routes.js';

const app = express();

// Essential middleware must come first
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// CSRF protection setup
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: false } }); // secure: false for local dev

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', csrfProtection, adminRoutes);

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  try {
    const token = req.csrfToken();
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF Token Error:', error);
    res.status(500).json({ message: 'Failed to generate CSRF token', error: error.message });
  }
});

export default app;