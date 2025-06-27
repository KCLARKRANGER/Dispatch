import { NextResponse } from "next/server"
import { getReportData } from "@/lib/actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Declare the GLOBAL_REPORT_DATA_TIMESTAMP variable
declare global {
  var GLOBAL_REPORT_DATA_TIMESTAMP: number | undefined
}

export async function GET() {
  try {
    console.log("API Route: Fetching report data at", new Date().toISOString())
    console.log("API route: Getting report data")
    // Get the report data from the global variable
    const reportData = await getReportData()

    if (reportData) {
      console.log(
        "API Route: Found report data with timestamp",
        new Date(global.GLOBAL_REPORT_DATA_TIMESTAMP || 0).toISOString(),
      )
      console.log(
        "API Route: Returning actual report data with:",
        reportData.dumpTrucks?.length || 0,
        "dump trucks,",
        reportData.slingers?.length || 0,
        "slingers,",
        reportData.tractors?.length || 0,
        "tractors",
      )
    } else {
      console.log("API Route: No report data found, returning mock data")
    }

    if (!reportData) {
      console.log("API route: No report data found, returning mock data")
      return NextResponse.json(getMockReportData(), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    console.log(
      "API route: Returning report data with",
      reportData.slingers?.length || 0,
      "slingers,",
      reportData.dumpTrucks?.length || 0,
      "dump trucks,",
      reportData.tractors?.length || 0,
      "tractors,",
      reportData.mixers?.length || 0,
      "mixers",
      "date:",
      reportData.date,
    )

    return NextResponse.json(reportData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in report-data API route:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch report data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}

function getMockReportData() {
  // This is mock data to show the UI before a CSV is uploaded
  return {
    date: new Date().toLocaleDateString(),
    createdBy: "WB DISPATCH",
    createdAt: new Date().toLocaleString(),
    totalEntries: 15,
    slingers: [
      {
        jobName: "JEAN CARDAMO",
        accountType: "CAS20",
        truckType: "Slinger",
        truckNumber: "SMI94S",
        date: "3/18/2025",
        quantity: "2: LD",
        materials: "Beach Sand per TN",
        location: "1435 S Lake Rd, Middlesex, NY 14507, USA",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
      {
        jobName: "GERBER HOMES",
        accountType: "ACCOUNT",
        truckType: "Slinger",
        truckNumber: "SMI94S",
        date: "3/18/2025",
        quantity: "1: LD",
        materials: "DELIVERY NOT MADE",
        location: "503 Co Rd 8, Farmington, NY 14425, USA",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
    ],
    dumpTrucks: [
      {
        jobName: "TRUAX & HOVEY",
        accountType: "ACCOUNT",
        truckType: "Dump Truck",
        truckNumber: "SMI38",
        date: "3/18/2025",
        quantity: "28: YD",
        materials: "Mason per CY",
        location: "160 School St, Victor, NY 14564, USA",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
      {
        jobName: "2018 RMC LLC",
        accountType: "ACCOUNT",
        truckType: "Dump Truck",
        truckNumber: "",
        date: "3/18/2025",
        quantity: "10: YD",
        materials: "Crushed 1's per Ton",
        location: "22 Victoria Dr, Rochester, NY 14618, USA",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
    ],
    tractors: [
      {
        jobName: "SALT",
        accountType: "CAS20",
        truckType: "Trailer",
        truckNumber: "SMI112",
        date: "3/18/2025",
        quantity: "2: LD",
        materials: "Bulk Salt",
        location: "",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
      {
        jobName: "SWYERS FARMS",
        accountType: "ACCOUNT",
        truckType: "Trailer",
        truckNumber: "SMI50P",
        date: "3/18/2025",
        quantity: "1: LD",
        materials: "50% C144 / 50% Concrete Mix CY",
        location: "7316 Begole Rd, Mt Morris, NY 14510, USA",
        accountNumber: "",
        pit: "",
        delivered: "",
        pay: false,
      },
    ],
  }
}
