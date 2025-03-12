import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/db';
import { Cart, ICartItem } from "@/models/cart";
import { authenticateUser } from "@/middleware/authMiddleware";

interface CartError extends Error {
  code?: number;
}

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    if (!params?.id) {
      return NextResponse.json({ error: "Product ID is missing" }, { status: 400 });
    }

    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const productId = params.id;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId: auth.userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find(
      (item: ICartItem) => item.productId.toString() === productId
    );

    if (!item) {
      return NextResponse.json({ error: "Product not found in cart" }, { status: 404 });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(updatedCart);
  } catch (error: unknown) {
    console.error("Cart Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const productId = params.id;

    await connectToDatabase();
    
    const cart = await Cart.findOne({ userId: auth.userId });
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Product not found in cart" },
        { status: 404 }
      );
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(updatedCart);
  } catch (error: unknown) {
    const cartError = error as CartError;
    return NextResponse.json(
      { error: cartError.message || "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
