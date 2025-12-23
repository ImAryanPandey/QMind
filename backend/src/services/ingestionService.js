import redisService from './redisService.js';

class IngestionService {
  
  async ingestDocument(title, content) {
    try {
      console.log(`📥 Ingesting document: ${title}`);

      let knowledgeBase = await redisService.get('business_knowledge') || [];
      
      knowledgeBase.push({
        id: Date.now(),
        title,
        content,
        timestamp: new Date()
      });
      
      await redisService.set('business_knowledge', knowledgeBase, 86400);
      
      return { success: true, count: knowledgeBase.length };
    } catch (error) {
      console.error('Ingestion failed:', error);
      throw new Error('Failed to ingest document');
    }
  }
}

export default new IngestionService();