'use client';

import { useState, useEffect } from 'react';
import CategoryList from '@/components/ui/CategoryList';
import ProductCard from '@/components/ui/ProductCard';

interface Product {
  _id: string;
  name: string;
  subcategory?: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  images: string[];
  specifications: Record<string, string | number | boolean>;
}

export default function Shope() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data: Product[] = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedSubcategory) {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedSubcategory, searchQuery]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pageNumbers.push(1, 2, 'input', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push(1, 'input', totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, 'input', currentPage - 1, currentPage, currentPage + 1, 'input', totalPages);
      }
    }

    return pageNumbers.map((number, index) =>
      typeof number === 'number' ? (
        <button key={index} onClick={() => paginate(number)} className={`w-10 h-10 flex items-center justify-center mx-1 ${currentPage === number ? 'bg-black text-white' : 'bg-gray-200'} rounded-md`}>
          {number}
        </button>
      ) : (
        <input
          key={index}
          type="text"
          className="w-10 h-10 flex items-center justify-center mx-1 border border-gray-300 rounded-md text-center bg-gray-200 text-black placeholder-gray-400"
          placeholder="..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              const pageNumber = Number(value);

              if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
                paginate(pageNumber);
              }
            }
          }}
          onBlur={e => {
            const value = (e.target as HTMLInputElement).value;
            const pageNumber = Number(value);

            if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
              paginate(pageNumber);
            }
          }}
          onInput={e => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9]/g, '');
          }}
        />
      ),
    );
  };

  return (
    <div className="relative flex flex-col items-center w-4/5 mx-auto rounded-t-lg -mt-10 bg-white">
      <div className="flex items-center justify-between py-5 px-5 w-full">
        <h1 className="text-4xl font-bold">Give All You Need</h1>
        <div className="relative flex items-center w-full max-w-md ml-4">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 w-5 h-5 text-gray-500">
            <path
              d="M17.0392 15.6244C18.2714 14.084 19.0082 12.1301 19.0082 10.0041C19.0082 5.03127 14.9769 1 10.0041 1C5.03127 1 1 5.03127 1 10.0041C1 14.9769 5.03127 19.0082 10.0041 19.0082C12.1301 19.0082 14.084 18.2714 15.6244 17.0392L21.2921 22.707C21.6828 23.0977 22.3163 23.0977 22.707 22.707C23.0977 22.3163 23.0977 21.6828 22.707 21.2921L17.0392 15.6244ZM10.0041 17.0173C6.1308 17.0173 2.99087 13.8774 2.99087 10.0041C2.99087 6.1308 6.1308 2.99087 10.0041 2.99087C13.8774 2.99087 17.0173 6.1308 17.0173 10.0041C17.0173 13.8774 13.8774 17.0173 10.0041 17.0173Z"
              fill="currentColor"></path>
          </svg>
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-full placeholder-gray-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
            <button className="bg-black text-white px-4 py-1 rounded-full">Search</button>
          </div>
        </div>
      </div>
      <div className="w-full mt-5 gap-5 flex">
        <CategoryList onSubcategorySelect={setSelectedSubcategory} selectedSubcategory={selectedSubcategory} />
        <div className="flex-1 grid grid-cols-3 gap-4">
          {currentProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-5 items-center w-full">
        <button
          onClick={() => paginate(currentPage - 1)}
          className={`w-10 h-10 flex items-center justify-center mx-1 ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-black text-white'} rounded-md`}
          disabled={currentPage === 1}>
          &lt;
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => paginate(currentPage + 1)}
          className={`w-10 h-10 flex items-center justify-center mx-1 ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-black text-white'} rounded-md`}
          disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>
    </div>
  );
}
