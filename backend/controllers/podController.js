import asyncHandler from 'express-async-handler';
import Pod from '../models/Pod.js';

// @desc    Get all active pods
// @route   GET /api/pods
// @access  Public
const getPods = asyncHandler(async (req, res) => {
  const pods = await Pod.find({})
    .populate('organizer', 'name email profilePicture')
    .populate('members', 'name profilePicture')
    .sort({ dateTime: 1 });
  res.json(pods);
});

// @desc    Get pods by user ID (created or joined)
// @route   GET /api/pods/user/:id
// @access  Public
const getPodsByUser = asyncHandler(async (req, res) => {
  const pods = await Pod.find({
    $or: [
      { organizer: req.params.id },
      { members: req.params.id }
    ]
  })
    .populate('organizer', 'name email profilePicture')
    .populate('members', 'name profilePicture')
    .sort({ dateTime: 1 });
  
  res.json(pods);
});

// @desc    Create a new pod
// @route   POST /api/pods
// @access  Private
const createPod = asyncHandler(async (req, res) => {
  const { title, description, category, tags, location, mapLink, minAge, maxAge, minTrustScore, requireVerified, dateTime, maxMembers } = req.body;

  const pod = new Pod({
    title,
    description,
    category,
    tags,
    location,
    mapLink,
    minAge,
    maxAge,
    minTrustScore,
    requireVerified,
    dateTime,
    maxMembers,
    organizer: req.user._id,
    members: [req.user._id],
  });

  const createdPod = await pod.save();
  
  const populatedPod = await Pod.findById(createdPod._id)
    .populate('organizer', 'name email profilePicture')
    .populate('members', 'name profilePicture');

  const io = req.app.get('io');
  if (io) io.emit('pod_created', populatedPod);

  res.status(201).json(populatedPod);
});

// @desc    Join a pod
// @route   POST /api/pods/:id/join
// @access  Private
const joinPod = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.id);

  if (pod) {
    if (pod.minAge && req.user.age < pod.minAge) {
      res.status(403);
      throw new Error(`You must be at least ${pod.minAge} years old to join this pod`);
    }
    
    if (pod.maxAge && req.user.age > pod.maxAge) {
      res.status(403);
      throw new Error(`You must be under ${pod.maxAge} years old to join this pod`);
    }

    if (pod.requireVerified && !req.user.isVerified) {
      res.status(403);
      throw new Error('You must be a verified SyncUp user to join this pod');
    }

    if (pod.minTrustScore > 0) {
      const podsJoinedCount = await Pod.countDocuments({ members: req.user._id });
      const podsCreatedCount = await Pod.countDocuments({ organizer: req.user._id });
      const userTrustScore = 50 + (20 * podsJoinedCount) + (30 * podsCreatedCount);
      if (userTrustScore < pod.minTrustScore) {
        res.status(403);
        throw new Error(`This pod requires a minimum Trust Score of ${pod.minTrustScore}`);
      }
    }

    if (pod.members.includes(req.user._id)) {
      res.status(400);
      throw new Error('You are already a member of this pod');
    }

    if (pod.members.length >= pod.maxMembers) {
      res.status(400);
      throw new Error('Pod is full');
    }

    pod.members.push(req.user._id);
    await pod.save();

    const updatedPod = await Pod.findById(pod._id)
      .populate('organizer', 'name email profilePicture')
      .populate('members', 'name profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.emit('pod_updated', updatedPod);
      io.emit('live_notification', `${req.user.name} joined ${pod.title}`);
    }

    res.json(updatedPod);
  } else {
    res.status(404);
    throw new Error('Pod not found');
  }
});

// @desc    Leave a pod
// @route   POST /api/pods/:id/leave
// @access  Private
const leavePod = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.id);

  if (pod) {
    if (!pod.members.includes(req.user._id)) {
      res.status(400);
      throw new Error('You are not a member of this pod');
    }

    if (pod.organizer.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Organizer cannot leave the pod. Delete the pod instead.');
    }

    pod.members = pod.members.filter((memberId) => memberId.toString() !== req.user._id.toString());
    await pod.save();

    const updatedPod = await Pod.findById(pod._id)
      .populate('organizer', 'name email profilePicture')
      .populate('members', 'name profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.emit('pod_updated', updatedPod);
    }

    res.json(updatedPod);
  } else {
    res.status(404);
    throw new Error('Pod not found');
  }
});

// @desc    Delete a pod
// @route   DELETE /api/pods/:id
// @access  Private
const deletePod = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.id);

  if (pod) {
    if (pod.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the organizer can delete this pod');
    }

    await pod.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('pod_deleted', pod._id);
    }

    res.json({ message: 'Pod removed' });
  } else {
    res.status(404);
    throw new Error('Pod not found');
  }
});

export { getPods, getPodsByUser, createPod, joinPod, leavePod, deletePod };
