import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      provider: "credentials",
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

  }catch (error) {

    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );

  }
}
