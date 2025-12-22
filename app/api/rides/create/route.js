import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";
import User from "@/models/user";

export async function GET() {
    return NextResponse.json({ message: "Rides route is working!" });
}

export async function POST(req) {
    try {
        const session = await getServerSession();

        console.log("Session data in create ride route:", session);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            sourceAddress,
            sourceLat,
            sourceLng,
            destinationAddress,
            destinationLat,
            destinationLng,
            date,
            vehicleType,
            totalSeats,
            pricePerSeat,
        } = body;

        // Basic validation
        if (
            !sourceAddress ||
            sourceLat === undefined ||
            sourceLng === undefined ||
            !destinationAddress ||
            destinationLat === undefined ||
            destinationLng === undefined ||
            !date ||
            !totalSeats ||
            !pricePerSeat
        ) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDB();

        // Resolve DB user id from email for minimal session
        const dbUser = await User.findOne({ email: session.user.email }, { _id: 1 });
        if (!dbUser?._id) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const when = new Date(date);
        const availableSeats = Number(totalSeats);

        const ride = await Ride.create({
            createdBy: dbUser._id,
            source: {
                address: sourceAddress,
                lat: Number(sourceLat),
                lng: Number(sourceLng),
            },
            destination: {
                address: destinationAddress,
                lat: Number(destinationLat),
                lng: Number(destinationLng),
            },
            date: when,
            vehicleType: vehicleType || "auto",
            totalSeats: Number(totalSeats),
            availableSeats,
            pricePerSeat: Number(pricePerSeat),
            sourceLocation: {
                type: "Point",
                coordinates: [Number(sourceLng), Number(sourceLat)],
            },
            destinationLocation: {
                type: "Point",
                coordinates: [Number(destinationLng), Number(destinationLat)],
            },
        });

        return NextResponse.json(ride, { status: 201 });
    } catch (error) {
        console.error("Create ride error:", error);
        return NextResponse.json(
            { message: "Failed to create ride" },
            { status: 500 }
        );
    }
}
