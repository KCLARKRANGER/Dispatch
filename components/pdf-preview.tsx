"use client"

import { useState, useEffect, useCallback } from "react"
import type { ReportData } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { generatePdf } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PDFPreviewProps {
  reportData: ReportData
}

export function PDFPreview({ reportData }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const generatePreview = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Generating PDF preview...")
      const result = await generatePdf(reportData)
      const url = URL.createObjectURL(result.blob)
      setPdfUrl(url)
      console.log("PDF preview generated successfully")
    } catch (error) {
      console.error("Error generating PDF preview:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating PDF"
      setError(errorMessage)
      toast({
        title: "Preview Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [reportData, toast])

  // Generate a preview of the PDF
  useEffect(() => {
    generatePreview()

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [generatePreview])

  const handleRefresh = () => {
    generatePreview()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-md">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-muted-foreground">Generating PDF preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-md">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-md">
        <p className="text-muted-foreground mb-4">Failed to generate preview. Please try again.</p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Preview
        </Button>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border rounded-md">
      <div className="flex justify-end p-2 bg-muted">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Preview
        </Button>
      </div>
      <div className="w-full h-[600px]">
        <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
      </div>
    </Card>
  )
}
