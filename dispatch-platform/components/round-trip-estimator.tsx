"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useTrucks } from "@/hooks/use-trucks"
import { estimateRoundTripTime, type RoundTripEstimate, type TimeEstimateParams } from "@/lib/maps-service"
import { calculateOptimalTruckConfiguration, type OptimalTruckConfig } from "@/lib/truck-optimizer"
import { Loader2, Clock, Truck, MapPin, RotateCw } from "lucide-react"
import { TruckIcon } from "./truck-icon"

export function RoundTripEstimator() {
  const { activeTrucks } = useTrucks()
  const [jobAddress, setJobAddress] = useState("")
  const [totalTonnage, setTotalTonnage] = useState(100)
  const [loadingTime, setLoadingTime] = useState(15)
  const [unloadingTime, setUnloadingTime] = useState(10)
  const [tarpingTime, setTarpingTime] = useState(5)
  const [washoutTime, setWashoutTime] = useState(10)
  const [workingHours, setWorkingHours] = useState(8)

  const [isCalculating, setIsCalculating] = useState(false)
  const [timeEstimate, setTimeEstimate] = useState<RoundTripEstimate | null>(null)
  const [truckConfig, setTruckConfig] = useState<OptimalTruckConfig | null>(null)

  const handleCalculate = async () => {
    if (!jobAddress) return

    setIsCalculating(true)

    try {
      const params: TimeEstimateParams = {
        jobAddress,
        loadingTimeMinutes: loadingTime,
        unloadingTimeMinutes: unloadingTime,
        tarpingTimeMinutes: tarpingTime,
        washoutTimeMinutes: washoutTime,
      }

      const estimate = await estimateRoundTripTime(params)
      setTimeEstimate(estimate)

      if (estimate) {
        const optimizationParams = {
          totalTonnage,
          roundTripTimeMinutes: estimate.totalTimeMinutes,
          availableTrucks: activeTrucks,
          workingHours,
        }

        const config = calculateOptimalTruckConfiguration(optimizationParams)
        setTruckConfig(config)
      }
    } catch (error) {
      console.error("Error calculating estimates:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Round Trip Time Estimator</CardTitle>
          <CardDescription>Calculate round trip times and optimal truck configuration for your job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobAddress">Job Site Address</Label>
              <div className="flex gap-2">
                <Input
                  id="jobAddress"
                  placeholder="Enter job site address"
                  value={jobAddress}
                  onChange={(e) => setJobAddress(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCalculate} disabled={!jobAddress || isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Plant address: 01 Conlon Ave, Mt Morris, NY 14510</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalTonnage">Total Tonnage Required</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="totalTonnage"
                    type="number"
                    min="1"
                    value={totalTonnage}
                    onChange={(e) => setTotalTonnage(Number(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span>tons</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="workingHours"
                    type="number"
                    min="1"
                    max="24"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(Number(e.target.value) || 8)}
                    className="w-24"
                  />
                  <span>hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Time Parameters</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="loadingTime">Loading Time</Label>
                    <span className="text-sm">{loadingTime} minutes</span>
                  </div>
                  <Slider
                    id="loadingTime"
                    min={5}
                    max={60}
                    step={5}
                    value={[loadingTime]}
                    onValueChange={(value) => setLoadingTime(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="unloadingTime">Unloading Time</Label>
                    <span className="text-sm">{unloadingTime} minutes</span>
                  </div>
                  <Slider
                    id="unloadingTime"
                    min={5}
                    max={60}
                    step={5}
                    value={[unloadingTime]}
                    onValueChange={(value) => setUnloadingTime(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tarpingTime">Tarping Time</Label>
                    <span className="text-sm">{tarpingTime} minutes</span>
                  </div>
                  <Slider
                    id="tarpingTime"
                    min={0}
                    max={30}
                    step={5}
                    value={[tarpingTime]}
                    onValueChange={(value) => setTarpingTime(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="washoutTime">Washout Time</Label>
                    <span className="text-sm">{washoutTime} minutes</span>
                  </div>
                  <Slider
                    id="washoutTime"
                    min={0}
                    max={30}
                    step={5}
                    value={[washoutTime]}
                    onValueChange={(value) => setWashoutTime(value[0])}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {timeEstimate && (
        <Card>
          <CardHeader>
            <CardTitle>Time Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Distance</h3>
                    <p>One Way: {timeEstimate.oneWayDistance}</p>
                    <p>Round Trip: {timeEstimate.roundTripDistance}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Travel Time</h3>
                    <p>One Way: {timeEstimate.oneWayTime}</p>
                    <p>Round Trip: {timeEstimate.roundTripTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <RotateCw className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Additional Times</h3>
                    <p>Loading: {timeEstimate.loadingTime}</p>
                    <p>Unloading: {timeEstimate.unloadingTime}</p>
                    <p>Tarping: {timeEstimate.tarpingTime}</p>
                    <p>Washout: {timeEstimate.washoutTime}</p>
                  </div>
                </div>

                <div className="bg-primary/10 p-3 rounded-md">
                  <h3 className="font-medium text-primary">Total Round Trip Time</h3>
                  <p className="text-2xl font-bold">{timeEstimate.totalRoundTripTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {truckConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Optimal Truck Configuration</CardTitle>
            <CardDescription>
              Based on {totalTonnage} tons and {timeEstimate?.totalRoundTripTime} round trip time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Recommended Trucks</h3>
                <div className="space-y-4">
                  {Object.entries(truckConfig.truckCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([truckType, count]) => (
                      <div key={truckType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: getTruckTypeColor(truckType) }}
                          >
                            <Truck className="h-4 w-4 text-white" />
                          </div>
                          <span>{truckType}</span>
                        </div>
                        <div className="font-medium">{count} trucks</div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Total Trucks:</span>
                    <span className="font-bold">{truckConfig.totalTrucks}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Rounds per Truck:</span>
                    <span className="font-bold">{truckConfig.roundsPerTruck}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total Capacity:</span>
                    <span className="font-bold">{truckConfig.totalCapacity} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization:</span>
                    <span className="font-bold">{truckConfig.utilizationPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Completion Estimate</h3>
                <div className="bg-primary/10 p-4 rounded-md">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estimated completion time</p>
                    <p className="text-3xl font-bold text-primary">{truckConfig.estimatedCompletionTime}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {truckConfig.roundsPerTruck} rounds with {truckConfig.totalTrucks} trucks
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-3">Available Active Trucks</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {activeTrucks.slice(0, 8).map((truck) => (
                      <TruckIcon key={truck.truckNumber} truck={truck} size="sm" showStatus={false} />
                    ))}
                    {activeTrucks.length > 8 && (
                      <div className="flex items-center justify-center h-12 bg-muted rounded-md">
                        <span className="text-sm">+{activeTrucks.length - 8} more</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => window.print()}>
              Print Estimate
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// Helper function to get color for truck type
function getTruckTypeColor(truckType: string): string {
  const colors: Record<string, string> = {
    Conveyor: "#9333ea",
    Mixer: "#3b82f6",
    "Dump Truck": "#f97316",
    Slinger: "#eab308",
    Trailer: "#22c55e",
  }

  return colors[truckType] || "#6b7280"
}

