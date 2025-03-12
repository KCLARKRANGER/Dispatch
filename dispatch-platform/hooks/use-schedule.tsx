"use client"

import { useState, useEffect, useCallback } from "react"
import type { Job } from "@/types"
import { getAvailableScheduleDates, getJobsForDate, saveJob, updateJob, deleteJob } from "@/lib/google-sheets"
import { toast } from "@/hooks/use-toast"

export function useSchedule(initialDate?: string) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toISOString().split("T")[0])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available dates
  const fetchAvailableDates = useCallback(async () => {
    try {
      const dates = await getAvailableScheduleDates()
      setAvailableDates(dates)

      // If no date is selected and we have dates, select the most recent
      if (!initialDate && dates.length > 0 && !selectedDate) {
        setSelectedDate(dates[0])
      }
    } catch (err) {
      console.error("Error fetching available dates:", err)
      setError("Failed to fetch available dates")
    }
  }, [initialDate, selectedDate])

  // Fetch jobs for the selected date
  const fetchJobs = useCallback(async () => {
    if (!selectedDate) return

    try {
      setLoading(true)
      const jobsData = await getJobsForDate(selectedDate)
      setJobs(jobsData)
      setError(null)
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError("Failed to fetch jobs")
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Initial fetch
  useEffect(() => {
    fetchAvailableDates()
  }, [fetchAvailableDates])

  // Fetch jobs when selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchJobs()
    }
  }, [selectedDate, fetchJobs])

  // Add a new job
  const addJob = useCallback(
    async (jobData: Omit<Job, "id">) => {
      try {
        setLoading(true)
        const result = await saveJob(jobData, selectedDate)

        if (result.success) {
          toast.success("Job added successfully")
          await fetchJobs()
          return { success: true, jobId: result.jobId }
        }

        toast.error(result.error || "Failed to add job")
        return { success: false, error: result.error }
      } catch (err) {
        console.error("Error adding job:", err)
        toast.error("An unexpected error occurred")
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setLoading(false)
      }
    },
    [selectedDate, fetchJobs],
  )

  // Update an existing job
  const updateExistingJob = useCallback(
    async (jobId: string, jobData: Partial<Job>) => {
      try {
        setLoading(true)
        const result = await updateJob(jobId, jobData, selectedDate)

        if (result.success) {
          toast.success("Job updated successfully")
          await fetchJobs()
          return { success: true }
        }

        toast.error(result.error || "Failed to update job")
        return { success: false, error: result.error }
      } catch (err) {
        console.error("Error updating job:", err)
        toast.error("An unexpected error occurred")
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setLoading(false)
      }
    },
    [selectedDate, fetchJobs],
  )

  // Delete a job
  const removeJob = useCallback(
    async (jobId: string) => {
      try {
        setLoading(true)
        const result = await deleteJob(jobId, selectedDate)

        if (result.success) {
          toast.success("Job deleted successfully")
          await fetchJobs()
          return { success: true }
        }

        toast.error(result.error || "Failed to delete job")
        return { success: false, error: result.error }
      } catch (err) {
        console.error("Error deleting job:", err)
        toast.error("An unexpected error occurred")
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setLoading(false)
      }
    },
    [selectedDate, fetchJobs],
  )

  // Change the selected date
  const changeDate = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  // Refresh the current data
  const refreshData = useCallback(async () => {
    await fetchAvailableDates()
    await fetchJobs()
  }, [fetchAvailableDates, fetchJobs])

  return {
    selectedDate,
    availableDates,
    jobs,
    loading,
    error,
    changeDate,
    addJob,
    updateJob: updateExistingJob,
    deleteJob: removeJob,
    refreshData,
  }
}

