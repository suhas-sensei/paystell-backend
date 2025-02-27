import { createClient } from 'redis';

export const createRedisClient = () => {
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
            reconnectStrategy: (retries) => {
                // Exponential backoff
                return Math.min(retries * 50, 1000);
            }
        }
    });

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    return client;
};