import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import logger from '../utils/logger.js';
import NotFoundError from '../errors/NotFoundError.js';
import { clearCache, getCache, setCache } from '../utils/redisCaching.js';

export const likePost = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.userId;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });
  if (!post) {
    throw new NotFoundError(`No posts found with this id`);
  }

  const existingReaction = await prisma.reaction.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: parseInt(postId, 10),
      },
    },
  });

  if (existingReaction) {
    if (existingReaction.type === 'LIKE') {
      throw new BadRequestError('You already liked this post!');
    } else {
      const updateReaction = await prisma.reaction.update({
        where: {
          userId_postId: {
            userId,
            postId: parseInt(postId, 10),
          },
        },
        data: { type: 'LIKE' },
      });
      logger.info(
        `User ${req.user.name} switched from DISLIKE to LIKE on post ID ${post.id}`
      );
      await clearCache(`reactions:post:${postId}`);
      return res.status(StatusCodes.OK).json({
        message: 'Changed dislike to like successfully!',
        reaction: updateReaction,
      });
    }
  }

  const reaction = await prisma.reaction.create({
    data: { type: 'LIKE', postId: parseInt(postId, 10), userId },
  });

  logger.info(`User ${req.user.name} has liked post with id ${post.id}`);

  await clearCache(`reactions:post:${postId}`);
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'You liked the post successfully!', reaction });
};

export const dislikePost = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.userId;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });

  if (!post) {
    throw new NotFoundError(`No post found with this ID`);
  }

  const existingReaction = await prisma.reaction.findUnique({
    where: {
      userId_postId: {
        userId,
        postId: parseInt(postId, 10),
      },
    },
  });

  if (existingReaction) {
    if (existingReaction.type === 'DISLIKE') {
      throw new BadRequestError('You already disliked this post!');
    } else {
      const updatedReaction = await prisma.reaction.update({
        where: {
          userId_postId: {
            userId,
            postId: parseInt(postId, 10),
          },
        },
        data: { type: 'DISLIKE' },
      });

      logger.info(
        `User ${req.user.name} switched from LIKE to DISLIKE on post ID ${post.id}`
      );
      await clearCache(`reactions:post:${postId}`);
      return res.status(StatusCodes.OK).json({
        message: 'Changed like to dislike!',
        reaction: updatedReaction,
      });
    }
  }

  const reaction = await prisma.reaction.create({
    data: { type: 'DISLIKE', postId: parseInt(postId, 10), userId },
  });
  logger.info(`User ${req.user.name} disliked post ID ${post.id}`);
  await clearCache(`reactions:post:${postId}`);
  res.status(StatusCodes.CREATED).json({
    message: 'You disliked the post successfully!',
    reaction,
  });
};

export const getPostLikes = async (req, res) => {
  const { id: postId } = req.params;

  const cacheKey = `reactions:post:${postId}`;
  const cachedReactions = await getCache(cacheKey);
  if (cachedReactions) {
    const reactions = JSON.parse(cachedReactions);
    return res
      .status(StatusCodes.OK)
      .json({ postLikes: reactions.length, reactions });
  }

  const reactions = await prisma.reaction.findMany({
    where: { postId: parseInt(postId) },
  });

  await setCache(cacheKey, JSON.stringify(reactions), 3600);

  res.status(StatusCodes.OK).json({ postLikes: reactions.length, reactions });
};
