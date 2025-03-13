import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Cart, ICartItem } from '@/models/cart';
import { authenticateUser } from '@/middleware/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: auth.userId }).populate({
      path: 'items.productId',
      select: '_id name price images'
    });

    if (!cart) {
      return NextResponse.json({
        _id: "",
        userId: auth.userId,
        items: []
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const { productId, quantity } = await request.json();

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: "Product ID is required and must be a string" }, { status: 400 });
    }

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity, must be a positive integer" }, { status: 400 });
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

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: '_id name price images'
    });

    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
