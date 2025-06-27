import { type NextRequest, NextResponse } from "next/server"
import { generatePdf } from "@/lib/actions"
import type { ReportData } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const reportData = (await request.json()) as ReportData

    const { blob } = await generatePdf(reportData)

    // Convert blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer()

    // Return the PDF as a response
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report-preview.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF preview:", error)
    return NextResponse.json({ error: "Failed to generate PDF preview" }, { status: 500 })
  }
}
