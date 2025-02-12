import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/followers.controller.js';
import { authenticateUser } from '../middleware/authentication.js';
const router = express.Router();

router.route('/follow').post([authenticateUser], followUser);
router.route('/unfollow').post([authenticateUser], unfollowUser);
router.route('/:id/followers').get([authenticateUser], getFollowers);
router.route('/:id/following').get([authenticateUser], getFollowing);

export default router;
