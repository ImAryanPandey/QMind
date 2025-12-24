import { useState } from 'react';
import { PaperAirplaneIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { uploadKnowledge } from '../services/api';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showIngest, setShowIngest] = useState(false);
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!ingestTitle || !ingestContent) return;

    setIsUploading(true);
    try {
      await uploadKnowledge(ingestTitle, ingestContent);
      alert('Knowledge Ingested Successfully! The AI can now use this context.');
      setIngestTitle('');
      setIngestContent('');
      setShowIngest(false);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload knowledge');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t border-gray-700 p-4 bg-gray-800">
      {showIngest && (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-white text-sm font-bold mb-2">Upload Knowledge (RAG)</h3>
          <input
            type="text"
            placeholder="Document Title"
            className="w-full mb-2 p-2 rounded bg-gray-600 text-white text-sm focus:outline-none"
            value={ingestTitle}
            onChange={(e) => setIngestTitle(e.target.value)}
          />
          <textarea
            placeholder="Paste document content here..."
            className="w-full mb-2 p-2 rounded bg-gray-600 text-white text-sm focus:outline-none h-24"
            value={ingestContent}
            onChange={(e) => setIngestContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowIngest(false)}
              className="px-3 py-1 text-xs text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleIngest}
              disabled={isUploading}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {isUploading ? 'Uploading...' : 'Ingest Knowledge'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowIngest(!showIngest)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Upload Knowledge Base"
        >
          <DocumentTextIcon className="h-6 w-6" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;