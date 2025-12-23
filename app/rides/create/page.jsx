"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CreateRide = () => {
  const { data: session, status } = useSession();

  console.log("Session data in CreateRide:", session);
  
  const router = useRouter();

  const [form, setForm] = useState({
    sourceAddress: "",
    sourceLat: "",
    sourceLng: "",
    destinationAddress: "",
    destinationLat: "",
    destinationLng: "",
    date: "",
    vehicleType: "auto",
    totalSeats: 1,
    pricePerSeat: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState({ source: false, destination: false });
  const [geoError, setGeoError] = useState({ source: "", destination: "" });

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const geocode = async (which) => {
    try {
      setGeoError((p) => ({ ...p, [which]: "" }));
      setGeoLoading((p) => ({ ...p, [which]: true }));

      const address = which === "source" ? form.sourceAddress : form.destinationAddress;
      if (!address) {
        setGeoError((p) => ({ ...p, [which]: "Address is required" }));
        return;
      }

      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to geocode");
      }

      const data = await res.json();
      if (which === "source") {
        setForm((prev) => ({
          ...prev,
          sourceAddress: data.formattedAddress || prev.sourceAddress,
          sourceLat: String(data.lat),
          sourceLng: String(data.lng),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          destinationAddress: data.formattedAddress || prev.destinationAddress,
          destinationLat: String(data.lat),
          destinationLng: String(data.lng),
        }));
      }
    } catch (err) {
      setGeoError((p) => ({ ...p, [which]: err.message }));
    } finally {
      setGeoLoading((p) => ({ ...p, [which]: false }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rides/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalSeats: Number(form.totalSeats),
          pricePerSeat: Number(form.pricePerSeat),
          sourceLat: Number(form.sourceLat),
          sourceLng: Number(form.sourceLng),
          destinationLat: Number(form.destinationLat),
          destinationLng: Number(form.destinationLng),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create ride");
      }

      const ride = await res.json();
      router.push(`/rides/${ride._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-6">Checking session...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-700">You must be signed in to create a ride.</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Create a Ride</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Address</label>
              <input
                name="sourceAddress"
                value={form.sourceAddress}
                onChange={update}
                onBlur={() => geocode("source")}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Pickup address"
                required
              />
              {geoLoading.source && (
                <div className="mt-2 text-xs text-gray-500">Filling coordinates...</div>
              )}
              {geoError.source && (
                <div className="mt-2 text-xs text-red-600">{geoError.source}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Address</label>
              <input
                name="destinationAddress"
                value={form.destinationAddress}
                onChange={update}
                onBlur={() => geocode("destination")}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Dropoff address"
                required
              />
              {geoLoading.destination && (
                <div className="mt-2 text-xs text-gray-500">Filling coordinates...</div>
              )}
              {geoError.destination && (
                <div className="mt-2 text-xs text-red-600">{geoError.destination}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Lat</label>
              <input
                name="sourceLat"
                type="number"
                step="any"
                value={form.sourceLat}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
                disabled
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Lng</label>
              <input
                name="sourceLng"
                type="number"
                step="any"
                value={form.sourceLng}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
                disabled
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Lat</label>
              <input
                name="destinationLat"
                type="number"
                step="any"
                value={form.destinationLat}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
                disabled
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Lng</label>
              <input
                name="destinationLng"
                type="number"
                step="any"
                value={form.destinationLng}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
                disabled
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2"
              >
                <option value="auto">Auto</option>
                <option value="bike">Bike</option>
                <option value="economy">Economy</option>
                <option value="sedan">Sedan</option>
                <option value="xl">XL</option>
                <option value="premier">Premier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Seats</label>
              <input
                name="totalSeats"
                type="number"
                min="1"
                value={form.totalSeats}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price per Seat</label>
              <input
                name="pricePerSeat"
                type="number"
                min="0"
                step="any"
                value={form.pricePerSeat}
                onChange={update}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Ride"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRide;