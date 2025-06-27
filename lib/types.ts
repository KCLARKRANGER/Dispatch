export interface TruckEntry {
  jobName: string
  accountType: string
  truckType: string
  truckNumber: string
  date: string
  quantity: string
  materials: string
  location: string
  accountNumber: string
  pit: string
  delivered: string
  notes?: string
  pay?: boolean
  startTime?: string
  loadTime?: string
}

export interface ReportData {
  date: string
  createdBy: string
  createdAt: string
  totalEntries: number
  slingers: TruckEntry[]
  dumpTrucks: TruckEntry[]
  tractors: TruckEntry[]
  asphaltTrucks: TruckEntry[] // Added new category for asphalt trucks
  mixers?: TruckEntry[]
}
