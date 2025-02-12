import express from 'express';
import {
  likePost,
  dislikePost,
  getPostLikes,
} from '../controllers/reactions.controller.js';
import { authenticateUser } from '../middleware/authentication.js';
const router = express.Router();

router.route('/:id/like').post([authenticateUser], likePost);
router.route('/:id/dislike').post([authenticateUser], dislikePost);
router.route('/:id/reactions').get([authenticateUser], getPostLikes);

export default router;
