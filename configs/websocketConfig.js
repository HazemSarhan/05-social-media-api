import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('send-message', (data) => {
      try {
        const { chatId, content, sender, media, createdAt } = data;

        if (!chatId || !content || !sender) {
          throw new Error('Invalid message data');
        }

        console.log('send-message', data);
        io.to(Number(chatId)).emit('receive-message', {
          content,
          sender,
          media,
          createdAt,
        });
      } catch (error) {
        console.error('Error in send-message:', error.message);
        socket.emit('error', error.message);
      }
    });
  });

  return io;
};
