import { XCircle } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

export default function CancelPage() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Cancel">
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment has been canceled</h1>
          <p className="text-gray-600 mb-4">Your payment has been canceled. You can try again or return later.</p>
          <Link href="/checkout" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Return to Checkout
          </Link>
        </div>
      </div>
    </PageHeader>
  );
}
