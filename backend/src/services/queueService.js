import { Queue } from 'bullmq';
import { config } from 'dotenv';
config();

// 1. Define the Queue
const aiQueue = new Queue('ai-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,            
    backoff: {
      type: 'exponential',   
      delay: 1000
    },
    removeOnComplete: 100, 
    removeOnFail: 50         
  }
});

// 2. Export the Adder Function
export const addAIJob = async (jobData) => {
  try {
    const job = await aiQueue.add('process-ai-request', jobData);
    console.log(`📝 AI Job Added to Queue [ID: ${job.id}]`);
    return job.id;
  } catch (error) {
    console.error('❌ Failed to add job to queue:', error);
    throw error;
  }
};

export default aiQueue;