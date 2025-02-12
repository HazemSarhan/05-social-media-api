import dotenv from 'dotenv';
import http from 'http';
import { initializeWebSocket } from './configs/websocketConfig.js';
dotenv.config();
import express from 'express';

const app = express();
const httpServer = http.createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(httpServer);
app.set('io', io);

// Rest of packages
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import corsConfigure from './configs/corsConfig.js';
import fileUpload from 'express-fileupload';

// Middlewares
import errorHandlerMiddleware from './middleware/errorHandler.js';
import notFoundMiddleware from './middleware/notFound.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import followersRoutes from './routes/followers.routes.js';
import postsRoutes from './routes/posts.routes.js';
import reactionsRoutes from './routes/reactions.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import chatRoutes from './routes/chats.routes.js';

app.set('trust proxy', 1);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(corsConfigure());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
  })
);

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/followers', followersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/reactions', reactionsRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/chats', chatRoutes);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`server is running on port ${PORT}`));
