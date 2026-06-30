import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

// Create a singleton instance to prevent multiple connections in dev
const getRedisClient = () => {
  return new Redis(redisConfig);
};

declare global {
  var redisGlobal: ReturnType<typeof getRedisClient> | undefined;
}

export const connection = globalThis.redisGlobal ?? getRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.redisGlobal = connection;
}
