"use client";

import { useEffect, useMemo, useState } from "react";

const vehicleTypes = ["auto", "bike", "economy", "sedan", "xl", "premier"];

function RideCard({ ride }) {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="text-sm font-semibold">
						{ride.source?.address} → {ride.destination?.address}
					</div>
					<div className="mt-1 text-xs text-gray-500">
						{new Date(ride.date).toLocaleString()} · {ride.vehicleType}
					</div>
					<div className="mt-2 text-sm">
						<span className="font-medium">₹ {ride.pricePerSeat}</span> per seat · {ride.availableSeats}/{ride.totalSeats} available
					</div>
				</div>
				<div className="text-right">
					<div className="text-xs rounded bg-gray-100 px-2 py-0.5 capitalize inline-block">{ride.status}</div>
					<a href={`/rides/${ride.id}`} className="mt-3 block text-sm text-blue-600 hover:underline">View details</a>
				</div>
			</div>
		</div>
	);
}

export default function BrowseRidesPage() {
	const [filters, setFilters] = useState({
		sourceAddress: "",
		sourceLat: "",
		sourceLng: "",
		sourceRadiusKm: 10,
		destinationAddress: "",
		destLat: "",
		destLng: "",
		destRadiusKm: 10,
		date: "",
		vehicleType: "",
		minSeats: "",
		maxPrice: "",
	});

	const [rides, setRides] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [geoLoading, setGeoLoading] = useState({ source: false, destination: false });
	const [geoError, setGeoError] = useState({ source: "", destination: "" });

	function onChange(e) {
		const { name, value } = e.target;
		setFilters((p) => ({ ...p, [name]: value }));
	}

	async function geocode(which) {
		try {
			setGeoError((p) => ({ ...p, [which]: "" }));
			setGeoLoading((p) => ({ ...p, [which]: true }));
			const address = which === "source" ? filters.sourceAddress : filters.destinationAddress;
			if (!address) {
				setGeoError((p) => ({ ...p, [which]: "Address is required" }));
				return;
			}
			const res = await fetch("/api/geocode", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ address }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || "Failed to geocode");
			}
			const data = await res.json();
			if (which === "source") {
				setFilters((p) => ({
					...p,
					sourceAddress: data.formattedAddress || p.sourceAddress,
					sourceLat: String(data.lat),
					sourceLng: String(data.lng),
				}));
			} else {
				setFilters((p) => ({
					...p,
					destinationAddress: data.formattedAddress || p.destinationAddress,
					destLat: String(data.lat),
					destLng: String(data.lng),
				}));
			}
		} catch (e) {
			setGeoError((p) => ({ ...p, [which]: e.message }));
		} finally {
			setGeoLoading((p) => ({ ...p, [which]: false }));
		}
	}

	const queryString = useMemo(() => {
		const params = new URLSearchParams();
		if (filters.sourceLat && filters.sourceLng) {
			params.set("sourceLat", filters.sourceLat);
			params.set("sourceLng", filters.sourceLng);
			params.set("sourceRadiusKm", String(filters.sourceRadiusKm || 10));
		}
		if (filters.destLat && filters.destLng) {
			params.set("destLat", filters.destLat);
			params.set("destLng", filters.destLng);
			params.set("destRadiusKm", String(filters.destRadiusKm || 10));
		}
		if (filters.date) params.set("date", filters.date);
		if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
		if (filters.minSeats) params.set("minSeats", filters.minSeats);
		if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
		params.set("page", String(page));
		params.set("limit", "10");
		return params.toString();
	}, [filters, page]);

	async function fetchRides() {
		try {
			setLoading(true);
			setError("");
			const res = await fetch(`/api/rides?${queryString}`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load rides");
			const data = await res.json();
			setRides(data.results || []);
			setHasMore(Boolean(data.hasMore));
		} catch (e) {
			setError(e.message || "Failed to load rides");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchRides();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryString]);

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<h1 className="mb-4 text-2xl font-semibold tracking-tight">Browse Rides</h1>

			<div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700">Source Address</label>
						<input
							name="sourceAddress"
							value={filters.sourceAddress}
							onChange={onChange}
							onBlur={() => geocode("source")}
							className="mt-1 w-full rounded border px-3 py-2"
							placeholder="Pickup address"
						/>
						<div className="mt-2 flex items-center gap-2">
							<input
								name="sourceRadiusKm"
								type="number"
								min="1"
								value={filters.sourceRadiusKm}
								onChange={onChange}
								className="w-28 rounded border px-2 py-1 text-sm"
								title="Radius (km)"
							/>
							{geoLoading.source && (
								<span className="text-xs text-gray-500">Filling...</span>
							)}
							{geoError.source && (
								<span className="text-xs text-red-600">{geoError.source}</span>
							)}
						</div>
						<div className="mt-2 grid grid-cols-2 gap-2">
							<input disabled className="rounded border bg-gray-100 px-2 py-1 text-sm" placeholder="Lat" value={filters.sourceLat} />
							<input disabled className="rounded border bg-gray-100 px-2 py-1 text-sm" placeholder="Lng" value={filters.sourceLng} />
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Destination Address</label>
						<input
							name="destinationAddress"
							value={filters.destinationAddress}
							onChange={onChange}
							onBlur={() => geocode("destination")}
							className="mt-1 w-full rounded border px-3 py-2"
							placeholder="Dropoff address"
						/>
						<div className="mt-2 flex items-center gap-2">
							<input
								name="destRadiusKm"
								type="number"
								min="1"
								value={filters.destRadiusKm}
								onChange={onChange}
								className="w-28 rounded border px-2 py-1 text-sm"
								title="Radius (km)"
							/>
							{geoLoading.destination && (
								<span className="text-xs text-gray-500">Filling...</span>
							)}
							{geoError.destination && (
								<span className="text-xs text-red-600">{geoError.destination}</span>
							)}
						</div>
						<div className="mt-2 grid grid-cols-2 gap-2">
							<input disabled className="rounded border bg-gray-100 px-2 py-1 text-sm" placeholder="Lat" value={filters.destLat} />
							<input disabled className="rounded border bg-gray-100 px-2 py-1 text-sm" placeholder="Lng" value={filters.destLng} />
						</div>
					</div>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Date</label>
						<input name="date" type="date" value={filters.date} onChange={onChange} className="mt-1 w-full rounded border px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
						<select name="vehicleType" value={filters.vehicleType} onChange={onChange} className="mt-1 w-full rounded border px-3 py-2">
							<option value="">Any</option>
							{vehicleTypes.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Min Seats</label>
						<input name="minSeats" type="number" min="1" value={filters.minSeats} onChange={onChange} className="mt-1 w-full rounded border px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Max Price</label>
						<input name="maxPrice" type="number" min="0" step="any" value={filters.maxPrice} onChange={onChange} className="mt-1 w-full rounded border px-3 py-2" />
					</div>
				</div>

				<div className="mt-4 flex items-center gap-2">
					<button onClick={() => { setPage(1); fetchRides(); }} className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
					<button
						onClick={() => {
							setFilters({
								sourceAddress: "",
								sourceLat: "",
								sourceLng: "",
								sourceRadiusKm: 10,
								destinationAddress: "",
								destLat: "",
								destLng: "",
								destRadiusKm: 10,
								date: "",
								vehicleType: "",
								minSeats: "",
								maxPrice: "",
							});
							setPage(1);
						}}
						className="rounded border px-4 py-2"
					>
						Reset
					</button>
				</div>
			</div>

			{loading ? (
				<div className="py-10 text-center text-gray-500">Loading rides...</div>
			) : error ? (
				<div className="py-10 text-center text-red-600">{error}</div>
			) : rides.length === 0 ? (
				<div className="py-10 text-center text-gray-500">No rides found. Try adjusting filters.</div>
			) : (
				<div className="grid gap-4">
					{rides.map((r) => (
						<RideCard key={r.id} ride={r} />
					))}
				</div>
			)}

			<div className="mt-6 flex items-center justify-center gap-2">
				<button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-1.5 disabled:opacity-50">Prev</button>
				<span className="text-sm">Page {page}</span>
				<button disabled={!hasMore} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1.5 disabled:opacity-50">Next</button>
			</div>
		</div>
	);
}

