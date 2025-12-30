"use client";

import { useEffect, useMemo, useState } from "react";
import GoogleDirectionsMap from "../../components/GoogleDirectionsMap";
import RideCard from "@components/RideCard";

const vehicleTypes = ["auto", "bike", "economy", "sedan", "xl", "premier"];

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
	// Applied filters are the ones used for fetching; "filters" are live inputs
	const [appliedFilters, setAppliedFilters] = useState({
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
	const [selectedRide, setSelectedRide] = useState(null);
	const [total, setTotal] = useState(0);
	const [limit, setLimit] = useState(5);
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
		if (appliedFilters.sourceLat && appliedFilters.sourceLng) {
			params.set("sourceLat", appliedFilters.sourceLat);
			params.set("sourceLng", appliedFilters.sourceLng);
			params.set("sourceRadiusKm", String(appliedFilters.sourceRadiusKm || 10));
		}
		if (appliedFilters.sourceAddress) {
			params.set("sourceAddress", appliedFilters.sourceAddress);
		}
		if (appliedFilters.destLat && appliedFilters.destLng) {
			params.set("destLat", appliedFilters.destLat);
			params.set("destLng", appliedFilters.destLng);
			params.set("destRadiusKm", String(appliedFilters.destRadiusKm || 10));
		}
		if (appliedFilters.destinationAddress) {
			params.set("destinationAddress", appliedFilters.destinationAddress);
		}
		if (appliedFilters.date) params.set("date", appliedFilters.date);
		if (appliedFilters.vehicleType) params.set("vehicleType", appliedFilters.vehicleType);
		if (appliedFilters.minSeats) params.set("minSeats", appliedFilters.minSeats);
		if (appliedFilters.maxPrice) params.set("maxPrice", appliedFilters.maxPrice);
		params.set("page", String(page));
		params.set("limit", "5");
		return params.toString();
	}, [appliedFilters, page]);

	const totalPages = useMemo(() => {
		return limit ? Math.ceil((total || 0) / limit) : 0;
	}, [total, limit]);

	async function fetchRides() {
		try {
			setLoading(true);
			setError("");
			const res = await fetch(`/api/rides?${queryString}`, { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load rides");
			const data = await res.json();
			setRides(data.results || []);
			setHasMore(Boolean(data.hasMore));
			setTotal(typeof data.total === "number" ? data.total : 0);
			setLimit(typeof data.limit === "number" ? data.limit : 5);
		} catch (e) {
			setError(e.message || "Failed to load rides");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchRides();
	}, [queryString]);

	return (
		<div className="mx-auto max-w-screen px-4 py-8 bg-gray-50">
			<h1 className="ml-6 text-2xl font-semibold tracking-tight">Browse Rides</h1>
			<p className="ml-6 mb-2 text-sm text-gray-600">Fill in pickup, dropoff, schedule, and pricing details.</p>

			<div className="mb-6 mx-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-md">
				<div className="flex flex-row item-center justify-around">
					{/* Location Filters */}
					<div className="w-1/2 grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Source */}
						<div className="flex flex-col p-2 border border-gray-300 rounded">
							<div className="flex flex-col">
								<label className="block text-xs font-medium text-gray-700">Source</label>
								<input
									name="sourceAddress"
									value={filters.sourceAddress}
									onChange={onChange}
									onBlur={() => geocode("source")}
									className="mt-1 mx-2 w-45 h-8 border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
									placeholder="Pickup address"
								/>

								{geoLoading.source && (
									<span className="text-xs text-gray-500">Filling...</span>
								)}
								{geoError.source && (
									<span className="text-xs text-red-500">{geoError.source}</span>
								)}
								{!geoError.source && !geoLoading.source && (
									<span className="text-xs text-gray-500">&nbsp;</span>
								)}

								<div className="flex flex-row gap-2 items-center">
									<div disabled className="px-2 py-1 text-xs text-neutral-400" placeholder="Lat">Lat: {filters.sourceLat ? filters.sourceLat : "XX"}</div>
									<div disabled className="px-2 py-1 text-xs text-neutral-400" placeholder="Lng">Lng: {filters.sourceLng ? filters.sourceLng : "XX"}</div>
								</div>
							</div>
							
							<div className="flex flex-col items-left">
								<label className="block text-xs font-medium text-gray-700">Near Source (Km)</label>
								<input
									name="sourceRadiusKm"
									type="number"
									min="1"
									value={filters.sourceRadiusKm}
									onChange={onChange}
									className="mt-1 mx-2 w-20 h-6 border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
									title="Radius (km)"
								/>
							</div>
						</div>

						{/* Destination */}
						<div className="flex flex-col p-2 border border-gray-300 rounded">
							<div className="flex flex-col">
								<label className="block text-xs font-medium text-gray-700">Destination</label>
								<input
									name="destinationAddress"
									value={filters.destinationAddress}
									onChange={onChange}
									onBlur={() => geocode("destination")}
									className="mt-1 mx-2 w-45 h-8 border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
									placeholder="Dropoff address"
								/>

								{geoLoading.destination && (
									<span className="text-xs text-gray-500">Filling...</span>
								)}
								{geoError.destination && (
									<span className="text-xs text-red-500">{geoError.destination}</span>
								)}
								{!geoError.destination && !geoLoading.destination && (
									<span className="text-xs text-gray-500">&nbsp;</span>
								)}

								<div className="flex flex-row gap-2 items-center">
									<div disabled className="px-2 py-1 text-xs text-neutral-400" placeholder="Lat">Lat: {filters.destLat ? filters.destLat : "XX"}</div>
									<div disabled className="px-2 py-1 text-xs text-neutral-400" placeholder="Lng">Lng: {filters.destLng ? filters.destLng : "XX"}</div>
								</div>
							
								<div className="flex flex-col items-left">
									<label className="block text-xs font-medium text-gray-700">Near Destination (Km)</label>
									<input
										name="destRadiusKm"
										type="number"
										min="1"
										value={filters.destRadiusKm}
										onChange={onChange}
										className="mt-1 mx-2 w-20 h-6 border border-gray-300 rounded border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
										title="Radius (km)"
									/>
								</div>
							</div>
						</div>
					</div>


					{/* Other Filters */}
					<div className="w-1/2 flex flex-col p-2">

						<div className="h-1/2 flex flex-row justify-around items-center p-2">
							<div>
								<label className="block text-xs font-medium text-gray-700">Date</label>
								<input name="date" type="date" value={filters.date} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700">Min Seats</label>
								<input name="minSeats" type="number" min="1" value={filters.minSeats} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700">Max Price</label>
								<input name="maxPrice" type="number" min="0" step="any" value={filters.maxPrice} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
							</div>
						</div>

						<div className="h-1/2 flex gap-4 p-2">
							<div className="w-1/2 flex flex-col items-left px-3">
								<label className="block text-xs font-medium text-gray-700">Vehicle Type</label>
								<select name="vehicleType" value={filters.vehicleType} onChange={onChange} className="mt-1 w-2/3 border border-gray-300 rounded px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
									<option value="">Any</option>
									{vehicleTypes.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							{/* Action Buttons */}
							<div className="w-1/2 mt-auto flex justify-end items-center gap-2">
								<button onClick={() => { setPage(1); setAppliedFilters(filters); }} className="w-2/5 rounded bg-[#984764] hover:bg-[#BD5A7C] px-4 py-2 text-white">Search</button>
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
										// Clear any address-related geocode errors on reset
										setGeoError({ source: "", destination: "" });
										setPage(1);
										setAppliedFilters({
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
									}}
									className="w-2/5 rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-300 rounded px-4 py-2"
								>
									Reset
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Rides List */}
			<div className="w-full flex">
				<div className="w-1/2 border border-gray-300 px-6 py-20">
					<GoogleDirectionsMap
						origin={selectedRide?.source?.address || null}
						destination={selectedRide?.destination?.address || null}
						height={600}
						className="rounded-lg"
					/>
				</div>
				<div className="w-1/2 px-4">
					{loading ? (
						<div className="py-10 text-center text-gray-500">Loading rides...</div>
					) : error ? (
						<div className="py-10 text-center text-red-600">{error}</div>
					) : rides.length === 0 ? (
						<div className="py-10 text-center text-gray-500">No rides found. Try adjusting filters.</div>
					) : (
						<div className="grid gap-4 py-4 px-8">
							{rides.map((r) => (
								<RideCard
									key={r.id}
									ride={r}
									isSelected={selectedRide?.id === r.id}
									onSelect={() => setSelectedRide(r)}
								/>
							))}
						</div>
					)}

					<div className="mt-6 flex items-center justify-center gap-4">
						<button
							aria-label="Previous page"
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						<div className="min-w-[4rem] h-10 px-4 flex items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm">
							<span className="text-sm font-semibold tracking-wide">
								{totalPages > 0 ? `Page ${page} of ${totalPages}` : `Page ${page}`}
							</span>
						</div>

						<button
							aria-label="Next page"
							disabled={totalPages === 0 || page >= totalPages}
							onClick={() => setPage((p) => p + 1)}
							className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>

			</div>
		</div>
	);
}

