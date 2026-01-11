"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RideItem from "../../components/RideItem";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-black/10 px-4 py-3 text-center border border-white/20">
      <div className="text-2xl font-semibold text-black">{value}</div>
      <div className="text-xs text-black/80">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  
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
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:45px_45px]">
        <div className="max-w-md w-full bg-transparent rounded-xl p-6 text-center">
          <p className="text-gray-700">You must be signed in to view your dashboard.</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 rounded bg-[#984764] hover:bg-[#BD5A7C] text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Hero / User Info */}
      <div className="bg-[#FFF9C4]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || "/user.png"}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full ring-1 ring-black/15 p-1"
            />
            <div className="text-black">
              <h1 className="text-2xl font-semibold">{user?.name || "User"}</h1>
              <div className="text-sm opacity-90">{user?.email}</div>
              <div className="text-sm opacity-90">{user?.phone || "No phone"}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <span className="text-black">Rating</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-black inline-flex items-center gap-1">
                  {user?.rating || 5}
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
            <Link href="/rides/create" className="rounded-lg bg-white text-black-700 px-4 py-2 text-sm font-medium shadow">
              Create Ride
            </Link>
            <Link href="/dashboard/my-rides" className="rounded-lg bg-white/20 text-black px-4 py-2 text-sm font-medium shadow border border-white/30">
              Manage Rides
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto rounded-lg bg-black/30 text-black px-4 py-2 text-sm border border-white/30"
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
                <ul className="mt-3 space-y-3 flex flex-col gap-2">
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
              <Link href="/dashboard/history" className="text-indigo-700 hover:underline text-sm font-medium">
                View all History →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
