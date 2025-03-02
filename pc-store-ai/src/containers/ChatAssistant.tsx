'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  id: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your PC Store AI assistant. How can I help you today?",
      role: 'assistant',
      id: '1'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestedQuestions = [
    "Which processor works best with RTX 4070?",
    "What cooling solution for Ryzen 7 7800X?",
    "Best RAM for gaming PC?",
    "Budget motherboard recommendations?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newUserMessage: Message = {
      content,
      role: 'user',
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    
    setIsTyping(true);
    
    setTimeout(() => {
      const aiResponse: Message = {
        content: `I've received your question about "${content}". Here's what I can tell you about PC components related to your query...`,
        role: 'assistant',
        id: (Date.now() + 1).toString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const startNewConversation = () => {
    setMessages([
      {
        content: "Hello! I'm your PC Store AI assistant. How can I help you today?",
        role: 'assistant',
        id: Date.now().toString()
      }
    ]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v5.8a2.25 2.25 0 01-1.5 2.25m0 0a4.5 4.5 0 01-1.5.25m1.5-.25v-5.8a2.25 2.25 0 00-1.5-2.25m0 0V3.104m0 0a24.301 24.301 0 00-4.5 0" />
            </svg>
            PC Store AI Assistant
          </h2>
          <button 
            onClick={startNewConversation}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Conversation</span>
          </button>
        </div>
        
        {/* Suggested Questions */}
        <div className="bg-gray-50 p-3 flex flex-wrap gap-2 border-b border-gray-100">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className="bg-white text-indigo-600 border border-indigo-200 rounded-full px-4 py-1.5 text-sm hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {question}
            </button>
          ))}
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs mr-2 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  } shadow-sm`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs ml-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs mr-2 mt-1">
                  AI
                </div>
                <div className="bg-white text-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your PC build..."
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-3 rounded-full ${
                input.trim() 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } transition-colors shadow-sm`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}