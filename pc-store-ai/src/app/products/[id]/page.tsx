'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: string[];
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  subcategory: Subcategory;
  brand: string;
  price: number;
  stock: number;
  images: string[];
  specifications: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ProductPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product');
        }

        setProduct(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const addToCart = async () => {
    if (!product) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">Product not found</div>
      </div>
    );
  }

  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Product">
      <div className="mx-auto w-full p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] bg-white rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 && !imageError ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-contain" priority onError={() => setImageError(true)} />
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

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {product.category.name} / {product.subcategory.name}
              </p>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-1">Brand: {product.brand}</p>
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="text-2xl font-bold text-blue-600">{product.price.toFixed(2)} PLN</div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium min-w-[120px]">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Stock: <span className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</span>
            </div>

            <button
              className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:bg-gray-400 cursor-pointer"
              disabled={product.stock === 0 || isLoading}
              onClick={addToCart}>
              {isLoading ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </PageHeader>
  );
};

export default ProductPage;
