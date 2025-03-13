import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    console.log('Received webhook request');

    if (!signature) {
      console.log('No signature found');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook event type:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session metadata:', session.metadata);
      const { userId, addressId, shippingMethod } = session.metadata!;

      await connectToDatabase();
      console.log('Connected to database');

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      console.log('Line items:', lineItems.data);

      try {
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

        const Cart = mongoose.models.Cart;
        if (Cart) {
          await Cart.deleteMany({ userId });
          console.log('Cleared cart for user:', userId);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
