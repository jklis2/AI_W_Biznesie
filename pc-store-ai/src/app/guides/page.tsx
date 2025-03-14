import PageHeader from '@/components/ui/PageHeader';
import GuideCard from '@/components/ui/GuideCard';
import GUIDES from '@/constants/guides';

export default function Guides() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Guides">
      <div className="py-5 px-5 w-full">
        <h2 className="text-4xl font-bold">Guides</h2>
        <div className="mt-8">
          {GUIDES.map((guide) => (
            <GuideCard
              key={guide.id}
              title={guide.title}
              content={guide.content}
            />
          ))}
        </div>
      </div>
    </PageHeader>
  )
}