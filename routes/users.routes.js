import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middleware/authentication.js';
import {
  getAllUsers,
  getUserById,
  showCurrentUser,
  updateUserData,
  updateUserRole,
  deleteUser,
  updateUserPassword,
} from '../controllers/users.controller.js';
const router = express.Router();

router
  .route('/')
  .get([authenticateUser, authorizePermissions('ADMIN')], getAllUsers);

router.route('/showMe').get([authenticateUser], showCurrentUser);

router
  .route('/:id/role')
  .patch([authenticateUser, authorizePermissions('ADMIN')], updateUserRole);

router.route('/:id/password').patch([authenticateUser], updateUserPassword);

router
  .route('/:id')
  .get([authenticateUser], getUserById)
  .patch([authenticateUser], updateUserData)
  .delete([authenticateUser, authorizePermissions('ADMIN'), deleteUser]);

export default router;
