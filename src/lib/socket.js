import { io } from 'socket.io-client';
import { env } from '../config/env';

// Initialize single global socket connection
export const socket = io(env.socketUrl, { autoConnect: false });
