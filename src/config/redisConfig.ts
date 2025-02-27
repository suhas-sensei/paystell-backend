import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Singleton Redis client (para reutilización global)
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('🚀 Connected to Redis');
  } catch (err) {
    console.error('❌ Redis connection error:', err);
  }
})();

/**
 * Creates a new Redis client instance without automatically connecting.
 * Use this if you need separate Redis connections.
 */
export const createRedisClient = () => {
  const client = createClient({ url: redisUrl });

  client.on('error', (err) => console.error('Redis client error:', err));

  return client; // El usuario debe llamar `client.connect()` manualmente
};

// Export both the singleton and the factory function
export default redisClient;
