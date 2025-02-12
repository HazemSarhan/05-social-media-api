import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
} from '../controllers/posts.controller.js';
import {
  authenticateUser,
  authorizePermissions,
} from '../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .post([authenticateUser], createPost)
  .get([authenticateUser, authorizePermissions('ADMIN')], getAllPosts);

router.route('/my-posts').get([authenticateUser], getMyPosts);

router
  .route('/:id')
  .get([authenticateUser], getPostById)
  .patch([authenticateUser], updatePost)
  .delete([authenticateUser], deletePost);

export default router;
