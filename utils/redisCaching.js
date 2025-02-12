import redisClient, { isRedisConnected } from '../configs/redisConfig.js';

export const setCache = async (key, value, expiration = 3600) => {
  if (!isRedisConnected()) {
    console.warn('Redis is not connected. Skipping cache set.');
    return;
  }
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: expiration });
  } catch (error) {
    console.error('Error setting cache:', error.message);
  }
};

export const getCache = async (key) => {
  if (!isRedisConnected()) {
    console.warn('Redis is not connected. Skipping cache fetch.');
    return null;
  }
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error.message);
    return null;
  }
};

export const clearCache = async (key) => {
  if (!isRedisConnected()) {
    console.warn('Redis is not connected. Skipping cache clear.');
    return;
  }
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error clearing cache:', error.message);
  }
};
