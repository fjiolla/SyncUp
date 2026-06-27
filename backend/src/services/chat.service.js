import { ConversationRepository } from '../repositories/conversation.repository.js';
import { MessageRepository } from '../repositories/message.repository.js';
import { FollowRepository } from '../repositories/follow.repository.js';
import { NotificationService } from './notification.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../exceptions/ApiError.js';

const notify = async (payload) => {
  try {
    await NotificationService.createNotification(payload);
  } catch {}
};

const isConnected = async (a, b) => {
  const [aFollowsB, bFollowsA] = await Promise.all([
    FollowRepository.findFollow(a, b),
    FollowRepository.findFollow(b, a),
  ]);
  const accepted = (f) => f && (f.status === 'accepted' || !f.status);
  return accepted(aFollowsB) || accepted(bFollowsA);
};

export const ChatService = {
  async getOrCreateConversation(userId, targetUserId) {
    if (userId.toString() === targetUserId.toString()) {
      throw ApiError.badRequest('Cannot start a conversation with yourself');
    }

    const target = await UserRepository.findById(targetUserId).catch(() => null);
    if (!target) throw ApiError.notFound('User not found');

    const existing = await ConversationRepository.findByParticipants(userId, targetUserId);
    if (existing) return existing;

    const connected = await isConnected(userId, targetUserId);

    return ConversationRepository.create({
      participants: [userId, targetUserId],
      type: 'direct',
      initiator: userId,
      status: connected ? 'accepted' : 'pending',
    });
  },

  async getUserConversations(userId, { page = 1, limit = 20 } = {}) {
    return ConversationRepository.findUserConversations(userId, { page, limit });
  },

  async acceptConversation(conversationId, userId) {
    const conversation = await ConversationRepository.findById(conversationId);
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) throw ApiError.forbidden('You are not a participant of this conversation');
    if (conversation.initiator && conversation.initiator.toString() === userId.toString()) {
      throw ApiError.badRequest('You cannot accept your own request');
    }
    return ConversationRepository.update(conversationId, { status: 'accepted' });
  },

  async declineConversation(conversationId, userId) {
    const conversation = await ConversationRepository.findById(conversationId);
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) throw ApiError.forbidden('You are not a participant of this conversation');
    await MessageRepository.model.deleteMany({ conversation: conversationId });
    await ConversationRepository.model.deleteOne({ _id: conversationId });
  },

  async sendMessage(conversationId, userId, { content, attachments = [] }) {
    const conversation = await ConversationRepository.findById(conversationId);
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    const isInitiator = conversation.initiator && conversation.initiator.toString() === userId.toString();

    if (conversation.status === 'pending') {
      if (isInitiator) {
        const sentCount = await MessageRepository.model.countDocuments({
          conversation: conversationId,
          sender: userId,
        });
        if (sentCount >= 1) {
          throw ApiError.forbidden('Wait until your message request is accepted before sending more messages');
        }
      } else {
        await ConversationRepository.update(conversationId, { status: 'accepted' });
        conversation.status = 'accepted';
      }
    }

    const message = await MessageRepository.create({
      conversation: conversationId,
      sender: userId,
      content,
      attachments,
      readBy: [userId],
    });

    await ConversationRepository.update(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date(),
    });

    const recipientId = conversation.participants.find((p) => p.toString() !== userId.toString());
    if (recipientId) {
      const sender = await UserRepository.findById(userId).catch(() => null);
      const isRequest = conversation.status === 'pending' && isInitiator;
      await notify({
        recipient: recipientId,
        sender: userId,
        type: 'new_message',
        title: isRequest ? 'New message request' : 'New message',
        body: sender ? `${sender.fullName}: ${content.slice(0, 80)}` : content.slice(0, 80),
        referenceId: conversationId,
        referenceType: 'User',
      });
    }

    return message;
  },

  async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
    const conversation = await ConversationRepository.findById(conversationId);
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    return MessageRepository.findByConversation(conversationId, { page, limit });
  },

  async markAsRead(conversationId, userId) {
    const conversation = await ConversationRepository.findById(conversationId);
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    return MessageRepository.markAsRead(conversationId, userId);
  },

  async deleteMessageForMe(messageId, userId) {
    const message = await MessageRepository.findById(messageId);
    if (message.conversation) {
      const conversation = await ConversationRepository.findById(message.conversation);
      const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
      if (!isParticipant) {
        throw ApiError.forbidden('You are not a participant of this conversation');
      }
    }

    return MessageRepository.update(messageId, {
      $addToSet: { deletedFor: userId },
    });
  },
};
