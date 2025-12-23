import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";
import User from "@/models/user";

export async function GET(_req, context) {
	try {
		const params = await context?.params;
		const { rideId } = params || {};

		await connectToDB();

		const ride = await Ride.findById(rideId)
			.populate({ path: "createdBy", model: User, select: "name email avatar" })
			.populate({ path: "passengers.user", model: User, select: "name email avatar" })
			.populate({ path: "requests.user", model: User, select: "name email avatar" })
			.lean();

            
		if (!ride) {
			return NextResponse.json({ message: "Ride not found" }, { status: 404 });
		}

		const payload = {
			id: ride._id.toString(),
			createdBy: ride.createdBy
				? {
						name: ride.createdBy.name,
						email: ride.createdBy.email,
						avatar: ride.createdBy.avatar || null,
				}
				: null,

			source: ride.source,
			destination: ride.destination,
			date: ride.date,
			vehicleType: ride.vehicleType,
			totalSeats: ride.totalSeats,
			availableSeats: ride.availableSeats,
			pricePerSeat: ride.pricePerSeat,

			passengers: Array.isArray(ride.passengers)
				? ride.passengers.map((p) => ({
						name: p?.user?.name || "Unknown User",
						email: p?.user?.email || "unknownuser@gmail.com",
                        avatar: p?.user?.avatar || null,
					}))
				: [],

			requests: Array.isArray(ride.requests)
				? ride.requests.map((rq) => ({
					name: rq?.user?.name || "Unknown User",
					email: rq?.user?.email || "",
					avatar: rq?.user?.avatar || null,
					requestedAt: rq?.requestedAt,
				}))
				: [],

			status: ride.status,
			createdAt: ride.createdAt,
			updatedAt: ride.updatedAt,
		};

		return NextResponse.json(payload, { status: 200 });
	} catch (error) {
		console.error("GET /api/rides/[rideId] error:", error);
		return NextResponse.json({ message: "Server error" }, { status: 500 });
	}
}

