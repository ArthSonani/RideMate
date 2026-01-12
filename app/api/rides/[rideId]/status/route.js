import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";
import User from "@/models/user";

// Allowed statuses. Owner can mark a scheduled ride as completed or cancelled.
const ALLOWED_STATUSES = ["scheduled", "completed", "cancelled"];
const OWNER_ALLOWED_TARGETS = new Set(["completed", "cancelled"]);

export async function PATCH(req, context) {
  try {
    const params = await context?.params;
    const { rideId } = params || {};

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { status } = body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email }).select("_id email");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const ride = await Ride.findById(rideId).select("createdBy status");
    if (!ride) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    const isOwner = String(ride.createdBy) === String(user._id);
    if (!isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Only allow changing from scheduled to completed/cancelled
    if (ride.status !== "scheduled" || !OWNER_ALLOWED_TARGETS.has(status)) {
      return NextResponse.json({ message: "Unsupported status transition" }, { status: 400 });
    }

    ride.status = status;
    await ride.save();

    return NextResponse.json({ id: ride._id.toString(), status: ride.status }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/rides/[rideId]/status error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
