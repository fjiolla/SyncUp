import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import MessageRequest from '../models/MessageRequest.js';
import Pod from '../models/Pod.js';
import User from '../models/User.js';
import { isPodMember } from '../utils/podUtils.js';

const isValidObjectId = (value) => value && /^[a-fA-F0-9]{24}$/.test(String(value));

// Normalized participant pair for symmetric uniqueness
const getParticipantPair = (id1, id2) => {
  const a = id1.toString();
  const b = id2.toString();
  return a <= b ? [new mongoose.Types.ObjectId(a), new mongoose.Types.ObjectId(b)] : [new mongoose.Types.ObjectId(b), new mongoose.Types.ObjectId(a)];
};

// @desc    Send a message request
// @route   POST /api/messages/requests/send
// @access  Private
const sendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId || req.user._id.toString() === recipientId) {
    res.status(400);
    throw new Error('Invalid recipient');
  }

  const recipientExists = await User.exists({ _id: recipientId });
  if (!recipientExists) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  const participants = getParticipantPair(req.user._id, recipientId);

  // Check if request exists (symmetric; includes legacy docs without participants)
  const existing = await MessageRequest.findOne({
    $or: [
      { participants },
      { requester: req.user._id, recipient: recipientId },
      { requester: recipientId, recipient: req.user._id },
    ],
  });
  if (existing) {
    res.status(400);
    throw new Error(`Request already ${existing.status}`);
  }

  try {
    const request = await MessageRequest.create({
      requester: req.user._id,
      recipient: recipientId,
      participants,
    });
    res.status(201).json(request);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400);
      throw new Error('Request already exists');
    }
    throw err;
  }
});

// @desc    Respond to a message request
// @route   PUT /api/messages/requests/respond/:id
// @access  Private
const respondRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const request = await MessageRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to respond to this request');
  }

  request.status = status;
  await request.save();

  res.json(request);
});

// @desc    Get pending incoming requests
// @route   GET /api/messages/requests
// @access  Private
const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await MessageRequest.find({
    recipient: req.user._id,
    status: 'pending'
  }).populate('requester', 'name profilePicture isVerified');

  res.json(requests);
});

// @desc    Get connection status with a specific user
// @route   GET /api/messages/status/:userId
// @access  Private
const getConnectionStatus = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  if (!targetUserId) {
    res.status(400);
    throw new Error('userId required');
  }
  if (targetUserId === req.user._id.toString()) {
    return res.json({ status: 'self' });
  }

  const request = await MessageRequest.findOne({
    $or: [
      { requester: req.user._id, recipient: targetUserId },
      { requester: targetUserId, recipient: req.user._id },
    ],
  }).select('status');

  if (!request) return res.json({ status: 'none' });
  res.json({ status: request.status });
});

// @desc    Get accepted DM connections (friends)
// @route   GET /api/messages/connections
// @access  Private
const getConnections = asyncHandler(async (req, res) => {
  const connections = await MessageRequest.find({
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    status: 'accepted'
  }).populate('requester', 'name profilePicture isVerified').populate('recipient', 'name profilePicture isVerified');
  
  // Format the list uniquely (skip if requester/recipient failed to populate, e.g. deleted user)
  const friends = connections
    .filter((conn) => conn.requester && conn.recipient)
    .map((conn) => (conn.requester._id.toString() === req.user._id.toString() ? conn.recipient : conn.requester));

  res.json(friends);
});

// @desc    Get DM History
// @route   GET /api/messages/dm/:userId
// @access  Private
const getDMHistory = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;

  // Check if they are connected
  const isConnected = await MessageRequest.findOne({
    $or: [
      { requester: req.user._id, recipient: targetUserId, status: 'accepted' },
      { requester: targetUserId, recipient: req.user._id, status: 'accepted' }
    ]
  });

  if (!isConnected) {
    res.status(403);
    throw new Error('You must have an accepted message request to view DMs');
  }

  const messages = await Message.find({
    $and: [
      { $or: [{ podId: { $exists: false } }, { podId: null }] },
      { $or: [
        { sender: req.user._id, recipient: targetUserId },
        { sender: targetUserId, recipient: req.user._id }
      ]}
    ]
  }).sort({ createdAt: 1 }).populate('sender', 'name profilePicture');

  res.json(messages);
});

// @desc    Get Pod Chat History
// @route   GET /api/messages/pod/:podId
// @access  Private
const getPodHistory = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.podId);
  if (!pod) {
    res.status(404);
    throw new Error('Pod not found');
  }

  const isMember = isPodMember(pod, req.user._id);
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view this pod chat');
  }

  const messages = await Message.find({ podId: req.params.podId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profilePicture');

  res.json(messages);
});

// @desc    Send a unified polymorphic message 
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, recipientId, podId } = req.body;
  
  if (!content) {
    res.status(400);
    throw new Error('Message content is required');
  }

  if (podId && !isValidObjectId(podId)) {
    res.status(400);
    throw new Error('Invalid podId');
  }
  if (recipientId && !isValidObjectId(recipientId)) {
    res.status(400);
    throw new Error('Invalid recipientId');
  }

  // Basic sanitization: strip script tags and null bytes
  const sanitizedContent = String(content)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\0/g, '')
    .trim();
  if (!sanitizedContent) {
    res.status(400);
    throw new Error('Message content is required');
  }

  let messageOptions = {
    sender: req.user._id,
    content: sanitizedContent
  };

  let roomName = '';

  if (podId) {
    const pod = await Pod.findById(podId);
    if (!pod) throw new Error('Pod not found');
    const isMember = isPodMember(pod, req.user._id);
    if (!isMember) {
      res.status(403);
      throw new Error('Must be a member of the pod to send messages');
    }
    
    messageOptions.podId = podId;
    roomName = `pod_${podId}`;
  } else if (recipientId) {
    const isConnected = await MessageRequest.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId, status: 'accepted' },
        { requester: recipientId, recipient: req.user._id, status: 'accepted' }
      ]
    });
    
    if (!isConnected) {
      res.status(403);
      throw new Error('Cannot send DM without an accepted message request');
    }
    
    messageOptions.recipient = recipientId;
    const sortedIds = [req.user._id.toString(), recipientId].sort();
    roomName = `dm_${sortedIds[0]}_${sortedIds[1]}`;
  } else {
    res.status(400);
    throw new Error('Must specify either a podId or a recipientId');
  }

  let message = await Message.create(messageOptions);
  // Note: recipient is intentionally NOT populated — it is returned as a raw ObjectId string.
  // Frontend messageBelongsToActiveChat relies on this for string comparison.
  message = await message.populate('sender', 'name profilePicture');

  // Safely emit to live socket instance
  const io = req.app.get('io');
  if (io) {
    io.to(roomName).emit('new_message', message);
  }

  res.status(201).json(message);
});

export {
  sendRequest,
  respondRequest,
  getIncomingRequests,
  getConnectionStatus,
  getConnections,
  getDMHistory,
  getPodHistory,
  sendMessage
};
