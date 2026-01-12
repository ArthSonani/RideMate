import Link from "next/link";
import { CiCalendar } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";


function RideItem({ ride }) {
  const rideDateObj = ride?.date ? new Date(ride.date) : null;
  const rideDateStr = rideDateObj
    ? rideDateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Date TBD";
  const statusStyle =
    ride?.status === "scheduled"
      ? "bg-green-100 text-green-700"
      : ride?.status === "completed"
      ? "bg-blue-100 text-blue-700"
      : ride?.status === "cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  const rideTimeStr = rideDateObj
    ? rideDateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "--:--";

    return (
        <div className="rounded-xl border border-neutral-300 bg-white p-4 shadow-md hover:shadow-xl transition-all duration-150 flex gap-6 min-h-[140px] overflow-hidden">
            <div className="flex-1 flex items-start gap-4 overflow-hidden">
                <div className="flex flex-col items-center pt-1">
                    <span className="w-3 h-3 rounded-full border-2 border-neutral-500 bg-white"></span>
                    <span className="w-[2px] h-14 sm:h-16 bg-gradient-to-b from-neutral-400 via-neutral-500 to-neutral-600 my-1"></span>
                    <span className="w-3 h-3 rounded-full bg-neutral-600"></span>
                </div>
                <div className="flex flex-col justify-between py-1">
                    <div>
                        <div className="text-xs font-semibold tracking-wide text-gray-400">FROM</div>
                        <div className="text-md font-medium text-gray-900 truncate max-w-[28ch] sm:max-w-[36ch]">
                            {ride?.source?.address || "Unknown pickup"}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="text-xs font-semibold tracking-wide text-gray-400">TO</div>
                        <div className="text-md font-medium text-gray-900 truncate max-w-[28ch] sm:max-w-[36ch]">
                            {ride?.destination?.address || "Unknown drop-off"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:w-[32%] sm:w-[36%] hidden sm:flex flex-col justify-between border-l border-r border-neutral-300 px-5 ">
                <div className="text-xs text-gray-600">
                    <div className="my-2 flex items-center gap-2">
                        <img src={`/${ride?.vehicleType || "car"}.png`} alt={ride?.vehicleType || "vehicle"} className="h-6 w-6 object-contain" />
                        <span className="uppercase font-semibold"> {ride?.vehicleType || "Car"}</span>
                    </div>
                    <div className="font-medium flex items-center gap-10 sm:gap-0 sm:justify-between">
                        <div className="flex items-center gap-3 sm:gap-1">
                            <CiCalendar size={20} className="stroke-[1px]"/>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Date</div>
                                <div className="text-sm font-semibold text-gray-900">{rideDateStr}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-1">
                            <IoMdTime size={20} className="stroke-[5px]"/>  
                            <div>
                                <div className="text-xs font-medium text-gray-500">Time</div>
                                <div className="text-sm font-semibold text-gray-900">{rideTimeStr}</div> 
                            </div>  
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Seats: {ride?.availableSeats ?? "-"}/{ride?.totalSeats ?? "-"}</span>
                </div>
            </div>

            <div className="lg:w-[20%] hidden sm:flex flex-col items-end justify-start sm:w-[12%]">
                <span className={`inline-block rounded px-2 py-0.5 text-xs capitalize ${statusStyle}`}>
                    {ride?.status || "pending"}
                </span>
                <Link href={`/rides/${ride.id}`} className="group mt-3 block text-sm text-blue-600 hover:text-blue-800 flex item-center justify-center ">
                    View 
                    <svg className="ml-2 h-5 w-5 transition-all duration-150 ease-out transform group-hover:translate-x-1 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
                <div className="mt-auto">
                    {ride.requestsCount > 0? 
                        <span className="ml-3 text-[11px] text-yellow-600">{ride.requestsCount} incoming requests</span>:
                        <span className="ml-3 text-[11px] text-gray-600">No incoming requests</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default RideItem;