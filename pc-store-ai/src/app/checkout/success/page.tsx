'use client';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verificationStatus, setVerificationStatus] = useState('pending');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const userResponse = await fetch('/api/auth/session');
        const userData = await userResponse.json();
        console.log('User data:', userData);

        if (!userData.user || !userData.user.id) {
          console.error('No valid user session found');
          setVerificationStatus('error');
          return;
        }

        console.log('Current user:', userData.user);

        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userId: userData.user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Payment verification failed:', errorData);
          setVerificationStatus('error');
          return;
        }

        const data = await response.json();
        console.log('Payment verification result:', data);
        setVerificationStatus(data.status || 'success');
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
      }
    };

    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Success">
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {verificationStatus === 'success' ? 'Płatność zakończona sukcesem!' : verificationStatus === 'error' ? 'Wystąpił błąd podczas weryfikacji płatności' : 'Weryfikacja płatności...'}
          </h1>
          <p className="text-gray-600 mb-4">
            {verificationStatus === 'success'
              ? 'Dziękujemy za zakupy. Twoje zamówienie zostało przyjęte do realizacji.'
              : verificationStatus === 'error'
                ? 'Prosimy o kontakt z obsługą sklepu.'
                : 'Proszę czekać...'}
          </p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </PageHeader>
  );
}
