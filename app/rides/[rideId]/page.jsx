"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { CiCalendar } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
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
      ? "bg-blue-100 text-blue-700"
      : ride.status === "cancelled"
      ? "bg-red-100 text-red-700"
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
    ride.status === "scheduled" &&
    hasSeats
  );

  const isOwner = Boolean(email && ride.createdBy?.email === email);

  async function updateStatus(next) {
    try {
      setReqError("");
      setReqSuccess("");
      setReqLoading(true);
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setReqSuccess(`Ride marked as ${next}`);
      const fresh = await fetch(`/api/rides/${rideId}`, { cache: "no-store" });
      if (fresh.ok) {
        const d = await fresh.json();
        setRide({ ...d, date: d?.date ? new Date(d.date) : null });
      }
    } catch (e) {
      setReqError(e.message || "Failed to update status");
    } finally {
      setReqLoading(false);
    }
  }

  async function acceptRequest(userId) {
    try {
      setReqError("");
      setReqSuccess("");
      setReqLoading(true);
      const res = await fetch(`/api/rides/${rideId}/requests/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to accept request");
      setReqSuccess("Request accepted");
      const fresh = await fetch(`/api/rides/${rideId}`, { cache: "no-store" });
      if (fresh.ok) {
        const d = await fresh.json();
        setRide({ ...d, date: d?.date ? new Date(d.date) : null });
      }
    } catch (e) {
      setReqError(e.message || "Failed to accept request");
    } finally {
      setReqLoading(false);
    }
  }

  async function rejectRequest(userId) {
    try {
      setReqError("");
      setReqSuccess("");
      setReqLoading(true);
      const res = await fetch(`/api/rides/${rideId}/requests/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to reject request");
      setReqSuccess("Request rejected");
      const fresh = await fetch(`/api/rides/${rideId}`, { cache: "no-store" });
      if (fresh.ok) {
        const d = await fresh.json();
        setRide({ ...d, date: d?.date ? new Date(d.date) : null });
      }
    } catch (e) {
      setReqError(e.message || "Failed to reject request");
    } finally {
      setReqLoading(false);
    }
  }

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

            <div className="h-full md:col-span-3 felx flex-col justify-between">
              
              <div className="flex items-start justify-between gap-4">
                  <div className="mt-3 space-y-2 text-sm">
                    <h2 className="text-lg font-medium mb-3">Route</h2>
                    <div className="flex flex-col">
                      <span className="font-semibold uppercase text-gray-500">From:</span>
                      <span className="pl-2">{ride.source?.address}</span>
                    </div>
                    <div className="text-xs text-gray-600 flex flex-col pl-2">
                      <span>Lat: {ride.source?.lat}</span> 
                      <span>Lng: {ride.source?.lng}</span>
                    </div>
                    <div className="mt-2 flex flex-col">
                      <span className="font-semibold uppercase text-gray-500">To:</span>
                      <span className="pl-2">{ride.destination?.address}</span>
                    </div>
                    <div className="text-xs text-gray-600 flex flex-col pl-2">
                      <span>Lat: {ride.destination?.lat}</span> 
                      <span>Lng: {ride.destination?.lng}</span>
                    </div>
                  </div>
                  <div className="h-full flex flex-col items-end justify-start">
                    <div className="text-sm mt-1">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusStyle}`}>
                        {ride.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-xs mt-5 uppercase font-semibold bg-[#dee2e6] rounded-lg p-4 border border-gray-300">
                      <img src={`/${ride.vehicleType}.png`} alt={ride.vehicleType} className="h-8 w-8 object-contain" />
                      {ride.vehicleType}
                    </div>
                  </div>
              </div>

              <div className="font-medium flex items-center justify-center gap-20 p-5">
                  <div className="flex items-center gap-3 p-3">
                      <CiCalendar size={20} className="stroke-[1px]"/>
                      <div>
                          <div className="text-xs font-medium text-gray-500">Date</div>
                          <div className="text-sm font-semibold text-gray-900">{dateStr}</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                      <IoMdTime size={20} className="stroke-[5px]"/>  
                      <div>
                          <div className="text-xs font-medium text-gray-500">Time</div>
                          <div className="text-sm font-semibold text-gray-900">{timeStr}</div> 
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

          {/* Owner actions or Join button */}
          <div className="mt-5">
            {session ? (
              isOwner ? (
                ride.status === "scheduled" ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      disabled={reqLoading}
                      onClick={() => updateStatus("completed")}
                      className="rounded-lg px-4 py-2 text-white disabled:opacity-50 bg-blue-500 hover:bg-blue-600"
                    >
                      {reqLoading ? "Updating..." : "Mark as Completed"}
                    </button>
                    <button
                      disabled={reqLoading}
                      onClick={() => updateStatus("cancelled")}
                      className="rounded-lg px-4 py-2 text-white disabled:opacity-50 bg-red-500 hover:bg-red-600"
                    >
                      {reqLoading ? "Updating..." : "Cancel Ride"}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Status updates only available while scheduled.</span>
                )
              ) : canRequest ? (
                <button
                  disabled={reqLoading}
                  onClick={sendRequest}
                  className="rounded px-4 py-2 text-white disabled:opacity-50 bg-[#984764] hover:bg-[#BD5A7C]"
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
          <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-medium">Requests</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {ride.requests.map((r, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar || "/ridemate2.png"} alt="" className="h-7 w-7 rounded-full" />
                    <div className="flex flex-col">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-gray-500">{r.email}</span>
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={reqLoading}
                        onClick={() => acceptRequest(r.userId)}
                        className="rounded px-3 py-1 border border-[#1565c0] text-xs text-black disabled:opacity-50 bg-[#64b5f6] hover:bg-[#42a5f5]"
                      >
                        {reqLoading ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        disabled={reqLoading}
                        onClick={() => rejectRequest(r.userId)}
                        className="rounded px-3 py-1 text-xs border border-[#a4161a] text-black disabled:opacity-50 bg-[#ff4b3e] hover:bg-[#e5383b]"
                      >
                        {reqLoading ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Owner will review your request.</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
