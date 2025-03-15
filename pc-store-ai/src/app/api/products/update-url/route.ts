import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/product';
import { uploadMultipleImages } from '@/lib/cloudinary';

export async function POST() {
  try {
    // Połączenie z bazą danych
    await connectToDatabase();
    console.log('Connected to database.');

    // Pobranie wszystkich produktów
    const products = await Product.find();
    console.log(`Found ${products.length} products.`);

    for (const product of products) {
      const updatedImages: string[] = [];

      console.log(`Processing product: ${product.name}`);

      for (const image of product.images) {
        if (image.startsWith('data:image')) {
          console.log('Base64 image detected. Uploading to Cloudinary...');
          const cloudinaryUrl = await uploadMultipleImages([image]);
          updatedImages.push(cloudinaryUrl[0]);
        } else {
          console.log(`Image already in URL format: ${image}`);
          updatedImages.push(image);
        }
      }

      // Aktualizacja obrazów w produkcie
      product.images = updatedImages;
      await product.save();
      console.log(`Updated images for product: ${product.name}`);
    }

    console.log('All products updated successfully.');
    return NextResponse.json({ message: 'All product image URLs updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating image URLs:', error);
    return NextResponse.json({ message: 'Failed to update image URLs', error }, { status: 500 });
  }
}
