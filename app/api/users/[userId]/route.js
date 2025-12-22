import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Ride from "@/models/ride";

export async function GET(_req, context) {
  try {
    const params = await context?.params;
    const { userId } = params || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await connectToDB();

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Optionally fetch lightweight ride summaries
    const createdRides = Array.isArray(user.createdRides) && user.createdRides.length
      ? await Ride.find({ _id: { $in: user.createdRides } }, {
          _id: 1,
          date: 1,
          status: 1,
          vehicleType: 1,
          pricePerSeat: 1,
          source: 1,
          destination: 1,
        }).sort({ date: -1 }).limit(10).lean()
      : [];

    const joinedRides = Array.isArray(user.joinedRides) && user.joinedRides.length
      ? await Ride.find({ _id: { $in: user.joinedRides } }, {
          _id: 1,
          date: 1,
          status: 1,
          vehicleType: 1,
          pricePerSeat: 1,
          source: 1,
          destination: 1,
        }).sort({ date: -1 }).limit(10).lean()
      : [];

    const payload = {
      id: user._id.toString(),
      name: user.name || null,
      email: user.email || null,
      phone: user.phone || null,
      avatar: user.avatar || null,
      provider: user.provider || null,
      rating: user.rating ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdRidesCount: Array.isArray(user.createdRides) ? user.createdRides.length : 0,
      joinedRidesCount: Array.isArray(user.joinedRides) ? user.joinedRides.length : 0,
      createdRides,
      joinedRides,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[userId] error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
