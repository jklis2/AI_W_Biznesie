'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart(data);
      setError(null);
    } catch (error) {
      console.error('Fetch cart error:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quantity');
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      setError(null);
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Update quantity error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update quantity');
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!itemId) {
      console.error('Invalid item ID');
      setError('Cannot remove item: Invalid ID');
      return;
    }

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove item');
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
      setError(null);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove item');
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.productId ? item.productId.price * item.quantity : 0);
    }, 0);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Cart">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">{error}</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Continue Shopping
            </Link>
          </div>
        </div>
      </PageHeader>
    );
  }

  if (!cart?.items?.length) {
    return (
      <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Cart">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Continue Shopping
            </Link>
          </div>
        </div>
      </PageHeader>
    );
  }

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Cart">
      <div className="w-full mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item._id} className="flex items-center bg-white p-4 rounded-lg shadow">
              <div className="relative h-24 w-24 bg-gray-100 rounded flex items-center justify-center">
                {item.productId?.images?.[0] && !imageErrors[item._id] ? (
                  <Image
                    src={item.productId.images[0]}
                    alt={item.productId?.name || 'Product image'}
                    width={96}
                    height={96}
                    className="object-contain rounded"
                    onError={() => handleImageError(item._id)}
                  />
                ) : (
                  <div className="text-gray-500 text-center flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs">No photo</span>
                  </div>
                )}
              </div>

              <div className="flex-grow ml-6">
                <h3 className="text-lg font-semibold">{item.productId?.name}</h3>
                <p className="text-gray-600">{item.productId?.price?.toFixed(2).replace('.', ',')} PLN</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.quantity <= 1}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <button onClick={() => removeItem(item._id)} className="text-red-600 hover:text-red-800">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Link href="/checkout" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors">
            Proceed to Checkout
          </Link>
          <div className="text-xl font-semibold">Total: {calculateTotal().toFixed(2).replace('.', ',')} PLN</div>
        </div>
      </div>
    </PageHeader>
  );
}
