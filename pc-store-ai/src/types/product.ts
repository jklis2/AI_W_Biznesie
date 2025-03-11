export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string | {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: string | {
    _id: string;
    name: string;
    slug: string;
  };
  brand: string;
  price: number;
  stock: number;
  images: string[];
  specifications: Record<string, string | number | boolean>;
  createdAt?: string;
  updatedAt?: string;
}
