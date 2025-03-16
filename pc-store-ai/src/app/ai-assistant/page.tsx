import ChatAssistant from '@/containers/ChatAssistant';
import PageHeader from '@/components/ui/PageHeader';
import { assistants } from '@/constants/assistants';

export default function AiAssistant() {
  const isOddCount = assistants.length % 2 !== 0;
  const lastItemIndex = assistants.length - 1;

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="PC Store AI Assistant">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {assistants.map((assistant, index) => (
          <div 
            key={index} 
            className={`${isOddCount && index === lastItemIndex ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}
          >
            <ChatAssistant 
              name={assistant.name}
              gradientFrom={assistant.gradientFrom}
              gradientTo={assistant.gradientTo}
              apiRoute={assistant.apiRoute}
              provider={assistant.provider}
            />
          </div>
        ))}
      </div>
    </PageHeader>
  );
}
