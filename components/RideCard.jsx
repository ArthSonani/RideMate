import React from 'react'
import Link from 'next/link';

const RideCard = ({ ride, isSelected, onSelect }) => {
    const base = "rounded-lg border bg-white p-4 shadow-sm cursor-pointer transition-all duration-150";
    const hover = "hover:shadow-md hover:border-gray-300";
    const selected = isSelected ? "border-[#984764] ring-2 ring-[#984764] bg-[#fbf4f7]" : "border-gray-200";
    return (
        <div
            className={`${base} ${hover} ${selected}`}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelect(); }}
            aria-pressed={isSelected}
        >
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
                    <Link href={`/rides/${ride.id}`} className="mt-3 block text-sm text-blue-600 hover:underline flex item-center justify-center ">
                        View 
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RideCard