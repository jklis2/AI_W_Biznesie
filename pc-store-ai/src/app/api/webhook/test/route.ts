import { NextResponse } from 'next/server';

export async function POST() {
  console.log('Test webhook received');
  return NextResponse.json({ received: true });
}

export async function GET() {
  console.log('Test webhook GET received');
  return NextResponse.json({ status: 'Webhook endpoint is working' });
}
