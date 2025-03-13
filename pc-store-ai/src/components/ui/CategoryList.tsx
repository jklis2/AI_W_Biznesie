import { useState, useEffect } from 'react';

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  __v: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
  __v: number;
}

interface Props {
  onSubcategorySelect: (subcategory: string | null) => void;
  selectedSubcategory: string | null;
}

export default function CategoryList({ onSubcategorySelect, selectedSubcategory }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (subcategory: string, categoryId: string) => {
    onSubcategorySelect(subcategory);
    setActiveCategoryId(categoryId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-neutral-900">Category</h1>
      <ul className="space-y-2">
        <li
          key="all-products"
          className={`cursor-pointer p-2 pl-5 font-semibold text-neutral-600 ${selectedSubcategory === null && activeCategoryId === null ? 'bg-gray-100 rounded-lg' : ''}`}
          onClick={() => {
            onSubcategorySelect(null);
            setActiveCategoryId(null);
          }}>
          All Products
        </li>

        {categories.map(category => (
          <li key={category._id} className="space-y-2 group">
            <div
              className={`cursor-pointer p-2 pl-5 font-semibold text-neutral-600 flex items-center transition-colors ${
                activeCategoryId === category._id ? 'bg-gray-100 rounded-lg' : 'rounded-lg group-hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryClick(category._id)}>
              {category.name}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`ml-auto h-4 w-4 transform transition-transform duration-300 ${expandedCategoryId === category._id ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedCategoryId === category._id && category.subcategories && (
              <ul className="pl-4 ml- border-l border-gray-300">
                {category.subcategories.map((subcategory, index) => (
                  <li
                    key={subcategory._id}
                    className={`relative cursor-pointer p-2 text-neutral-600 ${selectedSubcategory === subcategory._id ? 'font-bold' : ''}`}
                    onClick={() => handleSubcategoryClick(subcategory._id, category._id)}>
                    <span
                      className={`absolute left-[-16px] top-[50%] h-[1px] w-[16px] bg-gray-300 ${
                        index === category.subcategories.length - 1 ? '' : 'before:absolute before:left-[50%] before:h-[50%] before:w-[1px] before:bg-gray-300'
                      }`}></span>
                    {subcategory.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
