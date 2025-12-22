"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

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
