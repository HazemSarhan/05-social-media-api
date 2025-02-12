import express from 'express';
import { authenticateUser } from '../middleware/authentication.js';
import {
  createComment,
  getPostComments,
  getCommentById,
  updateComment,
  deleteComment,
} from '../controllers/comments.controller.js';
const router = express.Router();

router
  .route('/:id/comment')
  .post([authenticateUser], createComment)
  .patch([authenticateUser], updateComment)
  .delete([authenticateUser], deleteComment);

router.route('/:id').get([authenticateUser], getCommentById);

router.route('/:id/comments').get([authenticateUser], getPostComments);

export default router;
