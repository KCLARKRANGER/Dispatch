"use server"

import { importInitialDataFromCSV } from "@/lib/google-sheets"

export async function importInitialTruckData() {
  try {
    return await importInitialDataFromCSV()
  } catch (error) {
    console.error("Error in importInitialTruckData:", error)
    return { success: false, error: "Failed to import data" }
  }
}

