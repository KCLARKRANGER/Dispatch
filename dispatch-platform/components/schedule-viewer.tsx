"use client"

import { useState } from "react"
import { useSchedule } from "@/hooks/use-schedule"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TruckIcon } from "@/components/truck-icon"
import type { Job } from "@/types"
import { Calendar, Clock, MapPin, Truck, Loader2, RefreshCw, Edit, Trash2, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export function ScheduleViewer() {
  const { selectedDate, availableDates, jobs, loading, changeDate, refreshData, deleteJob, updateJob } = useSchedule()

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDateChange = (date: string) => {
    changeDate(date)
  }

  const handleDeleteJob = async () => {
    if (!selectedJob) return

    setIsDeleting(true)
    try {
      const result = await deleteJob(selectedJob.id)

      if (result.success) {
        setIsDeleteDialogOpen(false)
        setSelectedJob(null)
        toast({
          title: "Job Deleted",
          description: `Job "${selectedJob.name}" has been deleted.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateJobStatus = async (job: Job, newStatus: Job["status"]) => {
    try {
      const result = await updateJob(job.id, { status: newStatus })

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Job "${job.name}" status changed to ${newStatus}.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Schedule Viewer</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedDate} onValueChange={handleDateChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.length > 0 ? (
                availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-dates" disabled>
                  No schedules available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule for {formatDate(selectedDate)}</CardTitle>
            <CardDescription>
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-md">
                <p className="text-gray-500">No jobs scheduled for this date</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => changeDate(new Date().toISOString().split("T")[0])}
                >
                  Go to Today's Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className={`h-2 ${getStatusColor(job.status)}`} />
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{job.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          {job.description && <p className="text-sm mt-2">{job.description}</p>}
                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center text-sm">
                              <Truck className="h-4 w-4 mr-1 text-gray-500" />
                              <span>
                                {job.trucks.length} truck{job.trucks.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-medium mr-1">Rounds:</span>
                              <span>{job.rounds}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-medium mr-1">Total:</span>
                              <span>{job.totalTonnage} tons</span>
                            </div>
                            {job.startTime && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <span>
                                  {formatTime(job.startTime)}
                                  {job.endTime ? ` - ${formatTime(job.endTime)}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Clone
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>

                          <Select
                            value={job.status}
                            onValueChange={(value) => handleUpdateJobStatus(job, value as Job["status"])}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {job.trucks.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-3">Assigned Trucks:</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {job.trucks.map((truck) => (
                              <TruckIcon key={truck.truckNumber} truck={truck} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job "{selectedJob?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to format time
function formatTime(timeString: string): string {
  // If the time is already in HH:MM format, convert to 12-hour format
  if (timeString.includes(":")) {
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }
  return timeString
}

// Helper function to get status color
function getStatusColor(status: Job["status"]): string {
  switch (status) {
    case "Scheduled":
      return "bg-blue-500"
    case "In Progress":
      return "bg-yellow-500"
    case "Completed":
      return "bg-green-500"
    case "Cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

