import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { authenticateUser } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const user = await User.findById(auth.userId)
      .select('-password')
      .select('firstName lastName email role addresses');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
