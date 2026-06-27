import { Router } from 'express';
import * as podController from '../../controllers/pod.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect, optionalAuth } from '../../middlewares/auth.js';
import {
  createPodSchema,
  updatePodSchema,
  podIdParamSchema,
  memberActionSchema,
  promoteSchema,
  discoverSchema,
} from '../../validators/pod.validator.js';

const router = Router();

router.post('/', protect, validate(createPodSchema), podController.createPod);
router.get('/discover', validate(discoverSchema), podController.discoverPods);
router.get('/my-pods', protect, podController.getUserPods);
router.get('/:slug', optionalAuth, podController.getPod);
router.patch('/:podId', protect, validate(updatePodSchema), podController.updatePod);
router.delete('/:podId', protect, validate(podIdParamSchema), podController.deletePod);
router.post('/:podId/join', protect, validate(podIdParamSchema), podController.joinPod);
router.post('/:podId/leave', protect, validate(podIdParamSchema), podController.leavePod);
router.get('/:podId/members', podController.getPodMembers);
router.post('/:podId/members/:userId/approve', protect, validate(memberActionSchema), podController.approveMember);
router.post('/:podId/members/:userId/reject', protect, validate(memberActionSchema), podController.rejectMember);
router.post('/:podId/members/:userId/remove', protect, validate(memberActionSchema), podController.removeMember);
router.patch('/:podId/members/:userId/role', protect, validate(promoteSchema), podController.promoteMember);
router.post('/:podId/invite/:userId', protect, validate(memberActionSchema), podController.inviteMember);

export default router;
