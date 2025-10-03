import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
export const redis = createClient({
    username: 'default',
    password: `${process.env.REDIS_PASSWORD}`,
    socket: {
        host: `${process.env.REDIS_HOST}`,
        port: 14609
    }
});

redis.on('error', (err) => console.log('Redis Client Error', err));

// Avoid connecting to Redis during tests
if (process.env.NODE_ENV !== 'test') {
    await redis.connect();
}