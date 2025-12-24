import redisService from './redisService.js';

class IngestionService {
  async ingestDocument(title, content) {
    try {
      let knowledgeBase = await redisService.get('business_knowledge') || [];
      
      knowledgeBase.push({
        id: Date.now(),
        title,
        content,
        timestamp: new Date()
      });
      
      await redisService.set('business_knowledge', knowledgeBase, 0); 
      
      return { success: true, count: knowledgeBase.length };
    } catch (error) {
      throw new Error('Failed to ingest document');
    }
  }
}

export default new IngestionService();