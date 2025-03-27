import { Message } from '../models/message.js';

export const messageRepository = {
  create: async (data) => await Message.create(data),
  findConversation: async (userId1, userId2) => await Message.find({
    $or: [
      { senderId: userId1, recipientId: userId2 },
      { senderId: userId2, recipientId: userId1 },
    ],
  }).sort('createdAt'),
};