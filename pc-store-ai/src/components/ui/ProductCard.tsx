'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const specEntries = Object.entries(product.specifications || {});
  const firstFiveSpecs = specEntries.slice(0, 5);

  const addToCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add to cart' }));
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      toast.success('Added to cart');
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('Authentication required')) {
        toast.error('Please log in to add items to cart');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        {product.images && product.images.length > 0 && !imageError ? (
          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} className="transition-opacity duration-300" onError={() => setImageError(true)} />
        ) : (
          <div className="text-gray-500 text-center p-4 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>No photo</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
        </Link>

        <div className="mb-4">
          {firstFiveSpecs.map(([key, value], index) => (
            <p key={index} className="text-sm text-gray-600">
              <span className="font-medium">{key}:</span> {value}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{product.price.toLocaleString()} PLN</p>

          <div className="relative">
            <button 
              onClick={addToCart}
              disabled={isLoading}
              className={`p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              aria-label="Add to cart"
            >
              <Image src="/icons/addToCart.svg" alt="Add to cart" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
