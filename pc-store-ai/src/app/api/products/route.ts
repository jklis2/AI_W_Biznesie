import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';
import { uploadMultipleImages } from '@/lib/cloudinary';

// GET all products
export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database, fetching products...');
    const products = await Product.find().lean();
    console.log(`Found ${products.length} products`);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ message: 'Failed to fetch products', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// POST create a new product
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    if (data.imageFiles && Array.isArray(data.imageFiles) && data.imageFiles.length > 0) {
      try {
        const imageUrls = await uploadMultipleImages(data.imageFiles);
        data.images = imageUrls;
        delete data.imageFiles;
      } catch (uploadError) {
        return NextResponse.json({ 
          message: 'Failed to upload product images', 
          error: uploadError instanceof Error ? uploadError.message : String(uploadError) 
        }, { status: 400 });
      }
    }
    
    const newProduct = new Product(data);
    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Failed to create product', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 400 });
  }
}
