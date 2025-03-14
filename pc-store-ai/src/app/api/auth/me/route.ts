import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { authenticateUser } from '@/middleware/authMiddleware';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  addresses?: Array<{
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    country: string;
  }>;
  password?: {
    currentPassword: string;
    newPassword: string;
  };
}

// Get user data
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const user = await User.findById(auth.userId).select('-password').select('firstName lastName email role addresses');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Update user data
export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const updateData: UpdateUserData = await req.json();

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: UpdateUserData = {};
    if (updateData.firstName) updates.firstName = updateData.firstName;
    if (updateData.lastName) updates.lastName = updateData.lastName;
    if (updateData.email) updates.email = updateData.email;
    if (updateData.addresses) updates.addresses = updateData.addresses;
    if (updateData.password) {
      const isMatch = await bcrypt.compare(updateData.password.currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      updates.password = await bcrypt.hash(updateData.password.newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(auth.userId, { $set: updates }, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
