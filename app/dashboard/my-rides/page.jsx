"use client";

import { useEffect, useState } from "react";

function RideCard({ ride }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="flex justify-between">
        <div>
          <div className="text-sm font-semibold">
            {ride.source?.address} → {ride.destination?.address}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(ride.date).toLocaleString()} · {ride.vehicleType} · ₹{ride.pricePerSeat}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Seats: {ride.availableSeats}/{ride.totalSeats}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{ride.status}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyRides() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [aRes, hRes] = await Promise.all([
        fetch("/api/my-rides?status=active", { cache: "no-store" }),
        fetch("/api/my-rides?status=history", { cache: "no-store" }),
      ]);
      if (!aRes.ok || !hRes.ok) throw new Error("Failed to load rides");
      setActive(await aRes.json());
      setHistory(await hRes.json());
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Rides</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-medium">-- active --</h2>
            <div className="mt-3 grid gap-3">
              {active.length ? active.map((r) => <RideCard key={r.id} ride={r} />) : (
                <div className="text-sm text-gray-500">No active rides.</div>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-medium">-- history --</h2>
            <div className="mt-3 grid gap-3">
              {history.length ? history.map((r) => <RideCard key={r.id} ride={r} />) : (
                <div className="text-sm text-gray-500">No past rides.</div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
