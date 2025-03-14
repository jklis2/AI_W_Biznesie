'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import OrderCard, { OrderCardProps } from '@/components/ui/OrderCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Fetch orders if authenticated
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="My Orders">
      <div className="p-5 w-full mx-auto">
        <h2 className="text-4xl font-bold mb-6">My Orders</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
            <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order._id} _id={order._id} status={order.status} totalAmount={order.totalAmount} items={order.items} createdAt={order.createdAt} shippingMethod={order.shippingMethod} />
            ))}
          </div>
        )}
      </div>
    </PageHeader>
  );
}
