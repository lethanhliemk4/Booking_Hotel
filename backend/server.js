import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { connectDB } from './src/config/db.js';
import { messageService } from './src/services/message-service.js';
import authRoutes from './src/routes/auth-routes.js';
import roomRoutes from './src/routes/room-routes.js';
import hotelRoutes from './src/routes/hotel-routes.js';
import bookingRoutes from './src/routes/booking-routes.js';
import paymentRoutes from './src/routes/payment-routes.js';
import reviewRoutes from './src/routes/review-routes.js';
import messageRoutes from './src/routes/message-routes.js';
import adminRoutes from './src/routes/admin-routes.js';

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploads folder statically with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  console.log(`Serving file: ${req.path}`);
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(uploadDir));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to avoid blocking images
}));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const csrfProtection = csurf({ cookie: { httpOnly: true, secure: false } });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', csrfProtection, upload.single('image'), adminRoutes);

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  try {
    console.log('CSRF token requested');
    const token = req.csrfToken();
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF Token Error:', error);
    res.status(500).json({ message: 'Failed to generate CSRF token', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

connectDB();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });

  socket.on('message', async ({ receiverId, message }) => {
    const msg = await messageService.sendMessage({ receiverId, message }, socket.userId);
    io.to(receiverId).emit('message', msg);
    socket.emit('message', msg);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(3001, () => console.log('Server running on port 3001'));