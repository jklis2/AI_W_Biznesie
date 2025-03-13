import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();
    console.log('Verifying session:', sessionId, 'for user:', userId);

    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session status:', session.payment_status);
    console.log('Session metadata:', session.metadata);

    if (session.payment_status === 'paid') {
      await connectToDatabase();

      // Get line items
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      console.log('Line items:', lineItems.data);

      // Check if order already exists
      const existingOrder = await Order.findOne({ paymentId: session.payment_intent });
      
      if (!existingOrder) {
        // Create order if it doesn't exist
        const { addressId, shippingMethod } = session.metadata!;
        
        const order = await Order.create({
          userId,
          addressId,
          shippingMethod,
          paymentId: session.payment_intent as string,
          status: 'PAID',
          totalAmount: session.amount_total! / 100,
          items: lineItems.data.map(item => ({
            name: item.description!,
            quantity: item.quantity!,
            price: item.price!.unit_amount! / 100,
          })),
        });
        console.log('Created order:', order);

        // Clear user's cart after successful payment
        const Cart = mongoose.models.Cart;
        if (Cart) {
          await Cart.deleteMany({ userId });
          console.log('Cleared cart for user:', userId);
        }
      } else {
        console.log('Order already exists:', existingOrder);
      }

      return NextResponse.json({ 
        status: 'success', 
        paymentStatus: session.payment_status 
      });
    }

    return NextResponse.json({ 
      status: 'pending', 
      paymentStatus: session.payment_status 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
