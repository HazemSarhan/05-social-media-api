import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import logger from '../utils/logger.js';
import NotFoundError from '../errors/NotFoundError.js';

export const followUser = async (req, res) => {
  const followerId = req.user.userId;
  const { followingId } = req.body;
  if (!followingId) {
    throw new BadRequestError('You must add a valid user to follow');
  }
  const following = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!following) {
    throw new NotFoundError('User with this id not found!');
  }
  if (followerId === followingId) {
    throw new BadRequestError('You can not follow yourself!');
  }

  const existingFollow = await prisma.followers.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    throw new BadRequestError('You already followed this user');
  }

  const follow = await prisma.followers.create({
    data: {
      followerId,
      followingId,
    },
  });

  logger.info(`User ${req.user.name} has followed ${following.name}`);
  res
    .status(StatusCodes.OK)
    .json({ message: 'You successfully follow this user', follow });
};

export const unfollowUser = async (req, res) => {
  const followerId = req.user.userId;
  const { followingId } = req.body;
  if (!followingId) {
    throw new BadRequestError('You must add a valid user to unfollow!');
  }

  const following = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!following) {
    throw new NotFoundError('No users found with this id');
  }

  const followRecord = await prisma.followers.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!followRecord) {
    throw new BadRequestError('You are not following this user!');
  }

  await prisma.followers.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  logger.info(`User ${req.user.name} has unfollowed ${following.name}`);

  res
    .status(StatusCodes.OK)
    .json({ message: 'You successfully unfollowed this user' });
};

export const getFollowers = async (req, res) => {
  const { userId } = req.params;
  const followers = await prisma.followers.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  res.status(StatusCodes.OK).json({
    followersCount: followers.length,
    followers: followers.map((f) => f.follower),
  });
};

export const getFollowing = async (req, res) => {
  const { userId } = req.params;

  const following = await prisma.followers.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  res.status(StatusCodes.OK).json({
    followingCount: following.length,
    following: following.map((f) => f.following),
  });
};
