"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTrucks } from "@/hooks/use-trucks"
import { TruckIcon } from "@/components/truck-icon"
import type { DispatchStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, TruckIcon as TruckIconLucide } from "lucide-react"

// Mock locations for demo purposes
const LOCATIONS = [
  { id: "location1", name: "Main Yard" },
  { id: "location2", name: "North Site" },
  { id: "location3", name: "South Quarry" },
]

// All possible dispatch statuses
const DISPATCH_STATUSES: DispatchStatus[] = [
  "In Yard",
  "Loading",
  "In Route",
  "On Job",
  "Unloading",
  "Cleanout",
  "Returning",
  "Load Complete",
]

export function DispatchBoard() {
  const { trucks, loading, refreshTrucks } = useTrucks()
  const [selectedLocation, setSelectedLocation] = useState<string | "all">("all")
  const [dispatchStatuses, setDispatchStatuses] = useState<Record<string, DispatchStatus>>({})

  // Set initial random statuses for demo purposes
  useEffect(() => {
    if (trucks.length > 0 && Object.keys(dispatchStatuses).length === 0) {
      const initialStatuses: Record<string, DispatchStatus> = {}
      trucks.forEach((truck) => {
        if (truck.status === "Active") {
          const randomStatus = DISPATCH_STATUSES[Math.floor(Math.random() * DISPATCH_STATUSES.length)]
          initialStatuses[truck.truckNumber] = randomStatus
        }
      })
      setDispatchStatuses(initialStatuses)
    }
  }, [trucks, dispatchStatuses])

  // Filter trucks by location and active status
  const displayedTrucks = trucks.filter((truck) => {
    return truck.status === "Active" && (selectedLocation === "all" || truck.location === selectedLocation)
  })

  // Update a truck's status
  const updateTruckStatus = (truckNumber: string, newStatus: DispatchStatus) => {
    setDispatchStatuses((prev) => ({
      ...prev,
      [truckNumber]: newStatus,
    }))
  }

  // Handle drag and drop for trucks
  const handleDragStart = (e: React.DragEvent, truckNumber: string, currentStatus: DispatchStatus) => {
    e.dataTransfer.setData("truckNumber", truckNumber)
    e.dataTransfer.setData("currentStatus", currentStatus)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetStatus: DispatchStatus) => {
    e.preventDefault()
    const truckNumber = e.dataTransfer.getData("truckNumber")
    const currentStatus = e.dataTransfer.getData("currentStatus") as DispatchStatus

    if (currentStatus !== targetStatus) {
      updateTruckStatus(truckNumber, targetStatus)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Dispatch Board</h2>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 rounded px-3 py-1"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <TruckIconLucide className="h-5 w-5 text-gray-500" />
          </div>

          <Button onClick={refreshTrucks} disabled={loading} variant="outline" size="sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {DISPATCH_STATUSES.map((status) => (
          <Card
            key={status}
            className="border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[100px] grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayedTrucks
                  .filter((truck) => dispatchStatuses[truck.truckNumber] === status)
                  .map((truck) => (
                    <div
                      key={truck.truckNumber}
                      draggable
                      onDragStart={(e) => handleDragStart(e, truck.truckNumber, status)}
                      className="cursor-move"
                    >
                      <TruckIcon truck={{ ...truck, dispatchStatus: status }} size="sm" showStatus={false} />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

