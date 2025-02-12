import express from 'express';
import {
  register,
  resendConfirmationCode,
  verifyEmail,
  login,
  logout,
  forgetPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import { authenticateUser } from '../middleware/authentication.js';
const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/resend-code', resendConfirmationCode);
router.post('/verify-email', verifyEmail);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/login', validate(loginSchema), login);
router.delete('/logout', [authenticateUser], logout);

export default router;
