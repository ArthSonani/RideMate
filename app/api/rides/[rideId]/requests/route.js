import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";
import User from "@/models/user";

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

    await connectToDB();

    const ride = await Ride.findById(rideId).populate({ path: "createdBy", select: "email", model: User });
    if (!ride) return NextResponse.json({ message: "Ride not found" }, { status: 404 });

    // Prevent owner from requesting own ride
    if (ride.createdBy?.email === session.user.email) {
      return NextResponse.json({ message: "Cannot request own ride" }, { status: 400 });
    }

    // Ensure ride is requestable
    if (!["scheduled", "ongoing"].includes(ride.status)) {
      return NextResponse.json({ message: "Ride not accepting requests" }, { status: 409 });
    }

    // Resolve requesting user id
    const requester = await User.findOne({ email: session.user.email }, { _id: 1 });
    if (!requester?._id) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const requesterId = requester._id.toString();

    // Already a passenger?
    const isPassenger = ride.passengers.some((p) => p.user?.toString() === requesterId);
    if (isPassenger) {
      return NextResponse.json({ message: "Already joined" }, { status: 409 });
    }

    // Already requested?
    const alreadyRequested = (ride.requests || []).some((r) => r.user?.toString() === requesterId);
    if (alreadyRequested) {
      return NextResponse.json({ message: "Already requested" }, { status: 409 });
    }

    // Optional: ensure seats available
    if (ride.availableSeats <= 0) {
      return NextResponse.json({ message: "No seats available" }, { status: 409 });
    }

    ride.requests.push({ user: requester._id });
    await ride.save();

    return NextResponse.json({ message: "Request submitted" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rides/[rideId]/requests error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
