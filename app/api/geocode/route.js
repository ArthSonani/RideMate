import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ message: "Address is required" }, { status: 400 });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", process.env.GOOGLE_GEOCODING_API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) {
      return NextResponse.json({ message: "Geocode request failed" }, { status: 502 });
    }

    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json({ message: "No results for address" }, { status: 404 });
    }

    const best = data.results[0];
    const loc = best.geometry?.location;
    if (!loc) {
      return NextResponse.json({ message: "Invalid geocode response" }, { status: 502 });
    }

    const payload = {
      formattedAddress: best.formatted_address,
      lat: loc.lat,
      lng: loc.lng,
      placeId: best.place_id || null,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("POST /api/geocode error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
