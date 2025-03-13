import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthSession } from '@/lib/auth';
import { PaymentRequestBody, CartItem } from '@/types/payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    console.log('Auth session:', session);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingMethod, addressId }: PaymentRequestBody = await req.json();
    console.log('User ID:', session.user.id);

    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: 'pln',
        product_data: {
          name: item.productId.name,
          images: item.productId.images,
        },
        unit_amount: Math.round(item.productId.price * 100),
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout/cancel`,
      metadata: {
        userId: session.user.id,
        addressId,
        shippingMethod,
      },
    });

    console.log('Created Stripe session with metadata:', stripeSession.metadata);
    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
