import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import logger from '../utils/logger.js';
import NotFoundError from '../errors/NotFoundError.js';
import checkPermission from '../utils/checkPermission.js';
import { clearCache, getCache, setCache } from '../utils/redisCaching.js';

export const createComment = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError('Please provide a comment content');
  }
  const { id: postId } = req.params;
  const authorId = req.user.userId;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });

  if (!post) {
    throw new NotFoundError(`No posts found with this id`);
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId,
      postId: parseInt(postId),
    },
  });

  await clearCache(`comments:post:${postId}`);

  res.status(StatusCodes.CREATED).json({ comment });
};

export const getPostComments = async (req, res) => {
  const { id: postId } = req.params;

  const cacheKey = `comments:post:${postId}`;
  const cachedComments = await getCache(cacheKey);
  if (cachedComments) {
    const comments = JSON.parse(cachedComments);
    return res.status(StatusCodes.OK).json({ comments });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });
  const comments = await prisma.comment.findMany({
    where: { postId: parseInt(postId, 10) },
  });

  await setCache(cacheKey, JSON.stringify(comments), 3600);

  res.status(StatusCodes.OK).json({ comments });
};

export const getCommentById = async (req, res) => {
  const { id: commentId } = req.params;

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId, 10) },
  });

  if (!comment) {
    throw new NotFoundError(`No comment found with this id`);
  }

  res.status(StatusCodes.OK).json({ comment });
};

export const updateComment = async (req, res) => {
  const { content, postId } = req.body;
  if (!content) {
    throw new BadRequestError('Please provide a valid content to edit');
  }
  const { id: commentId } = req.params;
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId, 10) },
  });
  if (!comment) {
    throw new NotFoundError(`No comments found with this id`);
  }
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });
  if (!post) {
    throw new NotFoundError(`No posts found with this id`);
  }

  checkPermission(req.user, comment.authorId);

  await clearCache(`comments:post:${postId}`);
  const updateComment = await prisma.comment.updateMany({
    where: { id: parseInt(commentId, 10) },
    data: {
      content,
    },
  });

  res.status(StatusCodes.OK).json({ message: 'comment has been updated' });
};

export const deleteComment = async (req, res) => {
  const { id: commentId } = req.params;
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId, 10) },
  });
  if (!comment) {
    throw new NotFoundError(`No comments found with this id`);
  }

  checkPermission(req.user, comment.authorId);

  const deleteComment = await prisma.comment.deleteMany({
    where: { id: parseInt(commentId, 10) },
  });

  await clearCache(`comments:post:${postId}`);
  res.status(StatusCodes.OK).json({ message: 'comment has been deleted' });
};
