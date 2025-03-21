'use client';

import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Assistant } from '@/constants/assistants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatAssistantProps = Assistant & {
  apiRoute: string;
  provider: string;
};

interface Message {
  content: string;
  role: 'user' | 'assistant';
  id: string;
}

export interface ChatAssistantRef {
  getMessages: () => Message[];
  getName: () => string;
}

const ChatAssistant = forwardRef<ChatAssistantRef, ChatAssistantProps>(
  ({ name, gradientFrom, gradientTo, apiRoute, provider }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        content: `Hello! I'm your ${name} AI assistant. How can I help you today?`,
        role: 'assistant',
        id: '1',
      },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getMessages: () => messages,
      getName: () => name
    }));

    const suggestedQuestions = [
      'I need a gaming PC with RTX 4090 and Ryzen 7. Budget 15000 PLN',
      'Looking for a computer for a programmer. Budget 10000 PLN',
      'I need a computer for a streamer',
      'What PC can I get for 5000 PLN?',
    ];

    const handleSendMessage = async (content: string) => {
      if (!content.trim()) return;

      const newUserMessage: Message = {
        content,
        role: 'user',
        id: Date.now().toString(),
      };

      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setIsTyping(true);

      try {
        const response = await fetch(apiRoute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: content }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const aiResponse: Message = {
          content: data.reply,
          role: 'assistant',
          id: (Date.now() + 1).toString(),
        };

        setMessages(prev => [...prev, aiResponse]);
      } catch (err) {
        console.error('Failed to get AI response:', err);
        const errorMessage: Message = {
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          role: 'assistant',
          id: (Date.now() + 1).toString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
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
          content: `Hello! I'm your ${name} AI assistant. How can I help you today?`,
          role: 'assistant',
          id: Date.now().toString(),
        },
      ]);
    };

    // Style objects for dynamic gradients
    const gradientStyle = {
      background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
      '--tw-gradient-from': `var(--${gradientFrom})`,
      '--tw-gradient-to': `var(--${gradientTo})`,
    } as React.CSSProperties;

    // Custom styles for markdown content
    const markdownStyles = {
      table: "min-w-full divide-y divide-gray-300 border border-gray-300 rounded-md overflow-hidden my-4",
      thead: "bg-gray-100",
      tbody: "bg-white divide-y divide-gray-200",
      tr: "hover:bg-gray-50 transition-colors",
      th: "px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider",
      td: "px-4 py-3 text-sm text-gray-800 border-t border-gray-200",
      h3: "text-xl font-bold mt-4 mb-3 text-gray-800",
      h4: "text-lg font-semibold mt-3 mb-2 text-gray-700",
      code: "bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800",
      codeBlock: "bg-gray-100 p-3 rounded-md text-sm font-mono text-gray-800 overflow-x-auto my-3 border border-gray-200",
    };

    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[800px] border border-gray-100">
          {/* Header */}
          <div className="text-white p-4 flex justify-between items-center" style={gradientStyle}>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v5.8a2.25 2.25 0 01-1.5 2.25m0 0a4.5 4.5 0 01-1.5.25m1.5-.25v-5.8a2.25 2.25 0 00-1.5-2.25m0 0V3.104m0 0a24.301 24.301 0 00-4.5 0"
                  />
                </svg>
                {name}
              </h2>
              <p className="text-sm text-white/80 mt-1">Powered by {provider}</p>
            </div>
            <button onClick={startNewConversation} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
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
                className="bg-white text-indigo-600 border border-indigo-200 rounded-full px-4 py-1.5 text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                {question}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-1" style={gradientStyle}>AI</div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    } shadow-sm`}
                    style={message.role === 'user' ? gradientStyle : undefined}>
                    {message.role === 'assistant' ? (
                      <div className="markdown-content prose prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: props => (
                              <div className="overflow-x-auto my-3 rounded-md border border-gray-300">
                                <table className={markdownStyles.table} {...props} />
                              </div>
                            ),
                            thead: props => <thead className={markdownStyles.thead} {...props} />,
                            tbody: props => <tbody className={markdownStyles.tbody} {...props} />,
                            tr: props => <tr className={markdownStyles.tr} {...props} />,
                            th: props => <th className={markdownStyles.th} {...props} />,
                            td: props => <td className={markdownStyles.td} {...props} />,
                            h1: props => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900" {...props} />,
                            h2: props => <h2 className="text-xl font-bold mt-3 mb-2 text-gray-800" {...props} />,
                            h3: props => <h3 className={markdownStyles.h3} {...props} />,
                            h4: props => <h4 className={markdownStyles.h4} {...props} />,
                            p: props => <p className="mb-3 text-gray-700" {...props} />,
                            ul: props => <ul className="list-disc pl-5 mb-3 text-gray-700 space-y-1" {...props} />,
                            ol: props => <ol className="list-decimal pl-5 mb-3 text-gray-700 space-y-1" {...props} />,
                            li: props => <li className="mb-1" {...props} />,
                            code: (props) => {
                              const {inline, ...rest} = props as {inline: boolean; children: React.ReactNode};
                              return inline 
                                ? <code className={markdownStyles.code} {...rest} />
                                : <code className={markdownStyles.codeBlock} {...rest} />;
                            },
                            pre: props => <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-3 border border-gray-200" {...props} />,
                            blockquote: props => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-600" {...props} />,
                            a: props => <a className="text-blue-600 hover:underline" {...props} />,
                            strong: props => <strong className="font-bold text-gray-900" {...props} />,
                            em: props => <em className="italic text-gray-800" {...props} />,
                            hr: props => <hr className="my-4 border-t border-gray-300" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs ml-2 mt-1" style={gradientStyle}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-1" style={gradientStyle}>AI</div>
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
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question about your PC build..."
                className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`p-3 rounded-full ${
                  input.trim() ? 'text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors shadow-sm`}
                style={input.trim() ? gradientStyle : undefined}>
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
);

// Add display name to the component
ChatAssistant.displayName = 'ChatAssistant';

export default ChatAssistant;
