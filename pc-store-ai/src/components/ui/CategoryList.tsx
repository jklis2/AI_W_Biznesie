'use client';

import { useEffect, useState } from 'react';

interface Subcategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  subcategories?: Subcategory[];
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch('/api/categories');
      const data: Category[] = await response.json();
      setCategories(data.map(category => ({ ...category, subcategories: category.subcategories || [] })));
    }

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-neutral-900">Category</h1>
      <ul className="space-y-2">
        <li key="all-products" className="cursor-pointer p-2 font-semibold text-neutral-600">
          All Products
        </li>
        {categories.map(category => (
          <li key={category._id} className={`cursor-pointer p-2 text-neutral-600 ${expandedCategoryId === category._id ? '' : ''}`} onClick={() => toggleCategory(category._id)}>
            <div className="font-semibold flex items-center justify-between">
              {category.name}
              {expandedCategoryId === category._id ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path
                    d="M18.2929 15.2893C18.6834 14.8988 18.6834 14.2656 18.2929 13.8751L13.4007 8.98766C12.6195 8.20726 11.3537 8.20757 10.5729 8.98835L5.68257 13.8787C5.29205 14.2692 5.29205 14.9024 5.68257 15.2929C6.0731 15.6835 6.70626 15.6835 7.09679 15.2929L11.2824 11.1073C11.673 10.7168 12.3061 10.7168 12.6966 11.1073L16.8787 15.2893C17.2692 15.6798 17.9024 15.6798 18.2929 15.2893Z"
                    fill="#0F0F0F"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path
                    d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                    fill="#0F0F0F"></path>
                </svg>
              )}
            </div>
            {expandedCategoryId === category._id && category.subcategories && category.subcategories.length > 0 && (
              <ul className="pt-2">
                {category.subcategories?.map((subcategory, index) => {
                  const isLast = index === category.subcategories!.length - 1;
                  const isSingle = category.subcategories!.length === 1;

                  return (
                    <li key={subcategory._id} className={`relative flex items-center pl-8 ${!isLast ? 'pb-2' : ''}`} onClick={e => e.stopPropagation()}>
                      <span className={`absolute left-[10px] w-[16px] h-[2px] bg-gray-300 ${isLast || isSingle ? 'rounded-r-full' : ''} ${isSingle ? 'rounded-l-full' : ''}`}></span>
                      <span
                        className={`absolute left-[10px] top-0 w-[2px] bg-gray-300 ${isLast || isSingle ? 'h-[50%] rounded-b-full' : 'h-full'}`}
                        style={{
                          borderRadius: isLast || isSingle ? '0 0 4px 4px' : '0',
                        }}></span>
                      <span>{subcategory.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
