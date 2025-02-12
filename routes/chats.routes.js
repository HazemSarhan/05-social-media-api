import express from 'express';
import {
  sendMessageToUser,
  getChatMessages,
  getMyChats,
} from '../controllers/chats.controller.js';
import {
  authenticateUser,
  authorizePermissions,
} from '../middleware/authentication.js';
const router = express.Router();

router.route('/').get([authenticateUser], getMyChats);

router
  .route('/:recipientId/send-message')
  .post([authenticateUser], sendMessageToUser);

router.route('/:chatId').get([authenticateUser], getChatMessages);

export default router;
