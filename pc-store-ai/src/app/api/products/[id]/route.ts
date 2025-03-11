import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';
import mongoose from 'mongoose';

// GET product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }
    const product = await Product.findById(params.id).populate('category subcategory');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch product', error }, { status: 500 });
  }
}

// PUT update product by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }
    const data = await req.json();
    const updatedProduct = await Product.findByIdAndUpdate(params.id, data, { new: true });
    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update product', error }, { status: 400 });
  }
}

// DELETE product by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }
    const deletedProduct = await Product.findByIdAndDelete(params.id);
    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete product', error }, { status: 500 });
  }
}
