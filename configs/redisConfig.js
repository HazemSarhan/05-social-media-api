import { createClient } from 'redis';

let redisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  console.log('Connected to redis');
  redisConnected = true;
});

redisClient.on('error', (err) => {
  console.error('Redis client error', err.message);
  redisConnected = false;
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
    redisConnected = false;
  }
})();

export const isRedisConnected = () => redisConnected;

export default redisClient;
