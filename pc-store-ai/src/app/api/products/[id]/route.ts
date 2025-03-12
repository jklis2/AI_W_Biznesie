import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findById(id).populate('category subcategory');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    const data = await request.json();
    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
}
