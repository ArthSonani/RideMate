"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 text-center border border-white/20">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/80">{label}</div>
    </div>
  );
}

function RideItem({ ride, actions }) {
  return (
    <Link href={`/rides/${ride.id}`}>
      <li className="rounded-xl border border-neutral-300 bg-white p-4 shadow-sm">
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
        {actions}
      </li>
    </Link>
  );
}

export default function Dashboard() {
  const { status } = useSession();
  const [user, setUser] = useState(null);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [stats, setStats] = useState({ createdActiveCount: 0, joinedActiveCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      const data = await res.json();
      setUser(data.user);
      setCreatedRides(data.createdActiveRides || []);
      setJoinedRides(data.joinedActiveRides || []);
      setStats(data.stats || { createdActiveCount: 0, joinedActiveCount: 0 });
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status]);

  if (status === "loading") {
    return <div className="p-6">Loading dashboard...</div>;
  }
  if (status === "unauthenticated") {
    return <div className="p-6">Please login to access dashboard.</div>;
  }

  return (
    <div className="p-0">
      {/* Hero / User Info */}
      <div className="bg-[#984764]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || "/user.png"}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full ring-1 ring-black/15 p-1"
            />
            <div className="text-white">
              <h1 className="text-2xl font-semibold">{user?.name || "User"}</h1>
              <div className="text-sm opacity-90">{user?.email}</div>
              <div className="text-sm opacity-90">{user?.phone || "No phone"}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <span className="text-white/90">Rating</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-white inline-flex items-center gap-1">
                  {user?.rating ?? 5}
                  <span aria-hidden="true">⭐</span>
                </span>
              </div>
            </div>
            <div className="ml-auto grid grid-cols-2 gap-3">
              <Stat label="Active Created" value={stats.createdActiveCount} />
              <Stat label="Active Joined" value={stats.joinedActiveCount} />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Link href="/rides/create" className="rounded-lg bg-white text-indigo-700 px-4 py-2 text-sm font-medium shadow">
              Create Ride
            </Link>
            <Link href="/dashboard/my-rides" className="rounded-lg bg-white/20 text-white px-4 py-2 text-sm font-medium shadow border border-white/30">
              Manage Rides
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto rounded-lg bg-black/30 text-white px-4 py-2 text-sm border border-white/30"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="text-gray-600">Loading rides...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            {/* Created rides */}
            <section>
              <h2 className="text-lg font-semibold">Your Active Rides</h2>
              {createdRides.length === 0 ? (
                <div className="text-sm text-gray-500 mt-2">No active rides you've created.</div>
              ) : (
                <ul className="mt-3 space-y-3 flex flex-col gap-3">
                  {createdRides.map((r) => (
                    <RideItem
                      key={r.id}
                      ride={r}
                      actions={
                        r.requests?.length ? (
                          <div className="mt-3">
                            <div className="text-sm font-medium">Incoming Requests</div>
                            <ul className="mt-2 space-y-2">
                              {r.requests.map((rq) => (
                                <li key={rq.userId} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <img src={rq.avatar || "/user.png"} alt="" className="h-8 w-8 rounded-full" />
                                    <div>
                                      <div className="text-sm font-medium">{rq.name}</div>
                                      <div className="text-xs text-gray-500">{rq.email}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="rounded bg-green-600 px-3 py-1.5 text-white text-xs"
                                      onClick={async () => {
                                        await fetch(`/api/rides/${r.id}/requests/accept`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ userId: rq.userId }),
                                        });
                                        await refresh();
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      className="rounded bg-red-600 px-3 py-1.5 text-white text-xs"
                                      onClick={async () => {
                                        await fetch(`/api/rides/${r.id}/requests/reject`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ userId: rq.userId }),
                                        });
                                        await refresh();
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 mt-3">No incoming requests</div>
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            {/* Joined rides */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Joined Rides</h2>
              {joinedRides.length === 0 ? (
                <div className="text-sm text-gray-500 mt-2">No rides you've joined.</div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {joinedRides.map((r) => (
                    <RideItem
                      key={r.id}
                      ride={r}
                      actions={
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                          {r.driver && (
                            <div className="inline-flex items-center gap-2">
                              <img src={r.driver.avatar || "/user.png"} alt="" className="h-6 w-6 rounded-full" />
                              <span>Driver: {r.driver.name}</span>
                              <span className="text-gray-400">•</span>
                              <span>{r.driver.email}</span>
                            </div>
                          )}
                        </div>
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-8">
              <Link href="/dashboard/my-rides" className="text-indigo-700 hover:underline text-sm font-medium">
                View all rides →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
