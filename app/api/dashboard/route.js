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

    // Active rides created by the user (driver view)
    const createdActiveRides = await Ride.find({
      createdBy: user._id,
      status: { $in: ["scheduled", "ongoing"] },
    })
      .populate({ path: "requests.user", select: "name email avatar", model: User })
      .lean();

    // Active rides joined by the user (passenger view)
    const joinedActiveRides = await Ride.find({
      passengers: { $elemMatch: { user: user._id } },
      status: { $in: ["scheduled", "ongoing"] },
    })
      .populate({ path: "createdBy", select: "name email avatar", model: User })
      .lean();

    const createdMapped = createdActiveRides.map((r) => ({
      id: r._id.toString(),
      source: r.source,
      destination: r.destination,
      date: r.date,
      vehicleType: r.vehicleType,
      totalSeats: r.totalSeats,
      availableSeats: r.availableSeats,
      pricePerSeat: r.pricePerSeat,
      status: r.status,
      requests: (r.requests || []).map((rq) => ({
        userId: rq.user?._id?.toString() || null,
        name: rq.user?.name || "Unknown",
        email: rq.user?.email || "",
        avatar: rq.user?.avatar || null,
        requestedAt: rq.requestedAt,
      })),
    }));

    const joinedMapped = joinedActiveRides.map((r) => ({
      id: r._id.toString(),
      source: r.source,
      destination: r.destination,
      date: r.date,
      vehicleType: r.vehicleType,
      totalSeats: r.totalSeats,
      availableSeats: r.availableSeats,
      pricePerSeat: r.pricePerSeat,
      status: r.status,
      driver: r.createdBy
        ? {
            id: r.createdBy._id.toString(),
            name: r.createdBy.name,
            email: r.createdBy.email,
            avatar: r.createdBy.avatar || null,
          }
        : null,
    }));

    const response = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: user.avatar || null,
        rating: user.rating || 5,
      },
      stats: {
        createdActiveCount: createdMapped.length,
        joinedActiveCount: joinedMapped.length,
      },
      createdActiveRides: createdMapped,
      joinedActiveRides: joinedMapped,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
