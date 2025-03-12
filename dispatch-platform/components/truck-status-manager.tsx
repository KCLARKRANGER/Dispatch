"use client"

import { useState } from "react"
import { useTrucks } from "@/hooks/use-trucks"
import { TruckIcon } from "@/components/truck-icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CheckIcon, XIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { TruckStatus, Truck } from "@/types"

export function TruckStatusManager() {
  const { trucks, toggleTruckStatus, loading, refreshTrucks } = useTrucks()
  const [filter, setFilter] = useState<TruckStatus | "All">("All")
  const [updating, setUpdating] = useState<string | null>(null)

  const filteredTrucks = filter === "All" ? trucks : trucks.filter((truck) => truck.status === filter)

  const handleToggleStatus = async (truck: Truck) => {
    const newStatus: TruckStatus = truck.status === "Active" ? "Inactive" : "Active"
    setUpdating(truck.truckNumber)

    try {
      const result = await toggleTruckStatus(truck.truckNumber, newStatus)

      if (result.success) {
        toast({
          title: "Success",
          description: `Truck ${truck.truckNumber} is now ${newStatus}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Truck Status Management</h2>

      <Tabs defaultValue="All" className="w-full" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="All">All Trucks</TabsTrigger>
          <TabsTrigger value="Active">Active</TabsTrigger>
          <TabsTrigger value="Inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <p>Loading trucks...</p>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-gray-500">No trucks found</p>
              <Button variant="outline" onClick={refreshTrucks} className="mt-4">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredTrucks.map((truck) => (
                <div key={truck.truckNumber} className="flex flex-col items-center">
                  <TruckIcon truck={truck} showStatus />
                  <Button
                    variant={truck.status === "Active" ? "outline" : "default"}
                    size="sm"
                    className="mt-2"
                    onClick={() => handleToggleStatus(truck)}
                    disabled={updating === truck.truckNumber}
                  >
                    {updating === truck.truckNumber ? (
                      "Updating..."
                    ) : truck.status === "Active" ? (
                      <>
                        <XIcon className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

