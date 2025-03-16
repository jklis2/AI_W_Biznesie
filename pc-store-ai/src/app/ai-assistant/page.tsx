'use client';

import { createRef } from 'react';
import ChatAssistant, { ChatAssistantRef } from '@/containers/ChatAssistant';
import PageHeader from '@/components/ui/PageHeader';
import { assistants } from '@/constants/assistants';
import { generateAllChatsSummary } from '@/utils/generateExcelSummary';

export default function AiAssistant() {
  const isOddCount = assistants.length % 2 !== 0;
  const lastItemIndex = assistants.length - 1;
  
  // Create refs for each chat assistant
  const chatRefsArray = assistants.map(() => createRef<ChatAssistantRef>());

  const handleGenerateSummary = () => {
    generateAllChatsSummary(chatRefsArray);
  };

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="PC Store AI Assistant">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {assistants.map((assistant, index) => (
          <div 
            key={index} 
            className={`${isOddCount && index === lastItemIndex ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}
          >
            <ChatAssistant 
              ref={chatRefsArray[index]}
              name={assistant.name}
              gradientFrom={assistant.gradientFrom}
              gradientTo={assistant.gradientTo}
              apiRoute={assistant.apiRoute}
              provider={assistant.provider}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 mb-12">
        <button 
          onClick={handleGenerateSummary}
          className="px-4 py-2 w-64 bg-black text-white rounded-md hover:bg-slate-800 hover:cursor-pointer transition"
        >
          Generate Summary
        </button>
      </div>
    </PageHeader>
  );
}
