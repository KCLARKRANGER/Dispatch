export type TruckType = "Conveyor" | "Mixer" | "Dump Truck" | "Slinger" | "Trailer"

export type TruckStatus = "Active" | "Inactive"

export type DispatchStatus =
  | "In Yard"
  | "Loading"
  | "In Route"
  | "On Job"
  | "Unloading"
  | "Cleanout"
  | "Returning"
  | "Load Complete"

export interface Truck {
  id?: string
  truckNumber: string
  driverName: string
  truckType: TruckType
  maxTonnage: number
  isContractor: boolean
  status: TruckStatus
  dispatchStatus?: DispatchStatus
  location?: string
}

export interface Job {
  id: string
  name: string
  location: string
  description?: string
  totalTonnage: number
  rounds: number
  trucks: Truck[]
  startTime?: string
  endTime?: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  createdAt?: string
  updatedAt?: string
}

export interface Location {
  id: string
  name: string
  address?: string
}

export interface ScheduleDay {
  date: string
  jobs: Job[]
}

