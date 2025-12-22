"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";

export const dynamic = "force-dynamic";

async function getUser(userId) {

  const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data;
}

function RideItem({ ride }) {
  return (
    <li className="flex items-start justify-between">
      <div>
        <div className="font-medium text-sm">
          {ride.source?.address} → {ride.destination?.address}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(ride.date).toLocaleString()} · {ride.vehicleType} · ₹{ride.pricePerSeat}
        </div>
      </div>
      <span className="text-xs rounded bg-gray-100 px-2 py-0.5 capitalize">{ride.status}</span>
    </li>
  );
}

export default function UserProfilePage() {
    const { userId } = useParams();
    if (!userId) notFound();
    const [user, setUser] = useState(null);

    useEffect(async () => {
        const user = await getUser(userId);
        setUser(user);
    }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user?.avatar} alt={user?.name || "Avatar"} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gray-200" />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user?.name || "User"}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.phone && <p className="text-sm text-gray-500">{user?.phone}</p>}
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">Profile</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Provider</div>
              <div className="font-semibold">{user?.provider || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500">Rating</div>
              <div className="font-semibold">{user?.rating ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-500">Member since</div>
              <div className="font-semibold">{new Date(user?.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Updated</div>
              <div className="font-semibold">{new Date(user?.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Created Rides</h2>
            <span className="text-sm text-gray-500">{user?.createdRidesCount} total</span>
          </div>
          <ul className="mt-3 space-y-2">
            {user?.createdRides?.length ? (
              user?.createdRides.map((r) => <RideItem key={r._id} ride={r} />)
            ) : (
              <li className="text-sm text-gray-500">No rides created.</li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Joined Rides</h2>
            <span className="text-sm text-gray-500">{user?.joinedRidesCount} total</span>
          </div>
          <ul className="mt-3 space-y-2">
            {user?.joinedRides?.length ? (
              user?.joinedRides.map((r) => <RideItem key={r._id} ride={r} />)
            ) : (
              <li className="text-sm text-gray-500">No rides joined.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}