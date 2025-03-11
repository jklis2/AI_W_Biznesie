import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';

// GET all products
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find().populate('category subcategory');
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch products', error }, { status: 500 });
  }
}

// POST create a new product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const newProduct = new Product(data);
    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create product', error }, { status: 400 });
  }
}
