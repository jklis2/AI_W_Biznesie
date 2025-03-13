import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/db';
import { Cart, ICartItem } from "@/models/cart";
import { authenticateUser } from '@/middleware/authMiddleware';

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const itemId = context.params.id;

    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const { quantity } = await request.json();
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId: auth.userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find((item: ICartItem) => item._id.toString() === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Cart Update Error:", error);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const itemId = context.params.id;

    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    
    const cart = await Cart.findOne({ userId: auth.userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex((item: ICartItem) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Cart Delete Error:", error);
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 });
  }
}
