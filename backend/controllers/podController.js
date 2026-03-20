import asyncHandler from 'express-async-handler';
import Pod from '../models/Pod.js';
import { isPodMember } from '../utils/podUtils.js';

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

  const maxMembersVal = maxMembers != null ? Number(maxMembers) : 10;
  if (isNaN(maxMembersVal) || maxMembersVal < 2) {
    res.status(400);
    throw new Error('maxMembers must be at least 2');
  }

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
    maxMembers: maxMembersVal,
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

// @desc    Update a pod (organizer only)
// @route   PUT /api/pods/:id
// @access  Private
const updatePod = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.id);

  if (!pod) {
    res.status(404);
    throw new Error('Pod not found');
  }

  if (pod.organizer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the organizer can update this pod');
  }

  const { title, description, category, tags, location, mapLink, minAge, maxAge, minTrustScore, requireVerified, dateTime, maxMembers } = req.body;

  if (title !== undefined) pod.title = title;
  if (description !== undefined) pod.description = description;
  if (category !== undefined) pod.category = category;
  if (tags !== undefined) pod.tags = tags;
  if (location !== undefined) pod.location = location;
  if (mapLink !== undefined) pod.mapLink = mapLink;
  if (minAge !== undefined) pod.minAge = minAge;
  if (maxAge !== undefined) pod.maxAge = maxAge;
  if (minTrustScore !== undefined) pod.minTrustScore = minTrustScore;
  if (requireVerified !== undefined) pod.requireVerified = requireVerified;
  if (dateTime !== undefined) pod.dateTime = dateTime;
  if (maxMembers !== undefined) {
    const val = Number(maxMembers);
    if (isNaN(val) || val < 2) {
      res.status(400);
      throw new Error('maxMembers must be at least 2');
    }
    pod.maxMembers = val;
  }

  await pod.save();

  const updatedPod = await Pod.findById(pod._id)
    .populate('organizer', 'name email profilePicture')
    .populate('members', 'name profilePicture');

  const io = req.app.get('io');
  if (io) io.emit('pod_updated', updatedPod);

  res.json(updatedPod);
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
      const alreadyMember = pod.members.some(m => m.toString() === req.user._id.toString());
      let podsJoinedCount = await Pod.countDocuments({ members: req.user._id });
      if (alreadyMember) podsJoinedCount -= 1;
      const podsCreatedCount = await Pod.countDocuments({ organizer: req.user._id });
      const userTrustScore = 50 + (20 * podsJoinedCount) + (30 * podsCreatedCount);
      if (userTrustScore < pod.minTrustScore) {
        res.status(403);
        throw new Error(`This pod requires a minimum Trust Score of ${pod.minTrustScore}`);
      }
    }

    const updatedPod = await Pod.findOneAndUpdate(
      {
        _id: pod._id,
        members: { $ne: req.user._id },
        $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] },
      },
      {
        $addToSet: { members: req.user._id },
      },
      { new: true }
    )
      .populate('organizer', 'name email profilePicture')
      .populate('members', 'name profilePicture');

    if (!updatedPod) {
      const latestPod = await Pod.findById(pod._id).select('organizer members maxMembers');
      if (!latestPod) {
        res.status(404);
        throw new Error('Pod not found');
      }
      if (isPodMember(latestPod, req.user._id)) {
        res.status(400);
        throw new Error('You are already a member of this pod');
      }
      if (latestPod.members.length >= latestPod.maxMembers) {
        res.status(400);
        throw new Error('Pod is full');
      }
      res.status(409);
      throw new Error('Could not join pod due to concurrent update. Please try again.');
    }

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
    if (!isPodMember(pod, req.user._id)) {
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

export { getPods, getPodsByUser, createPod, updatePod, joinPod, leavePod, deletePod };
