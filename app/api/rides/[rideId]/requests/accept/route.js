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

    // Ensure seats available
    if (ride.availableSeats <= 0) {
      return NextResponse.json({ message: "No seats available" }, { status: 409 });
    }

    // Find request
    const reqIdx = ride.requests.findIndex((r) => r.user?.toString() === userId);
    if (reqIdx === -1) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Accept: remove from requests, add to passengers, decrement available seats
    ride.requests.splice(reqIdx, 1);
    ride.passengers.push({ user: new mongoose.Types.ObjectId(userId) });
    ride.availableSeats = Math.max(0, ride.availableSeats - 1);

    await ride.save();

    return NextResponse.json({ message: "Accepted" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/rides/[rideId]/requests/accept error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
