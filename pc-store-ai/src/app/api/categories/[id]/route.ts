import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/category';
import { Subcategory } from '@/models/subcategory';
import mongoose from 'mongoose';

// GET category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }
    const category = await Category.findById(params.id).populate('subcategories');
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch category', error }, { status: 500 });
  }
}

// PUT update category by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

    const data = await req.json();

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (data.subcategories && Array.isArray(data.subcategories)) {
      const subcategoryIds = [];

      for (const subcategoryData of data.subcategories) {
        if (typeof subcategoryData === 'object' && !subcategoryData._id) {
          subcategoryData.category = params.id;
          const newSubcategory = new Subcategory(subcategoryData);
          await newSubcategory.save();
          subcategoryIds.push(newSubcategory._id);
        } else if (subcategoryData._id) {
          subcategoryIds.push(subcategoryData._id);
        }
      }
      data.subcategories = subcategoryIds;
    }

    const updatedCategory = await Category.findByIdAndUpdate(params.id, data, { new: true }).populate('subcategories');

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update category', error }, { status: 500 });
  }
}

// DELETE category by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (category.subcategories && category.subcategories.length > 0) {
      await Subcategory.deleteMany({ _id: { $in: category.subcategories } });
    }

    await Category.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete category', error }, { status: 500 });
  }
}
