import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";

export async function POST(req, context) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context?.params;
    const { rideId } = params || {};
    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    const { userId } = await req.json();
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user" }, { status: 400 });
    }

    await connectToDB();

    const ride = await Ride.findById(rideId);
    if (!ride) return NextResponse.json({ message: "Ride not found" }, { status: 404 });

    const before = ride.requests.length;
    ride.requests = ride.requests.filter((r) => r.user?.toString() !== userId);
    if (ride.requests.length === before) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    await ride.save();

    return NextResponse.json({ message: "Rejected" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/rides/[rideId]/requests/reject error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
