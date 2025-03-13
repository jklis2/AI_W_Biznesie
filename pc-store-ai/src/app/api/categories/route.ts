import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/category';

// GET all categories with subcategories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().populate('subcategories');
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST create a new category
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const newCategory = new Category(data);
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
