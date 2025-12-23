import chatService from '../services/chatService.js';
import { addAIJob } from '../services/queueService.js';
import ingestionService from '../services/ingestionService.js';

class ChatController {
  async createConversation(req, res) {
    try {
      const { participants, title } = req.body;
      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: 'Participants are required' });
      }
      const conversation = await chatService.createConversation(participants, title);
      res.status(201).json({ success: true, data: conversation });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const conversation = await chatService.getConversationById(conversationId);
      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const messages = await chatService.getMessagesByConversationId(conversationId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addMessage(req, res) {
    try {
      const { conversationId, sender, content, messageType = 'user' } = req.body;

      if (!conversationId || !sender || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const message = await chatService.addMessage(conversationId, sender, content, messageType);

      if (messageType === 'user') {
        console.log(`🚀 Triggering AI Job for chat: ${conversationId}`);
        await addAIJob({
          conversationId,
          message: content,
          userId: sender
        });
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUserConversations(req, res) {
    try {
      const { userId } = req.params;
      const conversations = await chatService.getUserConversations(userId);
      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async ingestDocument(req, res) {
    try {
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ message: "Title and Content required" });

      const result = await ingestionService.ingestDocument(title, content);
      res.status(200).json({ success: true, message: "Knowledge Ingested", stats: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ChatController();