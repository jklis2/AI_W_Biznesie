import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/product";

// GET all products (with optional filtering by subcategory)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const subcategory = url.searchParams.get("subcategory");

    let query = {};
    if (subcategory) {
      query = { subcategory };
    }

    const products = await Product.find(query).populate("category subcategory");
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST a new product
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, slug, description, category, subcategory, brand, price, stock, images, specifications } = await req.json();
    
    const product = new Product({ name, slug, description, category, subcategory, brand, price, stock, images, specifications });
    await product.save();
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
