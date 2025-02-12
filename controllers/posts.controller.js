import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import logger from '../utils/logger.js';
import NotFoundError from '../errors/NotFoundError.js';
import cloudinary from '../configs/cloudinaryConfig.js';
import fs from 'fs';
import checkPermission from '../utils/checkPermission.js';
import { clearCache, getCache, setCache } from '../utils/redisCaching.js';

export const createPost = async (req, res) => {
  const { content } = req.body;
  const authorId = req.user.userId;
  if (!content) {
    throw new BadRequestError('Please provide a valid post content');
  }

  let image = null;
  if (req.files && req.files.image) {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'social-media',
      }
    );
    fs.unlinkSync(req.files.image.tempFilePath);
    image = result.secure_url;
  }

  const post = await prisma.post.create({
    data: {
      content,
      image,
      authorId,
    },
  });

  await clearCache('posts:list');

  logger.info(`${req.user.name} has created a new post with id ${post.id}`);

  res.status(StatusCodes.CREATED).json({ post });
};

export const getAllPosts = async (req, res) => {
  const cacheKey = `posts:list`;
  const cachedPosts = await getCache(cacheKey);
  if (cachedPosts) {
    const posts = JSON.parse(cachedPosts);
    return res.status(StatusCodes.OK).json({ posts });
  }
  const posts = await prisma.post.findMany({});
  await setCache(cacheKey, JSON.stringify(posts), 3600);
  res.status(StatusCodes.OK).json({ posts });
};

export const getPostById = async (req, res) => {
  const { id: postId } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });
  if (!post) {
    throw new NotFoundError(`No posts found with this id`);
  }
  res.status(StatusCodes.OK).json({ post });
};

export const getMyPosts = async (req, res) => {
  const authorId = req.user.userId;
  const posts = await prisma.post.findMany({
    where: { authorId },
  });
  res.status(StatusCodes.OK).json({ posts });
};

export const updatePost = async (req, res) => {
  const { content } = req.body;
  const { id: postId } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });

  if (!post) {
    throw new BadRequestError('No posts found with this id');
  }

  let image = post.image;
  if (req.files && req.files.image) {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'social-media',
      }
    );
    fs.unlinkSync(req.files.image.tempFilePath);
    image = result.secure_url;
  }

  checkPermission(req.user, post.authorId);

  const updateData = {};
  if (content) {
    updateData.content = content;
  }
  if (image) {
    updateData.image = image;
  }

  const updatePost = await prisma.post.updateMany({
    where: { id: parseInt(postId, 10) },
    data: updateData,
  });

  await clearCache('posts:list');
  logger.info(`${req.user.name} has updated post with id ${post.id}`);

  res.status(StatusCodes.OK).json({ message: 'Post updated successfully!' });
};

export const deletePost = async (req, res) => {
  const { id: postId } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId, 10) },
  });

  if (!post) {
    throw new BadRequestError('No posts found with this id');
  }

  checkPermission(req.user, post.authorId);

  const deletePost = await prisma.post.deleteMany({
    where: { id: parseInt(postId, 10) },
  });

  await clearCache('posts:list');
  logger.info(`${req.user.name} has removed post with id ${post.id}`);

  res.status(StatusCodes.OK).json({ message: 'Post has been deleted' });
};
