import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Ride from "@/models/ride";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const historyStatuses = ["completed", "cancelled"];

    // Rides created by the user in the past with status completed/cancelled
    const createdHistoryRides = await Ride.find({
      createdBy: user._id,
      status: { $in: historyStatuses },
      date: { $lte: now },
    })
      .populate({ path: "requests.user", select: "name email avatar", model: User })
      .lean();

    // Rides joined by the user in the past with status completed/cancelled
    const joinedHistoryRides = await Ride.find({
      passengers: { $elemMatch: { user: user._id } },
      status: { $in: historyStatuses },
      date: { $lte: now },
    })
      .populate({ path: "createdBy", select: "name email avatar", model: User })
      .lean();

    const createdMapped = createdHistoryRides.map((r) => ({
      id: r._id.toString(),
      source: r.source,
      destination: r.destination,
      date: r.date,
      vehicleType: r.vehicleType,
      totalSeats: r.totalSeats,
      availableSeats: r.availableSeats,
      pricePerSeat: r.pricePerSeat,
      status: r.status,
      kind: "created",
      requests: (r.requests || []).map((rq) => ({
        userId: rq.user?._id?.toString() || null,
        name: rq.user?.name || "Unknown",
        email: rq.user?.email || "",
        avatar: rq.user?.avatar || null,
        requestedAt: rq.requestedAt,
      })),
    }));

    const joinedMapped = joinedHistoryRides.map((r) => ({
      id: r._id.toString(),
      source: r.source,
      destination: r.destination,
      date: r.date,
      vehicleType: r.vehicleType,
      totalSeats: r.totalSeats,
      availableSeats: r.availableSeats,
      pricePerSeat: r.pricePerSeat,
      status: r.status,
      kind: "joined",
      driver: r.createdBy
        ? {
            id: r.createdBy._id.toString(),
            name: r.createdBy.name,
            email: r.createdBy.email,
            avatar: r.createdBy.avatar || null,
          }
        : null,
    }));

    // Latest first
    const allHistory = [...createdMapped, ...joinedMapped].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      count: allHistory.length,
      rides: allHistory,
    });
  } catch (error) {
    console.error("GET /api/dashboard/history error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}