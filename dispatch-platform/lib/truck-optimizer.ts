import type { Truck } from "@/types"

export interface TruckOptimizationParams {
  totalTonnage: number
  roundTripTimeMinutes: number
  availableTrucks: Truck[]
  workingHours: number // in hours
}

export interface OptimalTruckConfig {
  truckCounts: Record<string, number> // truckType -> count
  totalTrucks: number
  totalCapacity: number
  roundsPerTruck: number
  estimatedCompletionTime: string
  utilizationPercentage: number
}

export function calculateOptimalTruckConfiguration(params: TruckOptimizationParams): OptimalTruckConfig {
  const { totalTonnage, roundTripTimeMinutes, availableTrucks, workingHours } = params

  // Group trucks by type and calculate average capacity per type
  const truckTypeCapacities: Record<string, number> = {}
  const truckTypeCounts: Record<string, number> = {}

  availableTrucks.forEach((truck) => {
    if (!truckTypeCapacities[truck.truckType]) {
      truckTypeCapacities[truck.truckType] = 0
      truckTypeCounts[truck.truckType] = 0
    }
    truckTypeCapacities[truck.truckType] += truck.maxTonnage
    truckTypeCounts[truck.truckType]++
  })

  // Calculate average capacity per truck type
  const truckTypeAvgCapacities: Record<string, number> = {}
  Object.keys(truckTypeCapacities).forEach((type) => {
    truckTypeAvgCapacities[type] = truckTypeCapacities[type] / truckTypeCounts[type]
  })

  // Calculate rounds per truck in the working hours
  const workingMinutes = workingHours * 60
  const roundsPerTruck = Math.max(1, Math.floor(workingMinutes / roundTripTimeMinutes))

  // Calculate how many trucks of each type we need
  const truckCounts: Record<string, number> = {}
  let totalCapacity = 0
  let totalTrucks = 0

  // Sort truck types by capacity (descending)
  const sortedTruckTypes = Object.keys(truckTypeAvgCapacities).sort(
    (a, b) => truckTypeAvgCapacities[b] - truckTypeAvgCapacities[a],
  )

  // First, try to use the largest capacity trucks as much as possible
  let remainingTonnage = totalTonnage

  sortedTruckTypes.forEach((truckType) => {
    const avgCapacity = truckTypeAvgCapacities[truckType]
    const availableCount = truckTypeCounts[truckType]

    // Calculate how many trucks of this type we need for one round
    const neededForOneRound = Math.ceil(remainingTonnage / avgCapacity)

    // Calculate how many trucks considering multiple rounds
    const neededTrucks = Math.ceil(neededForOneRound / roundsPerTruck)

    // We can't use more trucks than available
    const trucksToUse = Math.min(neededTrucks, availableCount)

    if (trucksToUse > 0) {
      truckCounts[truckType] = trucksToUse
      totalTrucks += trucksToUse

      const capacityFromThisType = trucksToUse * avgCapacity * roundsPerTruck
      totalCapacity += capacityFromThisType

      remainingTonnage -= capacityFromThisType
      remainingTonnage = Math.max(0, remainingTonnage)
    } else {
      truckCounts[truckType] = 0
    }
  })

  // If we still have remaining tonnage, add more trucks of the largest type
  if (remainingTonnage > 0 && sortedTruckTypes.length > 0) {
    const largestType = sortedTruckTypes[0]
    const additionalTrucks = Math.ceil(remainingTonnage / (truckTypeAvgCapacities[largestType] * roundsPerTruck))

    truckCounts[largestType] = (truckCounts[largestType] || 0) + additionalTrucks
    totalTrucks += additionalTrucks
    totalCapacity += additionalTrucks * truckTypeAvgCapacities[largestType] * roundsPerTruck
  }

  // Calculate estimated completion time
  const utilizationPercentage = Math.min(100, (totalTonnage / Math.max(1, totalCapacity)) * 100)

  // Calculate completion time (assuming all trucks work in parallel)
  const completionMinutes = roundTripTimeMinutes * roundsPerTruck
  const completionHours = Math.floor(completionMinutes / 60)
  const completionMins = completionMinutes % 60

  return {
    truckCounts,
    totalTrucks,
    totalCapacity,
    roundsPerTruck,
    estimatedCompletionTime: `${completionHours}h ${completionMins}m`,
    utilizationPercentage,
  }
}

