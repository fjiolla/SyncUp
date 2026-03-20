import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import MessageRequest from '../models/MessageRequest.js';
import Pod from '../models/Pod.js';

// @desc    Send a message request
// @route   POST /api/messages/requests/send
// @access  Private
const sendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId || req.user._id.toString() === recipientId) {
    res.status(400);
    throw new Error('Invalid recipient');
  }

  // Check if request exists
  const existing = await MessageRequest.findOne({
    $or: [
      { requester: req.user._id, recipient: recipientId },
      { requester: recipientId, recipient: req.user._id }
    ]
  });

  if (existing) {
    res.status(400);
    throw new Error(`Request already ${existing.status}`);
  }

  const request = await MessageRequest.create({
    requester: req.user._id,
    recipient: recipientId
  });

  res.status(201).json(request);
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

// @desc    Get accepted DM connections (friends)
// @route   GET /api/messages/connections
// @access  Private
const getConnections = asyncHandler(async (req, res) => {
  const connections = await MessageRequest.find({
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    status: 'accepted'
  }).populate('requester', 'name profilePicture isVerified').populate('recipient', 'name profilePicture isVerified');
  
  // Format the list uniquely 
  const friends = connections.map(conn => {
    return conn.requester._id.toString() === req.user._id.toString() ? conn.recipient : conn.requester;
  });

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
    podId: { $exists: false },
    $or: [
      { sender: req.user._id, recipient: targetUserId },
      { sender: targetUserId, recipient: req.user._id }
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

  const isMember = pod.members.some(m => m.user.toString() === req.user._id.toString()) || pod.organizer.toString() === req.user._id.toString();
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

  let messageOptions = {
    sender: req.user._id,
    content
  };

  let roomName = '';

  if (podId) {
    const pod = await Pod.findById(podId);
    if (!pod) throw new Error('Pod not found');
    const isMember = pod.members.some(m => m.user.toString() === req.user._id.toString()) || pod.organizer.toString() === req.user._id.toString();
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
  getConnections,
  getDMHistory,
  getPodHistory,
  sendMessage
};
