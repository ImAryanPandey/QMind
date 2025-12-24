import http from 'http';
import path from 'path';
import { Worker } from 'bullmq';
import { config } from 'dotenv';
import app from './app.js';
import { initializeSocket } from './socket/index.js';
import connectDB from '../config/db.js';

const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initializeSocket(server);

connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const aiEventsWorker = new Worker(
  'ai-events',
  async (job) => {
    try {
      const data = job.data;
      io.to(data.conversationId).emit('messageReceived', { ...data });
      io.to(data.conversationId).emit('aiProcessing', {
        jobId: job.id,
        status: 'completed'
      });
      return { ok: true };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD
    },
    concurrency: 5
  }
);