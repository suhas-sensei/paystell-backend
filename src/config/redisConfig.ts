import { createClient } from 'redis';


const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});


redisClient.on('error', (err) => console.error('Redis Client Error:', err));


(async () => {
  await redisClient.connect();
  console.log('🚀 Conectado a Redis');
})();

export default redisClient;
export const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const client = createClient({
    url: redisUrl,
  });
  
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  
  client.on('connect', () => {
    console.log('Connected to Redis');
  });
  
  return client;
};

