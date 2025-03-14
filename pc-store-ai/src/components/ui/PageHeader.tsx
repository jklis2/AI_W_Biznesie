import Navbar from '@/components/layout/Navbar';

interface PageHeaderProps {
  backgroundImage: string;
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ backgroundImage, title, children }: PageHeaderProps) {
  return (
    <div className="relative">
      <header className={`bg-amber-800 relative h-96 pb-10 flex flex-col items-center justify-between bg-cover bg-center`} 
        style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="h-full w-full inset-0 bg-black opacity-10 absolute sm:rounded-2xl" />
        <Navbar />
        <h1 className="font-bold text-white text-8xl mb-10 relative">{title}</h1>
      </header>
      <div className="relative flex flex-col items-center w-4/5 mx-auto rounded-t-lg -mt-10 bg-white">
        {children}
      </div>
    </div>
  );
}
