import ChatAssistant from '@/containers/ChatAssistant';
import PageHeader from '@/components/ui/PageHeader';

export default function AiAssistant() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="PC Store AI Assistant">
      <ChatAssistant />
    </PageHeader>
  );
}
