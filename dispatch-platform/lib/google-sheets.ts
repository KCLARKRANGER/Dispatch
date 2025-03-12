"use server"

import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import type { Job } from "@/types"

// Setup Google Sheets client with credentials
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"]

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Get today's date formatted
function getTodayFormatted(): string {
  return formatDate(new Date())
}

// Get or create the spreadsheet
export async function getOrCreateSpreadsheet() {
  try {
    // Ensure environment variables are properly accessed
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    if (!email) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is not set")
    }

    const key = process.env.GOOGLE_PRIVATE_KEY
    if (!key) {
      throw new Error("GOOGLE_PRIVATE_KEY environment variable is not set")
    }

    const spreadsheetId = process.env.SPREADSHEET_ID
    if (!spreadsheetId) {
      throw new Error("SPREADSHEET_ID environment variable is not set")
    }

    const jwt = new JWT({
      email,
      key,
      scopes: SCOPES,
    })

    const doc = new GoogleSpreadsheet(spreadsheetId, jwt)
    await doc.loadInfo()

    // Ensure we have a trucks sheet
    let trucksSheet = doc.sheetsByTitle["Trucks"]
    if (!trucksSheet) {
      // Create the trucks sheet if it doesn't exist
      trucksSheet = await doc.addSheet({
        title: "Trucks",
        headerValues: ["Truck Number", "Driver Name", "Truck Type", "Max Tonnage", "Is Contractor", "Status"],
      })
    }

    return doc
  } catch (error) {
    console.error("Error accessing Google Sheets:", error)
    throw new Error("Failed to connect to Google Sheets")
  }
}

// Get the trucks sheet
export async function getTrucksSheet() {
  const doc = await getOrCreateSpreadsheet()
  let trucksSheet = doc.sheetsByTitle["Trucks"]

  // If the sheet doesn't exist, create it
  if (!trucksSheet) {
    trucksSheet = await doc.addSheet({
      title: "Trucks",
      headerValues: ["Truck Number", "Driver Name", "Truck Type", "Max Tonnage", "Is Contractor", "Status"],
    })
  }

  return trucksSheet
}

// Get all trucks from the sheet
export async function getAllTrucks() {
  try {
    const sheet = await getTrucksSheet()
    const rows = await sheet.getRows()

    return rows.map((row) => ({
      truckNumber: row.get("Truck Number"),
      driverName: row.get("Driver Name"),
      truckType: row.get("Truck Type"),
      maxTonnage: Number.parseFloat(row.get("Max Tonnage") || "0"),
      isContractor: row.get("Is Contractor") === "Yes",
      status: row.get("Status") || "Active",
    }))
  } catch (error) {
    console.error("Error fetching trucks:", error)
    return []
  }
}

// Add a new truck to the sheet
export async function addTruck(truckData: {
  truckNumber: string
  driverName: string
  truckType: string
  maxTonnage: number
  isContractor: boolean
}) {
  try {
    const sheet = await getTrucksSheet()

    await sheet.addRow({
      "Truck Number": truckData.truckNumber,
      "Driver Name": truckData.driverName,
      "Truck Type": truckData.truckType,
      "Max Tonnage": truckData.maxTonnage.toString(),
      "Is Contractor": truckData.isContractor ? "Yes" : "No",
      Status: "Active",
    })

    return { success: true }
  } catch (error) {
    console.error("Error adding truck:", error)
    return { success: false, error: "Failed to add truck" }
  }
}

// Update truck status (active/inactive)
export async function updateTruckStatus(truckNumber: string, status: "Active" | "Inactive") {
  try {
    const sheet = await getTrucksSheet()
    const rows = await sheet.getRows()

    const truckRow = rows.find((row) => row.get("Truck Number") === truckNumber)
    if (truckRow) {
      truckRow.set("Status", status)
      await truckRow.save()
      return { success: true }
    }

    return { success: false, error: "Truck not found" }
  } catch (error) {
    console.error("Error updating truck status:", error)
    return { success: false, error: "Failed to update truck status" }
  }
}

// Get or create a daily schedule sheet
export async function getDailyScheduleSheet(date: string = getTodayFormatted()) {
  const doc = await getOrCreateSpreadsheet()
  const sheetTitle = `Schedule-${date}`

  let scheduleSheet = doc.sheetsByTitle[sheetTitle]

  // If the sheet doesn't exist, create it
  if (!scheduleSheet) {
    scheduleSheet = await doc.addSheet({
      title: sheetTitle,
      headerValues: [
        "Job ID",
        "Job Name",
        "Location",
        "Description",
        "Total Tonnage",
        "Rounds",
        "Start Time",
        "End Time",
        "Status",
        "Assigned Trucks", // JSON string of assigned trucks
        "Created At",
        "Updated At",
      ],
    })
  }

  return scheduleSheet
}

// Get all available schedule dates
export async function getAvailableScheduleDates() {
  try {
    const doc = await getOrCreateSpreadsheet()
    const scheduleSheets = Object.keys(doc.sheetsByTitle)
      .filter((title) => title.startsWith("Schedule-"))
      .map((title) => title.replace("Schedule-", ""))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort newest first

    return scheduleSheets
  } catch (error) {
    console.error("Error fetching schedule dates:", error)
    return []
  }
}

// Save a job to the daily schedule
export async function saveJob(job: Omit<Job, "id">, date: string = getTodayFormatted()) {
  try {
    const sheet = await getDailyScheduleSheet(date)
    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const now = new Date().toISOString()

    await sheet.addRow({
      "Job ID": jobId,
      "Job Name": job.name,
      Location: job.location,
      Description: job.description || "",
      "Total Tonnage": job.totalTonnage.toString(),
      Rounds: job.rounds.toString(),
      "Start Time": job.startTime || "",
      "End Time": job.endTime || "",
      Status: job.status,
      "Assigned Trucks": JSON.stringify(job.trucks),
      "Created At": now,
      "Updated At": now,
    })

    return { success: true, jobId }
  } catch (error) {
    console.error("Error saving job:", error)
    return { success: false, error: "Failed to save job" }
  }
}

// Get all jobs for a specific date
export async function getJobsForDate(date: string = getTodayFormatted()) {
  try {
    const sheet = await getDailyScheduleSheet(date)
    const rows = await sheet.getRows()

    return rows.map((row) => ({
      id: row.get("Job ID"),
      name: row.get("Job Name"),
      location: row.get("Location"),
      description: row.get("Description"),
      totalTonnage: Number.parseFloat(row.get("Total Tonnage") || "0"),
      rounds: Number.parseInt(row.get("Rounds") || "1"),
      startTime: row.get("Start Time"),
      endTime: row.get("End Time"),
      status: row.get("Status") as Job["status"],
      trucks: JSON.parse(row.get("Assigned Trucks") || "[]"),
      createdAt: row.get("Created At"),
      updatedAt: row.get("Updated At"),
    }))
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return []
  }
}

// Update an existing job
export async function updateJob(jobId: string, jobData: Partial<Job>, date: string = getTodayFormatted()) {
  try {
    const sheet = await getDailyScheduleSheet(date)
    const rows = await sheet.getRows()

    const jobRow = rows.find((row) => row.get("Job ID") === jobId)
    if (!jobRow) {
      return { success: false, error: "Job not found" }
    }

    // Update only the fields that are provided
    if (jobData.name) jobRow.set("Job Name", jobData.name)
    if (jobData.location) jobRow.set("Location", jobData.location)
    if (jobData.description !== undefined) jobRow.set("Description", jobData.description || "")
    if (jobData.totalTonnage !== undefined) jobRow.set("Total Tonnage", jobData.totalTonnage.toString())
    if (jobData.rounds !== undefined) jobRow.set("Rounds", jobData.rounds.toString())
    if (jobData.startTime !== undefined) jobRow.set("Start Time", jobData.startTime || "")
    if (jobData.endTime !== undefined) jobRow.set("End Time", jobData.endTime || "")
    if (jobData.status) jobRow.set("Status", jobData.status)
    if (jobData.trucks) jobRow.set("Assigned Trucks", JSON.stringify(jobData.trucks))

    jobRow.set("Updated At", new Date().toISOString())
    await jobRow.save()

    return { success: true }
  } catch (error) {
    console.error("Error updating job:", error)
    return { success: false, error: "Failed to update job" }
  }
}

// Delete a job
export async function deleteJob(jobId: string, date: string = getTodayFormatted()) {
  try {
    const sheet = await getDailyScheduleSheet(date)
    const rows = await sheet.getRows()

    const jobRowIndex = rows.findIndex((row) => row.get("Job ID") === jobId)
    if (jobRowIndex === -1) {
      return { success: false, error: "Job not found" }
    }

    await rows[jobRowIndex].delete()
    return { success: true }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { success: false, error: "Failed to delete job" }
  }
}

// Helper function to determine max tonnage based on truck type
function determineMaxTonnage(truckType: string): string {
  switch (truckType) {
    case "Conveyor":
      return "12"
    case "Mixer":
      return "15"
    case "Dump Truck":
      return "20"
    case "Slinger":
      return "10"
    case "Trailer":
      return "25"
    default:
      return "20"
  }
}

// Fetch initial data from the provided CSV URL
export async function importInitialDataFromCSV() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRUCKS%20LIST-d0L13yfkSfF3oJo4YiVOzxuwMzaORE.csv",
    )
    const csvText = await response.text()

    // Process CSV data
    const rows = csvText.split("\n").map((row) => row.split(","))

    // Skip header row and empty rows
    const data = rows.slice(1).filter((row) => row.length >= 2 && row[0].trim() !== "")

    const sheet = await getTrucksSheet()

    // Clear existing data
    await sheet.clear()
    await sheet.setHeaderRow(["Truck Number", "Driver Name", "Truck Type", "Max Tonnage", "Is Contractor", "Status"])

    // Process and add data rows
    const formattedData = data.map((row) => {
      // Extract truck number and driver name from the first column if needed
      const truckNumber = row[0].trim()
      const driverName = row[1] ? row[1].trim() : "Unknown"

      // Determine truck type based on the data in column 3 (index 2) or 4 (index 3)
      let truckType = "Dump Truck" // Default
      if (row[3] && row[3].trim()) {
        const typeText = row[3].trim().toLowerCase()
        if (typeText.includes("conveyor")) truckType = "Conveyor"
        else if (typeText.includes("mixer")) truckType = "Mixer"
        else if (typeText.includes("slinger")) truckType = "Slinger"
        else if (typeText.includes("trailer") || typeText.includes("flow")) truckType = "Trailer"
      }

      // Determine if it's a contractor based on naming convention or other indicators
      const isContractor = truckNumber.includes("C-") || driverName.includes("(Contractor)")

      return {
        "Truck Number": truckNumber,
        "Driver Name": driverName,
        "Truck Type": truckType,
        "Max Tonnage": determineMaxTonnage(truckType), // Helper function to set tonnage based on type
        "Is Contractor": isContractor ? "Yes" : "No",
        Status: "Active", // Default all to active
      }
    })

    await sheet.addRows(formattedData)
    return { success: true, rowsImported: formattedData.length }
  } catch (error) {
    console.error("Error importing from CSV:", error)
    return { success: false, error: "Failed to import data" }
  }
}

