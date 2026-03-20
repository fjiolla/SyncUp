import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import podRoutes from './routes/podRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import passport from './config/passport.js';
import Pod from './models/Pod.js';
import MessageRequest from './models/MessageRequest.js';
import User from './models/User.js';
import { isPodMember } from './utils/podUtils.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again later' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/resend', authLimiter);

// Set up HTTP Server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const isValidObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers?.authorization?.startsWith('Bearer ')
      ? socket.handshake.headers.authorization.split(' ')[1]
      : null;
    const token = authToken || headerToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId?.toString();

    if (!socket.userId || !isValidObjectId(socket.userId)) {
      return next(new Error('Invalid authentication payload'));
    }

    const userExists = await User.exists({ _id: socket.userId });
    if (!userExists) {
      return next(new Error('Authentication failed'));
    }

    return next();
  } catch (error) {
    return next(new Error('Authentication failed'));
  }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Connected client: ${socket.id} (user: ${socket.userId})`);

  // Unified Chat Room Joiner (DMs or Pods)
  socket.on('join_chat_room', async (roomName) => {
    try {
      if (!socket.userId) {
        socket.emit('chat_error', { message: 'Unauthorized' });
        return;
      }

      if (typeof roomName !== 'string' || roomName.length === 0) {
        socket.emit('chat_error', { message: 'Invalid room name' });
        return;
      }

      if (roomName.startsWith('pod_')) {
        const podId = roomName.replace('pod_', '');
        if (!isValidObjectId(podId)) {
          socket.emit('chat_error', { message: 'Invalid pod room' });
          return;
        }

        const pod = await Pod.findById(podId).select('organizer members');
        if (!pod) {
          socket.emit('chat_error', { message: 'Pod not found' });
          return;
        }

        const isMember = isPodMember(pod, socket.userId);

        if (!isMember) {
          socket.emit('chat_error', { message: 'Not authorized for this pod chat' });
          return;
        }

        socket.join(roomName);
        console.log(`User ${socket.userId} joined pod chat room: ${roomName}`);
        return;
      }

      if (roomName.startsWith('dm_')) {
        const [_, userA, userB] = roomName.split('_');

        if (!isValidObjectId(userA) || !isValidObjectId(userB)) {
          socket.emit('chat_error', { message: 'Invalid DM room' });
          return;
        }

        if (socket.userId !== userA && socket.userId !== userB) {
          socket.emit('chat_error', { message: 'Not authorized for this DM room' });
          return;
        }

        const otherUserId = socket.userId === userA ? userB : userA;
        const acceptedConnection = await MessageRequest.findOne({
          $or: [
            { requester: socket.userId, recipient: otherUserId, status: 'accepted' },
            { requester: otherUserId, recipient: socket.userId, status: 'accepted' },
          ],
        }).select('_id');

        if (!acceptedConnection) {
          socket.emit('chat_error', { message: 'No accepted connection for this DM' });
          return;
        }

        socket.join(roomName);
        console.log(`User ${socket.userId} joined DM room: ${roomName}`);
        return;
      }

      socket.emit('chat_error', { message: 'Unsupported room type' });
    } catch (error) {
      socket.emit('chat_error', { message: 'Failed to join room' });
    }
  });

  socket.on('leave_chat_room', (roomName) => {
    if (typeof roomName === 'string' && roomName.length > 0) {
      socket.leave(roomName);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected client: ${socket.id}`);
  });
});

// Pass io to routes via req.app.get('io')
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pods', podRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('SyncUp API is running...');
});

// 404 and Global Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});