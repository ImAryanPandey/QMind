import { Worker, Queue } from 'bullmq';
import path from 'path';
import { config } from 'dotenv';
import aiService from './services/aiService.js';
import connectDB from '../config/db.js';

const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

await connectDB();

const aiEventsQueue = new Queue('ai-events', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  }
});

const aiWorker = new Worker('ai-queue', async (job) => {
    const { conversationId, message, userId } = job.data;
    try {
      const aiResponse = await aiService.generateResponse(conversationId, message, userId);
      
      await aiEventsQueue.add('ai-response', {
        conversationId,
        sender: 'ai',
        content: aiResponse,
        messageType: 'ai',
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }, 
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD
    },
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000
    }
  }
);