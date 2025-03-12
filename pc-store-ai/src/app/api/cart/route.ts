import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/db';
import { Cart, ICartItem } from "@/models/cart";
import { authenticateUser } from "@/middleware/authMiddleware";

interface CartError extends Error {
  code?: number;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: auth.userId }).populate('items.productId');

    return NextResponse.json(cart || { userId: auth.userId, items: [] });
  } catch (error: unknown) {
    const cartError = error as CartError;
    return NextResponse.json(
      { error: cartError.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    let cart = await Cart.findOne({ userId: auth.userId });
    
    if (!cart) {
      cart = await Cart.create({
        userId: auth.userId,
        items: [{ productId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(
        (item: ICartItem) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(populatedCart);
  } catch (error: unknown) {
    const cartError = error as CartError;
    return NextResponse.json(
      { error: cartError.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}
