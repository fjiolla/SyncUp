import { Router } from 'express';
import * as chatController from '../../controllers/chat.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import { sendMessageSchema, conversationParamSchema } from '../../validators/chat.validator.js';

const router = Router();

router.post('/conversations/:targetUserId', protect, chatController.getOrCreateConversation);
router.get('/conversations', protect, chatController.getUserConversations);
router.post('/conversations/:conversationId/messages', protect, validate(sendMessageSchema), chatController.sendMessage);
router.get('/conversations/:conversationId/messages', protect, validate(conversationParamSchema), chatController.getMessages);
router.post('/conversations/:conversationId/read', protect, validate(conversationParamSchema), chatController.markAsRead);
router.post('/conversations/:conversationId/accept', protect, chatController.acceptConversation);
router.delete('/conversations/:conversationId', protect, chatController.declineConversation);
router.delete('/messages/:messageId', protect, chatController.deleteMessageForMe);

export default router;
