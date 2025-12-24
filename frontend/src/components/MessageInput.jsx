import React, { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSendMessage, disabled }) {
  const [value, setValue] = useState('');
  const ref = useRef();

  // Auto-focus the input on load
  useEffect(() => ref.current?.focus(), []);

  const submit = (e) => {
    e?.preventDefault();
    if (!value.trim() || disabled) return;
    onSendMessage(value.trim());
    setValue('');
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-colors">
      <form 
        onSubmit={submit} 
        className="max-w-4xl mx-auto relative flex gap-3 items-center"
      >
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? "AI is processing..." : "Type your message..."}
          disabled={disabled}
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && !e.shiftKey) submit(e); 
          }}
        />
        <button 
          type="submit" 
          disabled={disabled || !value.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {/* Simple Send Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
}