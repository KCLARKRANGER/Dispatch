"use server"

import { cache } from "react"

const PLANT_ADDRESS = "01 Conlon Ave, Mt Morris, NY 14510"

export interface TravelTimeEstimate {
  oneWayDistance: string
  oneWayTime: string
  roundTripDistance: string
  roundTripTime: string
  oneWayTimeSeconds: number
  roundTripTimeSeconds: number
}

// Cache the result to avoid unnecessary API calls
export const getDistanceMatrix = cache(async (destination: string): Promise<TravelTimeEstimate | null> => {
  try {
    // For demo purposes, we'll simulate the API call with realistic values
    const destinationLength = destination.length
    const distanceKm = 5 + (destinationLength % 20) // Between 5 and 24 km
    const durationMin = 10 + (destinationLength % 30) // Between 10 and 39 minutes

    return {
      oneWayDistance: `${distanceKm} km`,
      oneWayTime: `${durationMin} mins`,
      roundTripDistance: `${distanceKm * 2} km`,
      roundTripTime: `${durationMin * 2} mins`,
      oneWayTimeSeconds: durationMin * 60,
      roundTripTimeSeconds: durationMin * 60 * 2,
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    return null
  }
})

export interface TimeEstimateParams {
  jobAddress: string
  loadingTimeMinutes: number
  unloadingTimeMinutes: number
  tarpingTimeMinutes: number
  washoutTimeMinutes: number
}

export interface RoundTripEstimate extends TravelTimeEstimate {
  loadingTime: string
  unloadingTime: string
  tarpingTime: string
  washoutTime: string
  totalRoundTripTime: string
  totalTimeMinutes: number
}

export async function estimateRoundTripTime(params: TimeEstimateParams): Promise<RoundTripEstimate | null> {
  const travelTime = await getDistanceMatrix(params.jobAddress)

  if (!travelTime) {
    return null
  }

  const totalTimeSeconds =
    travelTime.roundTripTimeSeconds +
    params.loadingTimeMinutes * 60 +
    params.unloadingTimeMinutes * 60 +
    params.tarpingTimeMinutes * 60 +
    params.washoutTimeMinutes * 60

  const totalTimeMinutes = Math.round(totalTimeSeconds / 60)
  const hours = Math.floor(totalTimeMinutes / 60)
  const minutes = totalTimeMinutes % 60

  return {
    ...travelTime,
    loadingTime: `${params.loadingTimeMinutes} mins`,
    unloadingTime: `${params.unloadingTimeMinutes} mins`,
    tarpingTime: `${params.tarpingTimeMinutes} mins`,
    washoutTime: `${params.washoutTimeMinutes} mins`,
    totalRoundTripTime: hours > 0 ? `${hours} hr ${minutes} mins` : `${minutes} mins`,
    totalTimeMinutes: totalTimeMinutes,
  }
}

