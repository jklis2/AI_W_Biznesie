import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/order';
import { connectToDatabase } from '@/lib/db';
import { authenticateUser } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateUser(req);
    
    if (authResult instanceof NextResponse) {
      // If authResult is a NextResponse, it means authentication failed
      return authResult;
    }

    const userId = authResult.userId;

    // Connect to database
    await connectToDatabase();

    // Fetch orders for the user
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
