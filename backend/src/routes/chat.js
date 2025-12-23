import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

// Chat Routes
router.post('/conversation', chatController.createConversation);
router.get('/conversation/:conversationId', chatController.getConversation);
router.get('/conversation/:conversationId/messages', chatController.getMessages);
router.post('/message', chatController.addMessage);
router.get('/user/:userId/conversations', chatController.getUserConversations);

// Ingestion Pipeline
router.post('/ingest', chatController.ingestDocument); 

export default router;