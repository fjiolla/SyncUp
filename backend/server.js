import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
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

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend.com' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Set up HTTP Server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend.com' : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Connected client: ${socket.id}`);

  // Unified Chat Room Joiner (DMs or Pods)
  socket.on('join_chat_room', (roomName) => {
    socket.join(roomName);
    console.log(`User socket joined chat space: ${roomName}`);
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
