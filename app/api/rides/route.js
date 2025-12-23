import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import Ride from "@/models/ride";
import User from "@/models/user";

function parseNumber(v, def = undefined) {
  if (v === undefined || v === null || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    // Basic filters
    const vehicleType = sp.get("vehicleType") || undefined; // auto|bike|economy|sedan|xl|premier
    const status = sp.get("status") || undefined; // scheduled|ongoing|completed|cancelled
    const minSeats = parseNumber(sp.get("minSeats"));
    const maxPrice = parseNumber(sp.get("maxPrice"));

    // Date filters
    const dateStr = sp.get("date"); // specific day
    const fromDateStr = sp.get("fromDate");
    const toDateStr = sp.get("toDate");

    // Geo filters (source)
    const sourceLat = parseNumber(sp.get("sourceLat"));
    const sourceLng = parseNumber(sp.get("sourceLng"));
    const sourceRadiusKm = parseNumber(sp.get("sourceRadiusKm"), 10); // default 10km

    // Geo filters (destination)
    const destLat = parseNumber(sp.get("destLat"));
    const destLng = parseNumber(sp.get("destLng"));
    const destRadiusKm = parseNumber(sp.get("destRadiusKm"), 10);

    // Pagination
    const page = Math.max(1, parseNumber(sp.get("page"), 1));
    const limit = Math.min(50, Math.max(1, parseNumber(sp.get("limit"), 10)));
    const skip = (page - 1) * limit;

    await connectToDB();

    const filter = {};

    if (vehicleType && ["auto", "bike", "economy", "sedan", "xl", "premier"].includes(vehicleType)) {
      filter.vehicleType = vehicleType;
    }
    if (status && ["scheduled", "ongoing", "completed", "cancelled"].includes(status)) {
      filter.status = status;
    } else {
      // by default, show only upcoming/scheduled rides
      filter.status = { $in: ["scheduled", "ongoing"] };
    }
    if (typeof minSeats === "number") {
      filter.availableSeats = { $gte: minSeats };
    }
    if (typeof maxPrice === "number") {
      filter.pricePerSeat = { $lte: maxPrice };
    }

    // Date handling
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d)) {
        const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
        const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        filter.date = { $gte: start, $lte: end };
      }
    } else {
      const range = {};
      if (fromDateStr) {
        const fd = new Date(fromDateStr);
        if (!isNaN(fd)) range.$gte = fd;
      }
      if (toDateStr) {
        const td = new Date(toDateStr);
        if (!isNaN(td)) range.$lte = td;
      }
      if (Object.keys(range).length) {
        filter.date = range;
      }
    }

    // Geospatial filters
    const geoClauses = [];
    if (typeof sourceLat === "number" && typeof sourceLng === "number") {
      geoClauses.push({
        sourceLocation: {
          $near: {
            $geometry: { type: "Point", coordinates: [sourceLng, sourceLat] },
            $maxDistance: Math.round((sourceRadiusKm ?? 10) * 1000),
          },
        },
      });
    }
    if (typeof destLat === "number" && typeof destLng === "number") {
      geoClauses.push({
        destinationLocation: {
          $near: {
            $geometry: { type: "Point", coordinates: [destLng, destLat] },
            $maxDistance: Math.round((destRadiusKm ?? 10) * 1000),
          },
        },
      });
    }
    if (geoClauses.length === 1) {
      Object.assign(filter, geoClauses[0]);
    } else if (geoClauses.length > 1) {
      filter.$and = geoClauses;
    }

    const query = Ride.find(filter)
      .populate({ path: "createdBy", model: User, select: "name email avatar" })
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [items, total] = await Promise.all([
      query,
      Ride.countDocuments(filter),
    ]);

    const results = items.map((ride) => ({
      id: ride._id.toString(),
      createdBy: ride.createdBy
        ? { name: ride.createdBy.name, email: ride.createdBy.email, avatar: ride.createdBy.avatar || null }
        : null,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      vehicleType: ride.vehicleType,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      status: ride.status,
    }));

    return NextResponse.json({
      results,
      page,
      limit,
      total,
      hasMore: skip + results.length < total,
    });
  } catch (error) {
    console.error("GET /api/rides error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
