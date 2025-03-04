import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    const mongoUri: string | undefined = process.env.MONGODB_URI;

    if (!mongoUri) {
        return NextResponse.json({ message: "MONGODB_URI is not set in environment variables" }, { status: 500 });
    }

    try {
        await mongoose.connect(mongoUri);

        return NextResponse.json({ message: "Server is running", db: "Connected to MongoDB" });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        return NextResponse.json({ message: "Server is running", db: "Failed to connect to MongoDB" }, { status: 500 });
    }
}
