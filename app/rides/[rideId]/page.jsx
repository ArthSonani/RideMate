"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import GoogleDirectionsMap from "@/components/GoogleDirectionsMap";

function formatDate(dt) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return String(dt);
  }
}

// Map rendering is delegated to the reusable component in components/GoogleDirectionsMap.jsx

export default function RideDetails() {
  const { rideId } = useParams();
  const { data: session } = useSession();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");
  const [reqSuccess, setReqSuccess] = useState("");

  useEffect(() => {
    if (!rideId) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/rides/${rideId}`, { cache: "no-store" });
        if (res.status === 404) {
          if (active) setRide(null);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch ride");
        const data = await res.json();
        const normalized = {
          ...data,
          date: data?.date ? new Date(data.date) : null,
        };
        if (active) setRide(normalized);
      } catch (e) {
        if (active) setError(e.message || "Failed to load ride");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [rideId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">Loading ride details...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-20 text-red-500">{error}</div>
    );
  }

  if (!ride) {
    return (
      <div className="flex justify-center py-20 text-red-500">Ride not found</div>
    );
  }

  const passengerCount = ride.passengers?.length || 0;
  const filledSeats = ride.totalSeats - ride.availableSeats;
  const hasSeats = (ride.availableSeats ?? 0) > 0;
  const statusStyle =
    ride.status === "scheduled"
      ? "bg-green-100 text-green-700"
      : ride.status === "completed"
      ? "bg-red-100 text-red-700"
      : ride.status === "ongoing"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-gray-100 text-gray-700";

  const dateStr = ride.date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(ride.date)
    : "-";
  const timeStr = ride.date
    ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(
        ride.date
      )
    : "-";

  const email = session?.user?.email;
  const canRequest = Boolean(
    email &&
    ride.createdBy?.email !== email &&
    !(ride.passengers || []).some((p) => p.email === email) &&
    !(ride.requests || []).some((r) => r.email === email) &&
    ["scheduled", "ongoing"].includes(ride.status) &&
    hasSeats
  );

  async function sendRequest() {
    try {
      setReqError("");
      setReqSuccess("");
      setReqLoading(true);
      const res = await fetch(`/api/rides/${rideId}/requests`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to request");
      setReqSuccess("Request submitted");
      // Refresh ride details to reflect new request
      const fresh = await fetch(`/api/rides/${rideId}`, { cache: "no-store" });
      if (fresh.ok) {
        const d = await fresh.json();
        setRide({ ...d, date: d?.date ? new Date(d.date) : null });
      }
    } catch (e) {
      setReqError(e.message || "Failed to request");
    } finally {
      setReqLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Ride Details</h1>
        <p className="text-sm text-gray-500">ID: {ride.id}</p>
      </div>

      <div className="grid gap-6">

        <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-5">
            <div className="md:col-span-2">
              <GoogleDirectionsMap
                origin={ride.source?.address}
                destination={ride.destination?.address}
                className="w-full rounded-lg"
                height={300}
              />
            </div>
            <div className="md:col-span-3">
              <div className="flex items-start justify-between gap-4">

                <div className="w-2/3">
                  <h2 className="text-lg font-medium">Route</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">From:</span>{" "}
                      <span>{ride.source?.address}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lat: {ride.source?.lat}, Lng: {ride.source?.lng}
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold">To:</span>{" "}
                      <span>{ride.destination?.address}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Lat: {ride.destination?.lat}, Lng: {ride.destination?.lng}
                    </div>
                  </div>
                </div>

                <div className="text-left w-1/3">
                  <div className="text-sm">
                    <span className="font-semibold">Date:</span> {dateStr}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Time:</span> {timeStr}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Vehicle:</span>{" "}
                    {ride.vehicleType}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusStyle}`}>
                      {ride.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">Seats & Pricing</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <div className="text-gray-500">Total seats</div>
              <div className="font-semibold">{ride.totalSeats}</div>
            </div>
            <div>
              <div className="text-gray-500">Booked</div>
              <div className="font-semibold">{filledSeats}</div>
            </div>
            <div>
              <div className="text-gray-500">Available</div>
              <div className={`font-semibold ${hasSeats ? "text-green-600" : "text-red-600"}`}>
                {ride.availableSeats}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Price per seat</div>
              <div className="font-semibold">₹ {ride.pricePerSeat}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Owner & Passengers</h2>
            <span className="text-sm text-gray-500">{passengerCount} joined</span>
          </div>

          {/* Owner */}
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Owner</div>
            {ride.createdBy ? (
              <div className="mt-2 flex items-center gap-3">
                <img src={ride.createdBy.avatar || "/ridemate2.png"} alt="Owner avatar" className="h-10 w-10 rounded-full" />
                <div className="text-sm">
                  <div className="font-medium">{ride.createdBy.name}</div>
                  <div className="text-gray-500">{ride.createdBy.email}</div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">Unknown</div>
            )}
          </div>

          {/* Passengers */}
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Passengers</div>
            <ul className="mt-2 space-y-2 text-sm">
              {passengerCount === 0 && (
                <li className="text-gray-500">No passengers yet.</li>
              )}
              {ride.passengers.map((p, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <img src={p.avatar || "/ridemate2.png"} alt="" className="h-8 w-8 rounded-full" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-gray-500">{p.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Join button */}
          <div className="mt-5">
            {session ? (
              canRequest ? (
                <button
                  disabled={reqLoading}
                  onClick={sendRequest}
                  className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {reqLoading ? "Requesting..." : "Request to Join"}
                </button>
              ) : (
                <span className="text-xs text-gray-500">You cannot request this ride.</span>
              )
            ) : (
              <span className="text-xs text-gray-500">Sign in to request.</span>
            )}
            {reqError && <div className="mt-2 text-xs text-red-600">{reqError}</div>}
            {reqSuccess && <div className="mt-2 text-xs text-green-600">{reqSuccess}</div>}
          </div>
        </section>

        {Array.isArray(ride.requests) && ride.requests.length > 0 && (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-medium">Requests</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {ride.requests.map((r, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar || "/ridemate2.png"} alt="" className="h-7 w-7 rounded-full" />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <span className="text-gray-500">{r.email}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
