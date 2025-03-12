import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';

interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

interface Address {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

// GET /api/auth/address - Get user addresses
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('addresses');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      data: user.addresses || [] 
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/auth/address - Add new address
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    const address = await req.json() as Address;

    if (!address.street || !address.houseNumber || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json({ error: 'All address fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newAddress = {
      _id: new Date().getTime().toString(),
      ...address
    };

    user.addresses = user.addresses || [];
    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({ 
      success: true,
      data: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
