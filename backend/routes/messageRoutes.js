import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendRequest,
  respondRequest,
  getIncomingRequests,
  getConnections,
  getDMHistory,
  getPodHistory,
  sendMessage
} from '../controllers/messageController.js';

const router = express.Router();

// 1-on-1 handshakes
router.post('/requests/send', protect, sendRequest);
router.put('/requests/respond/:id', protect, respondRequest);
router.get('/requests', protect, getIncomingRequests);
router.get('/connections', protect, getConnections);

// History Fetches
router.get('/dm/:userId', protect, getDMHistory);
router.get('/pod/:podId', protect, getPodHistory);

// Unified sender
router.post('/', protect, sendMessage);

export default router;
