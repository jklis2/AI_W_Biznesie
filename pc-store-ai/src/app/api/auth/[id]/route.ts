import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  addresses?: Array<{
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    country: string;
  }>;
  password?: string;
}

// Edit user data
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const updateData: UpdateUserData = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: UpdateUserData = {};
    if (updateData.firstName) updates.firstName = updateData.firstName;
    if (updateData.lastName) updates.lastName = updateData.lastName;
    if (updateData.addresses) updates.addresses = updateData.addresses;
    if (updateData.password) {
      updates.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select('-password');

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
