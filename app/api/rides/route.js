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

    // Address / Geo filters (source)
    const sourceAddress = sp.get("sourceAddress") || undefined;
    let sourceLat = parseNumber(sp.get("sourceLat"));
    let sourceLng = parseNumber(sp.get("sourceLng"));
    const sourceRadiusKm = parseNumber(10); // default 10km

    // Address / Geo filters (destination)
    const destinationAddress = sp.get("destinationAddress") || undefined;
    let destLat = parseNumber(sp.get("destLat"));
    let destLng = parseNumber(sp.get("destLng"));
    const destRadiusKm = parseNumber(10);

    // Pagination
    const page = Math.max(1, parseNumber(sp.get("page"), 1));
    const limit = Math.min(50, Math.max(1, parseNumber(sp.get("limit"), 10)));
    const skip = (page - 1) * limit;

    await connectToDB();

    // Helper: geocode address on server if lat/lng not provided
    async function geocodeAddress(addr) {
      try {
        if (!addr) return null;
        const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
        if (!apiKey) return null;
        const gurl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
        gurl.searchParams.set("address", addr);
        gurl.searchParams.set("key", apiKey);
        const gres = await fetch(gurl.toString());
        if (!gres.ok) return null;
        const gdata = await gres.json();
        const best = gdata?.results?.[0];
        const loc = best?.geometry?.location;
        if (typeof loc?.lat === "number" && typeof loc?.lng === "number") {
          return { lat: loc.lat, lng: loc.lng };
        }
        return null;
      } catch (_) {
        return null;
      }
    }

    const filter = {};

    if (vehicleType && ["auto", "bike", "economy", "sedan", "xl", "premier"].includes(vehicleType)) {
      filter.vehicleType = vehicleType;
    }
    if (status && ["scheduled", "ongoing", "completed", "cancelled"].includes(status)) {
      filter.status = status;
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

    // Geospatial / Address filters
    // Attempt server-side geocoding if only address provided
    if ((typeof sourceLat !== "number" || typeof sourceLng !== "number") && sourceAddress) {
      const g = await geocodeAddress(sourceAddress);
      if (g) {
        sourceLat = g.lat;
        sourceLng = g.lng;
      }
    }
    if ((typeof destLat !== "number" || typeof destLng !== "number") && destinationAddress) {
      const g = await geocodeAddress(destinationAddress);
      if (g) {
        destLat = g.lat;
        destLng = g.lng;
      }
    }

    // Build geo filters using $geoWithin + $centerSphere to avoid $near errors
    // radius in radians = km / Earth's radius (km)
    const EARTH_RADIUS_KM = 6378.1;
    if (typeof sourceLat === "number" && typeof sourceLng === "number") {
      const radiusRad = (sourceRadiusKm ?? 10) / EARTH_RADIUS_KM;
      filter.sourceLocation = {
        $geoWithin: {
          $centerSphere: [[sourceLng, sourceLat], radiusRad],
        },
      };
    } else if (sourceAddress) {
      // Fallback to text match on source address
      filter["source.address"] = { $regex: new RegExp(sourceAddress, "i") };
    }

    if (typeof destLat === "number" && typeof destLng === "number") {
      const radiusRad = (destRadiusKm ?? 10) / EARTH_RADIUS_KM;
      filter.destinationLocation = {
        $geoWithin: {
          $centerSphere: [[destLng, destLat], radiusRad],
        },
      };
    } else if (destinationAddress) {
      // Fallback to text match on destination address
      filter["destination.address"] = { $regex: new RegExp(destinationAddress, "i") };
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
