import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import IngestModal from './IngestModal';

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showIngest, setShowIngest] = useState(false);
  
  const userIdRef = useRef(`user-${Math.floor(Math.random() * 1000000)}`);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('createConversation', { participants: [userIdRef.current], title: 'New Chat' });
    });

    socket.on('conversationCreated', (data) => {
      setConversationId(data.conversationId);
      socket.emit('joinConversation', data.conversationId);
    });

    socket.on('messageReceived', (msg) => {
      setMessages((prev) => {
        const exists = prev.some(p => p.timestamp === msg.timestamp && p.content === msg.content);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on('aiProcessing', (data) => {
      setIsTyping(data.status === 'processing');
    });

    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('error'));

    return () => socket.disconnect();
  }, []);

  const sendMessage = (content) => {
    if (!conversationId) return;
    const message = {
      conversationId,
      sender: userIdRef.current,
      content,
      messageType: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, message]);
    socketRef.current.emit('newMessage', message);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        connectionStatus={connectionStatus} 
        onOpenIngest={() => setShowIngest(true)}
      />
      
      <div className="flex-1 overflow-auto relative">
        <MessageList messages={messages} />
        {isTyping && (
          <div className="px-6 pb-4 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
               <span className="typing-dot" /> <span className="typing-dot" /> <span className="typing-dot" />
               <span className="ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <MessageInput onSendMessage={sendMessage} disabled={isTyping} />
      
      <IngestModal isOpen={showIngest} onClose={() => setShowIngest(false)} />
    </div>
  );
}