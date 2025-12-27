import Groq from "groq-sdk";
import redisService from './redisService.js';
import chatService from './chatService.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class AIService {
  async generateResponse(conversationId, message, userId) {
    try {
      const relevantDocs = await this.retrieveDocuments(message);
      
      // LOGGING: See if context was actually found
      if (relevantDocs) {
        console.log("✅ Context Found & Injected into AI Prompt");
      } else {
        console.log("⚠️ No Relevant Context Found (Falling back to General Knowledge)");
      }

      const systemPrompt = `You are a helpful assistant for QMind.
      Use the following context to answer the user's question if relevant.
      Context:
      ${relevantDocs}
      
      If the context doesn't help, answer normally based on your general knowledge.`;

      const history = await this.getConversationHistory(conversationId);
      const response = await this.callGroqAPI(message, history, systemPrompt);
      await chatService.addMessage(conversationId, 'AI', response, 'ai');

      return response;
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I am currently unable to process your request.";
    }
  }

  async retrieveDocuments(query) {
    const knowledgeBase = await redisService.get('business_knowledge') || [];
    
    if (!knowledgeBase || knowledgeBase.length === 0) {
      console.log("🔴 Redis Knowledge Base is EMPTY! (Did data expire?)");
      return "";
    }

    const keywords = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(w => w.length > 1); 

    if (keywords.length === 0) return "";

    const scoredDocs = knowledgeBase.map(doc => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();
      keywords.forEach(word => {
        if (contentLower.includes(word)) score++;
      });
      return { ...doc, score };
    });

    // Sort by score and take top 3
    const relevant = scoredDocs
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return relevant.map(d => d.content).join('\n\n');
  }

  async getConversationHistory(conversationId) {
    const messages = await chatService.getMessagesByConversationId(conversationId);
    return messages.map(msg => ({
      role: msg.messageType === 'user' ? 'user' : 'assistant',
      content: msg.content
    })).slice(-6); 
  }

  async callGroqAPI(message, history, systemPrompt) {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || "No response generated.";
  }
}

export default new AIService();