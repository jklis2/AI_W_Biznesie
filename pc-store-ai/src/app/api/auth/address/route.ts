import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { Types } from 'mongoose';
import { authenticateUser } from '@/middleware/authMiddleware';

interface Address {
  _id?: Types.ObjectId;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

// GET /api/auth/address - Get user addresses
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;
    
    await connectToDatabase();
    const user = await User.findById(auth.userId).select('addresses');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      data: user.addresses || [] 
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/auth/address - Add new address
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;

    const address = await req.json() as Address;

    if (!address.street || !address.houseNumber || !address.city || !address.postalCode || !address.country) {
      return NextResponse.json({ error: 'All address fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.addresses.push(address);
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];

    return NextResponse.json({ 
      success: true,
      data: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/auth/address - Remove address
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;

    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.addresses = user.addresses.filter((addr: Address) => addr._id?.toString() !== addressId);
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
