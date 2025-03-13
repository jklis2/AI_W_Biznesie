import { NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/authMiddleware';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return NextResponse.json({ 
      user: {
        id: authResult.userId,
        email: authResult.user.email
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
