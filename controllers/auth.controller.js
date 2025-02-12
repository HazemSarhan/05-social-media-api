import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import UnauthenticatedError from '../errors/UnauthenticatedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import { attachCookiesToResponse } from '../utils/jwt.js';
import createTokenUser from '../utils/createTokenUser.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../configs/sendgridConfig.js';
import logger from '../utils/logger.js';
import { clearCache } from '../utils/redisCaching.js';

export const register = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;
  if (!name || !phoneNumber || !email || !password) {
    throw new BadRequestError('Please provide all required fields');
  }

  const normalizedEmail = email.toLowerCase();

  const isEmailExist = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (isEmailExist) {
    throw new BadRequestError('Email is already registered!');
  }

  const isFirstAccount = await prisma.user.count();
  const role = isFirstAccount === 0 ? 'ADMIN' : 'USER';

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedEmailToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  const emailTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phoneNumber,
      password: hashedPassword,
      role,
      emailVerificationToken: hashedEmailToken,
      emailTokenExpiration,
    },
  });

  const emailSubject = `Your Verification Code`;
  const emailBody = `
    <p>Hi ${name},</p>
    <p>Thank you for registering. Please verify your account using the following code:</p>
    <h1>${emailVerificationToken}</h1>
    <p>If you did not register, please ignore this email.</p>
  `;

  await sendEmail(user.email, emailSubject, emailBody);

  await clearCache('users:list');

  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Verification codes sent to your email' });
};

export const resendConfirmationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError(
      'Email is required to resend the verification code!'
    );
  }

  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new NotFoundError('No user found with this email!');
  }

  if (user.isEmailVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Email is already verified' });
  }

  const emailVerificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedEmailToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  const emailTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      emailVerificationToken: hashedEmailToken,
      emailTokenExpiration,
    },
  });

  const emailSubject = 'Your New Verification Code';
  const emailBody = `
    <p>Hi ${client.name},</p>
    <p>Please verify your account using the following code:</p>
    <h1>${emailVerificationToken}</h1>
    <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(user.email, emailSubject, emailBody);

  res.status(StatusCodes.OK).json({
    message: 'New verification code sent to your email.',
  });
};

export const verifyEmail = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    throw new BadRequestError('Email and verification code are required!');
  }

  const normalizedEmail = email.toLowerCase();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
      emailVerificationToken: hashedToken,
      emailTokenExpiration: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired token');
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      isEmailVerified: true,
      emailTokenExpiration: null,
      emailVerificationToken: null,
    },
  });

  await clearCache('users:list');

  res.status(StatusCodes.OK).json({ message: 'Email verified successfully.' });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError('Please provide a valid email');
  }

  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new BadRequestError('No user found with this email');
  }

  const emailVerificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedEmailToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  const emailTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      emailVerificationToken: hashedEmailToken,
      emailTokenExpiration,
    },
  });

  const emailSubject = 'Your Password Reset Verification Code';
  const emailBody = `
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Please use the following verification code to proceed:</p>
    <h1>${emailVerificationToken}</h1>
    <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(user.email, emailSubject, emailBody);
  res.status(StatusCodes.OK).json({
    message: 'A verification code has been sent to your email.',
  });
};

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    throw new BadRequestError('Please provide all required fields');
  }
  const normalizedEmail = email.toLowerCase();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
      emailVerificationToken: hashedToken,
      emailTokenExpiration: { gt: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      password: hashedPassword,
      emailVerificationToken: null,
      emailTokenExpiration: null,
    },
  });

  res.status(StatusCodes.OK).json({
    message:
      'Password reset successfully. You can now log in with your new password.',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all required fields');
  }

  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  if (!user.isEmailVerified) {
    throw new UnauthenticatedError('Please verify your email first');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    logger.warn(`User failed to login`);
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const tokenUser = createTokenUser(user);
  let refreshToken = '';
  const existingToken = await prisma.token.findFirst({
    where: { userId: user.id },
  });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    logger.info(`User logged in successfully: ${normalizedEmail}`);
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: { connect: { id: user.id } },
    isValid: true,
  };

  await prisma.token.create({ data: userToken });
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
};

export const logout = async (req, res) => {
  await prisma.token.deleteMany({
    where: { userId: req.user.userId },
  });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User has logged out' });
};
