import { Server } from 'socket.io';
import { addAIJob } from '../services/queueService.js';
import chatService from '../services/chatService.js';

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    socket.on('createConversation', async (data) => {
      try {
        const conversation = await chatService.createConversation(
          data.participants,
          data.title
        );
        socket.emit('conversationCreated', {
          conversationId: conversation.conversationId
        });
      } catch (error) {
        socket.emit('errorMessage', { message: 'Failed to create conversation' });
      }
    });

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('newMessage', async (data) => {
      try {
        io.to(data.conversationId).emit('messageReceived', {
          ...data,
          timestamp: new Date().toISOString()
        });

        const jobId = await addAIJob({
          conversationId: data.conversationId,
          message: data.content,
          userId: data.sender
        });

        io.to(data.conversationId).emit('aiProcessing', {
          jobId,
          status: 'processing'
        });
      } catch (error) {
        socket.emit('errorMessage', { message: 'Failed to process message' });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized yet!');
  return io;
};

export { initializeSocket, getIO };