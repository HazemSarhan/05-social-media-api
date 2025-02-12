import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import UnauthenticatedError from '../errors/UnauthenticatedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import checkPermission from '../utils/checkPermission.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { clearCache, getCache, setCache } from '../utils/redisCaching.js';

export const getAllUsers = async (req, res) => {
  const cacheKey = 'users:list';
  const cachedUsers = await getCache(cacheKey);
  if (cachedUsers) {
    logger.info(`admin with name ${req.user.name} fetched all users`);
    return res.status(StatusCodes.OK).json({ users: cachedUsers });
  }

  const users = await prisma.user.findMany({});
  logger.info(`admin with name ${req.user.name} fetched all users`);

  await setCache(cacheKey, users, 3600);
  res.status(StatusCodes.OK).json({ users });
};

export const getUserById = async (req, res) => {
  const { id: userId } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  checkPermission(req.user, user.id);
  if (!user) {
    throw new NotFoundError(`No users found with id: ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

export const showCurrentUser = async (req, res) => {
  const userId = req.user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new BadRequestError('No current users has logged in');
  }
  res.status(StatusCodes.OK).json({ user });
};

export const updateUserData = async (req, res) => {
  const { id: userId } = req.params;
  const { name, email, phoneNumber } = req.body;
  if (!name && !email && !phoneNumber) {
    throw new BadRequestError('No changes found!');
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  checkPermission(req.user, user.id);

  const updateData = {};
  if (name) {
    updateData.name = name;
  }
  if (email) {
    updateData.email = email;
  }
  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }

  const updatedData = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  logger.info(
    `User with name:${user.name} and id: ${user.id} has changed data, by RequestId: ${req.user.userId} and name: ${req.user.name}`
  );

  await clearCache('users:list');

  res.status(StatusCodes.OK).json({ updatedData });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id: userId } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('You are not authorized to access this route');
  }
  const updateUserRole = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  logger.info(
    `ADMIN With id: ${req.user.userId} and name: ${req.user.name}, has changed the role to ${userId} with name: ${user.name} to ${role}`
  );

  await clearCache('users:list');

  res.status(StatusCodes.OK).json({ updateUserRole });
};

export const updateUserPassword = async (req, res) => {
  const { id: userId } = req.params;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Both current and new password are required');
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Your current password is invalid!');
  }

  checkPermission(req.user, user.id);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updateUserPassword = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logger.info(
    `User with name:${user.name} and id: ${user.id} has changed password, by RequestId: ${req.user.userId} and name: ${req.user.name}`
  );

  await clearCache('users:list');
  res
    .status(StatusCodes.OK)
    .json({ message: 'Password has been changed', updateUserPassword });
};

export const deleteUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundError(`No users found with this id!`);
  }
  if (req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('You are not authorized to access this route');
  }
  const deleteUser = await prisma.user.deleteMany({
    where: { id: userId },
  });

  logger.info(
    `ADMIN With id: ${req.user.userId} and name: ${req.user.name}, has deleted the user with id:${userId} and name: ${user.name}`
  );

  await clearCache('users:list');
  res.status(StatusCodes.OK).json({ message: 'User has been deleted!' });
};
