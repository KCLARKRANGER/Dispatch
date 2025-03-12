"use client"

import { useCallback, useEffect, useState } from "react"
import type { Truck, TruckStatus } from "@/types"
import { getAllTrucks, addTruck, updateTruckStatus } from "@/lib/google-sheets"

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrucks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllTrucks()
      setTrucks(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch trucks")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrucks()
  }, [fetchTrucks])

  const addNewTruck = useCallback(
    async (truckData: Omit<Truck, "id" | "status" | "dispatchStatus">) => {
      try {
        setLoading(true)
        const result = await addTruck({
          truckNumber: truckData.truckNumber,
          driverName: truckData.driverName,
          truckType: truckData.truckType,
          maxTonnage: truckData.maxTonnage,
          isContractor: truckData.isContractor,
        })

        if (result.success) {
          await fetchTrucks()
          return { success: true }
        }
        return { success: false, error: result.error || "Failed to add truck" }
      } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to add truck" }
      } finally {
        setLoading(false)
      }
    },
    [fetchTrucks],
  )

  const toggleTruckStatus = useCallback(async (truckNumber: string, status: TruckStatus) => {
    try {
      setLoading(true)
      const result = await updateTruckStatus(truckNumber, status)

      if (result.success) {
        setTrucks((prev) => prev.map((truck) => (truck.truckNumber === truckNumber ? { ...truck, status } : truck)))
        return { success: true }
      }
      return { success: false, error: result.error || "Failed to update status" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "Failed to update status" }
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter trucks by various criteria
  const filterTrucks = useCallback(
    (criteria: {
      status?: TruckStatus
      truckType?: string
      location?: string
      isContractor?: boolean
    }) => {
      return trucks.filter((truck) => {
        if (criteria.status && truck.status !== criteria.status) return false
        if (criteria.truckType && truck.truckType !== criteria.truckType) return false
        if (criteria.location && truck.location !== criteria.location) return false
        if (criteria.isContractor !== undefined && truck.isContractor !== criteria.isContractor) return false
        return true
      })
    },
    [trucks],
  )

  return {
    trucks,
    loading,
    error,
    refreshTrucks: fetchTrucks,
    addNewTruck,
    toggleTruckStatus,
    filterTrucks,
    activeTrucks: trucks.filter((t) => t.status === "Active"),
  }
}

