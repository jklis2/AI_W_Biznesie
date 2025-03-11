import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/category';
import { Subcategory } from '@/models/subcategory';

// GET all subcategories
export async function GET() {
  try {
    await connectToDatabase();
    const subcategories = await Subcategory.find().populate('category');
    return NextResponse.json(subcategories);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch subcategories', error }, { status: 500 });
  }
}

// POST create a new subcategory and add it to category
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const newSubcategory = new Subcategory(data);
    await newSubcategory.save();

    await Category.findByIdAndUpdate(data.category, { $push: { subcategories: newSubcategory._id } });

    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create subcategory', error }, { status: 400 });
  }
}
