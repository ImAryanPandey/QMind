import Groq from "groq-sdk";
import redisService from './redisService.js';
import chatService from './chatService.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class AIService {
  async generateResponse(conversationId, message, userId) {
    try {
      const relevantDocs = await this.retrieveDocuments(message);
      
      // 2. Build Context
      const systemPrompt = `You are a helpful assistant for QMind.
      Use the following context to answer the user's question if relevant:
      ${relevantDocs}
      
      If the context doesn't help, answer normally.`;

      const history = await this.getConversationHistory(conversationId);

      const response = await this.callGroqAPI(message, history, systemPrompt);

      await chatService.addMessage(conversationId, 'AI', response, 'ai');

      return response;
    } catch (error) {
      console.error('AI Gen Error:', error);
      return "I'm having trouble connecting to my brain right now.";
    }
  }


  async retrieveDocuments(query) {

    const knowledgeBase = await redisService.get('business_knowledge') || [];
    

    const relevant = knowledgeBase.filter(doc => 
      doc.content.toLowerCase().includes(query.toLowerCase().split(' ')[0])
    );
    
    return relevant.map(d => d.content).join('\n');
  }

  async getConversationHistory(conversationId) {
    const messages = await chatService.getMessagesByConversationId(conversationId);
    return messages.map(msg => ({
      role: msg.messageType === 'user' ? 'user' : 'assistant',
      content: msg.content
    })).slice(-10); // Keep last 10
  }

  async callGroqAPI(message, history, systemPrompt) {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
    });
    return completion.choices[0]?.message?.content || "No response";
  }
}

export default new AIService();