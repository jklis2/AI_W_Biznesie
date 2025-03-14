import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';
import { uploadMultipleImages } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const data = await req.json();
    
    if (!data.productId || !data.images || !Array.isArray(data.images)) {
      return NextResponse.json(
        { message: 'Invalid request. Required fields: productId, images (array of base64 strings)' },
        { status: 400 }
      );
    }

    const product = await Product.findById(data.productId);
    if (!product) {
      return NextResponse.json(
        { message: `Product with ID ${data.productId} not found` },
        { status: 404 }
      );
    }

    const imageUrls = await uploadMultipleImages(data.images);

    if (data.replaceExisting) {
      product.images = imageUrls;
    } else {
      product.images = [...product.images, ...imageUrls];
    }
    
    await product.save();

    return NextResponse.json({
      message: 'Images uploaded successfully',
      product: {
        id: product._id,
        name: product.name,
        images: product.images
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading product images:', error);
    return NextResponse.json(
      { message: 'Failed to upload images', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
