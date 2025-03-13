import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Płatność zakończona sukcesem!</h1>
        <p className="text-gray-600 mb-4">
          Dziękujemy za zakupy. Twoje zamówienie zostało przyjęte do realizacji.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
}
