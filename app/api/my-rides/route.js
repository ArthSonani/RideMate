import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Ride from "@/models/ride";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // active|history|all

    await connectToDB();

    const dbUser = await User.findOne({ email: session.user.email }, { _id: 1 });
    if (!dbUser?._id) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let filter = { createdBy: dbUser._id };
    if (status === "active") {
      filter.status = { $in: ["scheduled", "ongoing"] };
    } else if (status === "history") {
      filter.status = { $in: ["completed", "cancelled"] };
    }

    const rides = await Ride.find(filter)
      .populate({ path: "requests.user", select: "name email avatar", model: User })
      .lean();

    const results = rides.map((r) => ({
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

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("GET /api/my-rides error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
