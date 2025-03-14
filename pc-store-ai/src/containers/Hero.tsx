import Navbar from '@/components/layout/Navbar';

export default function Hero() {
  return (
    <header className="bg-amber-800 relative h-96 pb-10 flex flex-col items-center justify-between bg-[url('/headerBackgrounds/home.jpg')] bg-cover bg-center">
      <div className="h-full w-full inset-0 bg-black opacity-10 absolute sm:rounded-2xl" />
      <Navbar />
      <h1 className="font-bold text-white text-8xl mb-10 relative">Browse Our Products</h1>
    </header>
  );
}
