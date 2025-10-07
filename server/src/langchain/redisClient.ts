import { createClient, type RedisClientType } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.REDIS_PASSWORD || !process.env.REDIS_HOST) {
    throw new Error('Missing REDIS_PASSWORD or REDIS_HOST in environment variables');
}

export const redis: RedisClientType = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 14609,
    },
});

redis.on('error', (err: unknown) => console.error('Redis Client Error', err));

(async () => {
    try {
        await redis.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();