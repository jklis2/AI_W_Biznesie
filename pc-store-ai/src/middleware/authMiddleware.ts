import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/user";
import { connectToDatabase } from '@/lib/db';

interface AuthError extends Error {
  name: string;
  message: string;
}

export async function authenticateUser(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
    };

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return { userId: user._id, user };
  } catch (err: unknown) {
    const authError = err as AuthError;
    return NextResponse.json(
      { error: authError.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
