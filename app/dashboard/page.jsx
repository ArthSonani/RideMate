"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [activeRides, setActiveRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);

  /* ---------------- FETCH USER DATA ---------------- */
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data);

        // Fetch active rides for this driver
        const ridesRes = await fetch("/api/my-rides?status=active", { cache: "no-store" });
        if (ridesRes.ok) {
          const rides = await ridesRes.json();
          setActiveRides(rides);
        }
        setLoadingRides(false);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [status]);

  /* ---------------- LOADING STATE ---------------- */
  if (status === "loading") {
    return <p>Loading dashboard...</p>;
  }

  /* ---------------- UNAUTHENTICATED ---------------- */
  if (status === "unauthenticated") {
    return <p>Please login to access dashboard.</p>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

      {user ? (
        <>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>

          <div className="mt-4">
            <img
              src={user.avatar || "/ridemate2.png"}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-medium">Active Rides</h2>
            {loadingRides ? (
              <div className="text-gray-500 text-sm mt-2">Loading rides...</div>
            ) : activeRides.length === 0 ? (
              <div className="text-gray-500 text-sm mt-2">No active rides.</div>
            ) : (
              <ul className="mt-3 space-y-3">
                {activeRides.map((r) => (
                  <li key={r.id} className="rounded border bg-white p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {r.source?.address} → {r.destination?.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.date).toLocaleString()} · {r.vehicleType} · ₹{r.pricePerSeat}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Seats: {r.availableSeats}/{r.totalSeats}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{r.status}</span>
                      </div>
                    </div>
                    {r.requests?.length ? (
                      <div className="mt-3">
                        <div className="text-sm font-medium">Incoming Requests</div>
                        <ul className="mt-2 space-y-2">
                          {r.requests.map((rq) => (
                            <li key={rq.userId} className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{rq.name}</div>
                                <div className="text-xs text-gray-500">{rq.email}</div>
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
                                    const ridesRes = await fetch("/api/my-rides?status=active", { cache: "no-store" });
                                    if (ridesRes.ok) setActiveRides(await ridesRes.json());
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
                                    const ridesRes = await fetch("/api/my-rides?status=active", { cache: "no-store" });
                                    if (ridesRes.ok) setActiveRides(await ridesRes.json());
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
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/dashboard/my-rides" className="text-blue-600 hover:underline text-sm">
                All rides →
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p>Loading user details...</p>
      )}

      <div className="mt-6">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded bg-gray-900 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
