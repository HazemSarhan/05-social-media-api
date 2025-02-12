import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import NotFoundError from '../errors/NotFoundError.js';
import checkPermission from '../utils/checkPermission.js';
import { clearCache, getCache, setCache } from '../utils/redisCaching.js';
import cloudinary from '../configs/cloudinaryConfig.js';
import fs from 'fs';
import UnauthorizedError from '../errors/UnauthorizedError.js';

export const sendMessageToUser = async (req, res) => {
  const senderId = req.user.userId;
  const { recipientId } = req.params;
  const { content } = req.body;

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
  });

  if (!recipient) {
    throw new NotFoundError('Recipient not found!');
  }

  let existingChat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: {
          OR: [{ userId: senderId }, { userId: recipientId }],
        },
      },
    },
    include: {
      participants: true,
    },
  });

  if (!existingChat) {
    existingChat = await prisma.chat.create({
      data: {
        participants: {
          create: [{ userId: senderId }, { userId: recipientId }],
        },
      },
    });
  }

  let media = null;
  if (req.files && req.files.media) {
    const result = await cloudinary.uploader.upload(
      req.files.media.tempFilePath,
      {
        use_filename: true,
        folder: 'social-media',
      }
    );
    fs.unlinkSync(req.files.media.tempFilePath);
    media = result.secure_url;
  }

  if (!content && !media) {
    throw new BadRequestError('You can not send empty message');
  }

  const newMessage = await prisma.message.create({
    data: {
      content,
      media,
      senderId,
      chatId: existingChat.id,
    },
  });

  await clearCache(`chat:${existingChat.id}`);

  res.status(StatusCodes.CREATED).json({
    message: 'Message sent successfully',
    chatId: existingChat.id,
    newMessage,
  });
};

export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  const cacheKey = `chat:${chatId}`;
  const cachedMessage = await getCache(cacheKey);
  if (cachedMessage) {
    return res.status(StatusCodes.OK).json({ messages: cachedMessage });
  }

  const userId = req.user.userId;

  const isParticipant = await prisma.chatParticipants.findFirst({
    where: {
      chatId: parseInt(chatId, 10),
      userId,
    },
  });

  if (!isParticipant) {
    throw new UnauthorizedError('You are not participant in this chat');
  }

  const messages = await prisma.message.findMany({
    where: { chatId: parseInt(chatId, 10) },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true } } },
  });

  await setCache(cacheKey, messages, 3600);

  res.status(StatusCodes.OK).json({ messages });
};

export const getMyChats = async (req, res) => {
  const userId = req.user.userId;

  const userChats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  res.status(StatusCodes.OK).json({ chats: userChats });
};
