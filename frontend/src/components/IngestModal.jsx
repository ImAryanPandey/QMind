import React, { useState } from 'react';

export default function IngestModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleIngest = async (e) => {
    e.preventDefault();
    setStatus('ingesting');
    
    try {
      const res = await fetch('http://localhost:5000/api/chat/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      if (!res.ok) throw new Error('Failed');
      
      setStatus('success');
      setTimeout(() => {
        setStatus('');
        setTitle('');
        setContent('');
        onClose();
      }, 1500);
    } catch (err) {
      setStatus('error', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Add Knowledge</h2>
        <form onSubmit={handleIngest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Company Return Policy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
            <textarea 
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 rounded-lg border h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Paste the document text here..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button 
              type="submit" 
              disabled={status === 'ingesting' || status === 'success'}
              className={`px-4 py-2 text-white rounded-lg transition ${
                status === 'success' ? 'bg-green-600' : 
                status === 'error' ? 'bg-red-600' : 
                'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {status === 'ingesting' ? 'Uploading...' : 
               status === 'success' ? 'Saved!' : 
               status === 'error' ? 'Failed' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}