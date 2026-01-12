"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RideItem from "../../components/RideItem";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#dee2e6] px-4 py-3 text-center border border-white/20">
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
      <div className="bg-[#212529]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || "/user.png"}
              alt="Avatar"
              width={96}
              height={96}
              className={"rounded-full ring-2 ring-black/15 p-1 ring-[#495057]"}
            />
            <div className="text-[#e9ecef]">
              <h1 className="text-2xl font-semibold">{user?.name || "User"}</h1>
              <div className="text-sm opacity-90">{user?.email}</div>
              <div className="text-sm opacity-90">{user?.phone || "No phone"}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <span className="text-[#e9ecef]">Rating</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-[#e9ecef] inline-flex items-center gap-1">
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
            <Link href="/rides/create" className="rounded-lg bg-[#f8f9fa] hover:bg-[#ced4da] text-black-700 px-4 py-2 text-sm font-medium shadow">
              Create Ride
            </Link>
            <Link href="/dashboard/history" className="group flex items-center justify-center rounded-lg bg-[#212529] hover:bg-[#343a40] text-[#e9ecef] px-4 py-2 text-sm font-medium shadow border border-white/30">
              View all History 
              <svg className="ml-2 h-5 w-5 transition-all duration-150 ease-out transform group-hover:translate-x-1 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto rounded-lg bg-[#212529] hover:bg-[#343a40] text-[#f8f9fa] px-4 py-2 text-sm border border-white/30"
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
                    />
                  ))}
                </ul>
              )}
            </section>

            {/* Joined rides */}
            <section className="my-10">
              <h2 className="text-lg font-semibold">Joined Rides</h2>
              {joinedRides.length === 0 ? (
                <div className="text-sm text-gray-500 mt-2">No rides you've joined.</div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {joinedRides.map((r) => (
                    <RideItem
                      key={r.id}
                      ride={r}
                    />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
