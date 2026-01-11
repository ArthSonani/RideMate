"use client";

import React, { useEffect, useState } from "react";
import RideItem from "@/components/RideItem";

const HistoryPage = () => {
  const [data, setData] = useState({ rides: [], loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/history");
        if (!res.ok) throw new Error("Failed to fetch history");
        const json = await res.json();
        if (mounted) setData({ rides: json.rides || [], loading: false, error: null });
      } catch (err) {
        if (mounted) setData({ rides: [], loading: false, error: err.message });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (data.loading) return <div className="p-4">Loading history...</div>;
  if (data.error) return <div className="p-4 text-red-600">{data.error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ride History</h1>
      {data.rides.length === 0 ? (
        <div className="text-gray-600">No past rides found.</div>
      ) : (
        <ul className="space-y-3">
          {data.rides.map((ride) => (
            <li key={ride.id} className="list-none">
              <RideItem ride={ride} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;