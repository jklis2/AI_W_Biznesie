"use client"

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types/product';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">All products</h1>
      
      {loading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10 text-gray-500">
          No products found
        </p>
      )}
    </div>
  );
}