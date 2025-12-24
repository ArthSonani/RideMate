"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CreateRide = () => {
  const { data: session, status } = useSession();
  
  const router = useRouter();

  const [form, setForm] = useState({
    sourceAddress: "",
    sourceLat: "",
    sourceLng: "",
    destinationAddress: "",
    destinationLat: "",
    destinationLng: "",
    date: "",
    time: "",
    vehicleType: "auto",
    totalSeats: 1,
    pricePerSeat: 0,
  });

  const vehicleTypes = [
    { value: "auto", label: "Auto" },
    { value: "bike", label: "Bike" },
    { value: "economy", label: "Economy" },
    { value: "sedan", label: "Sedan" },
    { value: "xl", label: "XL" },
    { value: "premier", label: "Premier" },
  ];

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
      // Merge date and time into a single ISO datetime string
      const combinedDateTime = form.date && form.time ? new Date(`${form.date}T${form.time}`) : null;
      if (!combinedDateTime) {
        throw new Error("Please provide both date and time");
      }
      const res = await fetch("/api/rides/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: combinedDateTime.toISOString(),
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
        <h1 className="text-2xl font-semibold">Create a Ride</h1>
        <p className="text-sm text-gray-600 mt-1">Fill in pickup, dropoff, schedule, and pricing details.</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup */}
            <section className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pickup</h2>
                <button
                  type="button"
                  onClick={() => geocode("source")}
                  className="text-xs rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50"
                >
                  Detect
                </button>
              </div>
              <label className="mt-3 block text-xs font-medium text-gray-600">Address</label>
              <input
                name="sourceAddress"
                value={form.sourceAddress}
                onChange={update}
                onBlur={() => geocode("source")}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Pickup address"
                required
              />
              {geoLoading.source && (
                <div className="mt-2 text-xs text-gray-500">Filling coordinates...</div>
              )}
              {geoError.source && (
                <div className="mt-2 text-xs text-red-600">{geoError.source}</div>
              )}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600">Coordinates (auto-filled)</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    name="sourceLat"
                    type="number"
                    step="any"
                    value={form.sourceLat}
                    onChange={update}
                    className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed blur-[0.5px]"
                    disabled
                    required
                  />
                  <input
                    name="sourceLng"
                    type="number"
                    step="any"
                    value={form.sourceLng}
                    onChange={update}
                    className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed blur-[0.5px]"
                    disabled
                    required
                  />
                </div>
              </div>
            </section>

            {/* Dropoff */}
            <section className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Dropoff</h2>
                <button
                  type="button"
                  onClick={() => geocode("destination")}
                  className="text-xs rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-50"
                >
                  Detect
                </button>
              </div>
              <label className="mt-3 block text-xs font-medium text-gray-600">Address</label>
              <input
                name="destinationAddress"
                value={form.destinationAddress}
                onChange={update}
                onBlur={() => geocode("destination")}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Dropoff address"
                required
              />
              {geoLoading.destination && (
                <div className="mt-2 text-xs text-gray-500">Filling coordinates...</div>
              )}
              {geoError.destination && (
                <div className="mt-2 text-xs text-red-600">{geoError.destination}</div>
              )}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600">Coordinates (auto-filled)</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    name="destinationLat"
                    type="number"
                    step="any"
                    value={form.destinationLat}
                    onChange={update}
                    className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed blur-[0.5px]"
                    disabled
                    required
                  />
                  <input
                    name="destinationLng"
                    type="number"
                    step="any"
                    value={form.destinationLng}
                    onChange={update}
                    className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed blur-[0.5px]"
                    disabled
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Schedule */}
          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Schedule</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Vehicle & Pricing */}
          <section className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Vehicle & Pricing</h2>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Select Vehicle Type</label>
              
              <div className="mt-2 flex">
                {vehicleTypes.map((vt) => {
                  const selected = form.vehicleType === vt.value;
                  return (
                    <label
                      key={vt.value}
                      className={
                        `h-20 w-20 mx-1 group cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 ` +
                        (selected ? "border-indigo-600 ring-2 ring-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300")
                      }
                    >
                      <input
                        type="radio"
                        name="vehicleType"
                        value={vt.value}
                        checked={selected}
                        onChange={update}
                        className="sr-only"
                      />
                      {vt.value ? (
                        <img src={`/${vt.value}.png`} alt={vt.label} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Image</div>
                      )}
                      <span className={selected ? "text-sm font-medium text-indigo-700" : "text-sm font-medium text-gray-700"}>{vt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                <input
                  name="totalSeats"
                  type="number"
                  min="1"
                  value={form.totalSeats}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 shadow-sm hover:bg-indigo-700"
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