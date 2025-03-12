"use client"

import type React from "react"

import { useState } from "react"
import { useTrucks } from "@/hooks/use-trucks"
import { useSchedule } from "@/hooks/use-schedule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TruckIcon } from "@/components/truck-icon"
import type { Truck, Job } from "@/types"
import { MinusCircle, PlusCircle, Loader2, Calculator } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { estimateRoundTripTime, type TimeEstimateParams } from "@/lib/maps-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

export function JobAssignment() {
  const { activeTrucks } = useTrucks()
  const { addJob, loading: saveLoading } = useSchedule()

  const [jobName, setJobName] = useState("")
  const [jobLocation, setJobLocation] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [selectedTrucks, setSelectedTrucks] = useState<Truck[]>([])
  const [rounds, setRounds] = useState(1)
  const [selectedTruckId, setSelectedTruckId] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Time estimator state
  const [showEstimator, setShowEstimator] = useState(false)
  const [loadingTime, setLoadingTime] = useState(15)
  const [unloadingTime, setUnloadingTime] = useState(10)
  const [tarpingTime, setTarpingTime] = useState(5)
  const [washoutTime, setWashoutTime] = useState(10)
  const [isCalculating, setIsCalculating] = useState(false)
  const [timeEstimate, setTimeEstimate] = useState<string | null>(null)

  // Calculate total tonnage based on selected trucks and rounds
  const totalTonnage = selectedTrucks.reduce((total, truck) => total + truck.maxTonnage, 0) * rounds

  const handleAddTruck = () => {
    const truckToAdd = activeTrucks.find((t) => t.truckNumber === selectedTruckId)
    if (truckToAdd && !selectedTrucks.some((t) => t.truckNumber === truckToAdd.truckNumber)) {
      setSelectedTrucks([...selectedTrucks, truckToAdd])
      setSelectedTruckId("")
    }
  }

  const handleRemoveTruck = (truckNumber: string) => {
    setSelectedTrucks(selectedTrucks.filter((t) => t.truckNumber !== truckNumber))
  }

  const handleCalculateTime = async () => {
    if (!jobLocation) {
      toast({
        title: "Error",
        description: "Please enter a job location to calculate time",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)

    try {
      const params: TimeEstimateParams = {
        jobAddress: jobLocation,
        loadingTimeMinutes: loadingTime,
        unloadingTimeMinutes: unloadingTime,
        tarpingTimeMinutes: tarpingTime,
        washoutTimeMinutes: washoutTime,
      }

      const estimate = await estimateRoundTripTime(params)

      if (estimate) {
        setTimeEstimate(estimate.totalRoundTripTime)

        // Auto-calculate end time if start time is set
        if (startTime) {
          const [hours, minutes] = startTime.split(":").map(Number)
          const startDate = new Date()
          startDate.setHours(hours, minutes, 0)

          const endDate = new Date(startDate.getTime() + estimate.totalTimeMinutes * 60 * 1000)
          const endHours = endDate.getHours().toString().padStart(2, "0")
          const endMinutes = endDate.getMinutes().toString().padStart(2, "0")

          setEndTime(`${endHours}:${endMinutes}`)
        }

        toast({
          title: "Time Estimate",
          description: `Estimated round trip time: ${estimate.totalRoundTripTime}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate time estimate",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setShowEstimator(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const jobData: Omit<Job, "id"> = {
        name: jobName,
        location: jobLocation,
        description: jobDescription,
        totalTonnage,
        rounds,
        trucks: selectedTrucks,
        startTime,
        endTime,
        status: "Scheduled",
      }

      const result = await addJob(jobData)

      if (result.success) {
        // Reset form
        setJobName("")
        setJobLocation("")
        setJobDescription("")
        setSelectedTrucks([])
        setRounds(1)
        setSelectedTruckId("")
        setStartTime("")
        setEndTime("")
        setTimeEstimate(null)

        toast({
          title: "Job Created",
          description: `Job "${jobName}" has been scheduled successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
        <CardDescription>Assign trucks to a job and save it to today's schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name</Label>
              <Input
                id="jobName"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Enter job name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobLocation">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="jobLocation"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Enter job location"
                  required
                  className="flex-1"
                />
                <Dialog open={showEstimator} onOpenChange={setShowEstimator}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Calculate Round Trip Time</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Loading Time</Label>
                        <div className="flex justify-between text-sm">
                          <span>Time: {loadingTime} minutes</span>
                        </div>
                        <Slider
                          min={5}
                          max={60}
                          step={5}
                          value={[loadingTime]}
                          onValueChange={(value) => setLoadingTime(value[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unloading Time</Label>
                        <div className="flex justify-between text-sm">
                          <span>Time: {unloadingTime} minutes</span>
                        </div>
                        <Slider
                          min={5}
                          max={60}
                          step={5}
                          value={[unloadingTime]}
                          onValueChange={(value) => setUnloadingTime(value[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tarping Time</Label>
                        <div className="flex justify-between text-sm">
                          <span>Time: {tarpingTime} minutes</span>
                        </div>
                        <Slider
                          min={0}
                          max={30}
                          step={5}
                          value={[tarpingTime]}
                          onValueChange={(value) => setTarpingTime(value[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Washout Time</Label>
                        <div className="flex justify-between text-sm">
                          <span>Time: {washoutTime} minutes</span>
                        </div>
                        <Slider
                          min={0}
                          max={30}
                          step={5}
                          value={[washoutTime]}
                          onValueChange={(value) => setWashoutTime(value[0])}
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleCalculateTime}
                        disabled={!jobLocation || isCalculating}
                        className="w-full"
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          "Calculate Time"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {timeEstimate && (
                <p className="text-sm text-muted-foreground">Estimated round trip time: {timeEstimate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Description (Optional)</Label>
            <Input
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter job description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Estimated)</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Assign Trucks</Label>

            <div className="flex gap-2">
              <Select value={selectedTruckId} onValueChange={setSelectedTruckId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a truck" />
                </SelectTrigger>
                <SelectContent>
                  {activeTrucks
                    .filter((truck) => !selectedTrucks.some((t) => t.truckNumber === truck.truckNumber))
                    .map((truck) => (
                      <SelectItem key={truck.truckNumber} value={truck.truckNumber}>
                        {truck.truckNumber} - {truck.driverName} ({truck.truckType})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddTruck} disabled={!selectedTruckId} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {selectedTrucks.length > 0 ? (
              <div className="border rounded-md p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Selected Trucks:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedTrucks.map((truck) => (
                      <div key={truck.truckNumber} className="relative group">
                        <TruckIcon truck={truck} size="sm" />
                        <button
                          type="button"
                          onClick={() => handleRemoveTruck(truck.truckNumber)}
                          className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MinusCircle className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="rounds">Number of Rounds</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setRounds(Math.max(1, rounds - 1))}
                        className="bg-gray-200 rounded-full p-1"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                      <Input
                        id="rounds"
                        type="number"
                        min="1"
                        value={rounds}
                        onChange={(e) => setRounds(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setRounds(rounds + 1)}
                        className="bg-gray-200 rounded-full p-1"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>
                      <span className="ml-2 text-sm text-gray-500">round(s)</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Trucks per round:</span>
                      <span>{selectedTrucks.length}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Tonnage per round:</span>
                      <span>{selectedTrucks.reduce((total, truck) => total + truck.maxTonnage, 0)} tons</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-lg font-bold">
                      <span>Total tonnage:</span>
                      <span>{totalTonnage} tons</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-gray-500">No trucks selected</p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={selectedTrucks.length === 0 || !jobName || !jobLocation || submitting || saveLoading}
          className="w-full"
        >
          {submitting || saveLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Job...
            </>
          ) : (
            "Create Job"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

