"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Eye, RefreshCw, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generatePdf } from "@/lib/actions"
import type { ReportData } from "@/lib/types"
import { PDFPreview } from "./pdf-preview"
import { EditableReport } from "./editable-report"

export function ReportPreview() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [activeTab, setActiveTab] = useState("edit")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    setIsLoading(true)
    try {
      // Try to get data from localStorage
      const storedData = localStorage.getItem("reportData")
      if (storedData) {
        const parsedData = JSON.parse(storedData) as ReportData
        console.log(
          "Loaded data from localStorage:",
          parsedData.dumpTrucks?.length || 0,
          "dump trucks,",
          parsedData.slingers?.length || 0,
          "slingers,",
          parsedData.tractors?.length || 0,
          "tractors,",
          parsedData.asphaltTrucks?.length || 0,
          "asphalt trucks,",
          parsedData.mixers?.length || 0,
          "mixers",
        )
        setReportData(parsedData)
      } else {
        console.log("No data found in localStorage")
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      setFetchError("Failed to load report data from browser storage")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleGeneratePdf = async () => {
    if (!reportData) return

    setIsGenerating(true)

    try {
      console.log("Generating PDF from report data...")
      const result = await generatePdf(reportData)

      // Open the PDF in a new tab
      const pdfUrl = URL.createObjectURL(result.blob)
      window.open(pdfUrl, "_blank")

      toast({
        title: "PDF Generated",
        description: "Your report has been generated successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefresh = () => {
    // Force a complete refresh
    window.location.reload()
  }

  const handleSaveEdits = (updatedData: ReportData) => {
    // Save the updated data to localStorage
    localStorage.setItem("reportData", JSON.stringify(updatedData))
    setReportData(updatedData)

    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully",
      variant: "default",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trucking Report</CardTitle>
          <CardDescription>Loading report data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trucking Report</CardTitle>
          <CardDescription>Error loading report data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="mb-4 text-red-500">Error: {fetchError}</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (
    !reportData ||
    (!reportData.slingers?.length &&
      !reportData.dumpTrucks?.length &&
      !reportData.tractors?.length &&
      !reportData.asphaltTrucks?.length &&
      !reportData.mixers?.length)
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trucking Report</CardTitle>
          <CardDescription>No report data available. Please upload a CSV file.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="mb-4">No report data available. Please upload a CSV file.</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daily Trucking Report</CardTitle>
          <CardDescription>
            {reportData.date} - {reportData.totalEntries} entries
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleGeneratePdf} disabled={isGenerating}>
            <FileText className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="edit">
              <Edit className="w-4 h-4 mr-2" />
              Edit Report
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              PDF Preview
            </TabsTrigger>
            <TabsTrigger value="data">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="w-full">
            <EditableReport reportData={reportData} onSave={handleSaveEdits} />
          </TabsContent>

          <TabsContent value="preview" className="w-full">
            <PDFPreview reportData={reportData} />
          </TabsContent>

          <TabsContent value="data">
            <div className="overflow-auto max-h-[600px] border rounded-md p-4">
              <h3 className="text-lg font-bold mb-2">Report Summary</h3>
              <ul className="mb-4">
                <li>Date: {reportData.date}</li>
                <li>Created By: {reportData.createdBy}</li>
                <li>Total Entries: {reportData.totalEntries}</li>
                <li>Slingers: {reportData.slingers?.length || 0}</li>
                <li>Dump Trucks: {reportData.dumpTrucks?.length || 0}</li>
                <li>Tractors: {reportData.tractors?.length || 0}</li>
                <li>Asphalt Trucks: {reportData.asphaltTrucks?.length || 0}</li>
                <li>Mixers: {reportData.mixers?.length || 0}</li>
              </ul>

              <h3 className="text-lg font-bold mb-2">Raw Data</h3>
              <pre className="text-xs">{JSON.stringify(reportData, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

