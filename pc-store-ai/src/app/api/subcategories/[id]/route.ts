import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subcategory } from '@/models/subcategory';
import { Category } from '@/models/category';
import mongoose from 'mongoose';

// GET subcategory by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid subcategory ID' }, { status: 400 });
    }
    const subcategory = await Subcategory.findById(params.id).populate('category');
    if (!subcategory) {
      return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
    }
    return NextResponse.json(subcategory);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch subcategory', error }, { status: 500 });
  }
}

// PUT update subcategory by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid subcategory ID' }, { status: 400 });
    }

    const data = await req.json();
    const subcategory = await Subcategory.findById(params.id);

    if (!subcategory) {
      return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
    }

    if (data.category && subcategory.category.toString() !== data.category) {
      await Category.findByIdAndUpdate(subcategory.category, { $pull: { subcategories: subcategory._id } });

      await Category.findByIdAndUpdate(data.category, { $push: { subcategories: subcategory._id } });
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(params.id, data, { new: true }).populate('category');

    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update subcategory', error }, { status: 500 });
  }
}

// DELETE subcategory by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid subcategory ID' }, { status: 400 });
    }

    const subcategory = await Subcategory.findById(params.id);
    if (!subcategory) {
      return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
    }

    await Category.findByIdAndUpdate(subcategory.category, { $pull: { subcategories: subcategory._id } });

    await Subcategory.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete subcategory', error }, { status: 500 });
  }
}
