"use client"
import type { Truck } from "@/types"
import { cn } from "@/lib/utils"

interface TruckIconProps {
  truck: Truck
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  showStatus?: boolean
  isDraggable?: boolean
}

export function TruckIcon({
  truck,
  size = "md",
  onClick,
  className,
  showStatus = true,
  isDraggable = false,
}: TruckIconProps) {
  // Size mapping
  const sizeClasses = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-20 h-20 text-base",
  }

  // Truck type color mapping
  const colorClasses = {
    Conveyor: "bg-purple-500 border-purple-600",
    Mixer: "bg-blue-500 border-blue-600",
    "Dump Truck": "bg-orange-500 border-orange-600",
    Slinger: "bg-yellow-500 border-yellow-600",
    Trailer: "bg-green-500 border-green-600",
  }

  // Status indicator classes
  const statusClasses = {
    Active: "bg-green-400",
    Inactive: "bg-gray-400",
  }

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {showStatus && (
        <div
          className={cn(
            "absolute -top-3 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-semibold text-white",
            statusClasses[truck.status] || "bg-gray-400",
          )}
        >
          {truck.status}
        </div>
      )}

      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white border-2 cursor-pointer transition-transform hover:scale-105",
          sizeClasses[size],
          colorClasses[truck.truckType as keyof typeof colorClasses] || "bg-gray-500 border-gray-600",
        )}
        onClick={onClick}
        draggable={isDraggable}
      >
        {truck.truckNumber}
        {truck.isContractor && (
          <span className="absolute -top-1 -right-1 bg-white text-xs w-5 h-5 rounded-full flex items-center justify-center text-black font-bold border border-gray-300">
            C
          </span>
        )}
      </div>

      <div className="mt-1 text-center">
        <p className="text-xs font-medium truncate max-w-[80px]">{truck.driverName}</p>
        {truck.dispatchStatus && <p className="text-xs text-gray-500">{truck.dispatchStatus}</p>}
      </div>
    </div>
  )
}

