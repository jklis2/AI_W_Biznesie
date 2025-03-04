import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/category";

// GET all categories with subcategories populated
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().populate("subcategories");
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, slug, subcategories } = await req.json();

    const category = new Category({ name, slug, subcategories });
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
