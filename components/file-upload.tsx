"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { processClickUpCsv } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<{
    status: "idle" | "uploading" | "success" | "error"
    message?: string
    details?: string
  }>({ status: "idle" })
  const [activeTab, setActiveTab] = useState<"file" | "url">("file")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setUploadStatus({ status: "idle" })
    } else {
      setFile(null)
      setUploadStatus({
        status: "error",
        message: "Invalid file type",
        details: "Please upload a CSV file",
      })
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value)
  }

  const handleUpload = async () => {
    if (!file && !fileUrl) {
      toast({
        title: "No file or URL provided",
        description: "Please upload a CSV file or provide a URL",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus({ status: "uploading" })

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      const formData = new FormData()

      if (file) {
        formData.append("file", file)
        console.log("Uploading file:", file.name, "size:", file.size, "bytes")
      } else if (fileUrl) {
        formData.append("fileUrl", fileUrl)
        console.log("Using URL:", fileUrl)
      }

      const result = await processClickUpCsv(formData)

      clearInterval(interval)
      setUploadProgress(100)
      setUploadStatus({
        status: "success",
        message: "Upload successful",
        details: `Processed ${result.totalEntries} entries for ${result.date}`,
      })

      // Store the processed data in localStorage
      localStorage.setItem("reportData", JSON.stringify(result.data))

      toast({
        title: "Upload successful",
        description: `Processed ${result.totalEntries} entries for ${result.date}`,
        variant: "default",
      })

      // Reset form fields
      setIsUploading(false)
      setUploadProgress(0)
      setFile(null)
      setFileUrl("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Reload the page to show the new data
      window.location.reload()
    } catch (error) {
      clearInterval(interval)
      setIsUploading(false)
      setUploadProgress(0)

      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Upload error details:", error)

      setUploadStatus({
        status: "error",
        message: "Upload failed",
        details: errorMessage,
      })

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {uploadStatus.status === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{uploadStatus.message}</AlertTitle>
          <AlertDescription>{uploadStatus.details}</AlertDescription>
        </Alert>
      )}

      {uploadStatus.status === "success" && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertTitle>{uploadStatus.message}</AlertTitle>
          <AlertDescription>{uploadStatus.details}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "file" | "url")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Use URL</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
                {file && (
                  <div className="flex items-center mt-4 text-sm text-primary">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
              <input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="csv-url" className="text-sm font-medium">
                CSV File URL
              </label>
              <div className="flex items-center space-x-2">
                <Link className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="csv-url"
                  type="url"
                  placeholder="https://example.com/data.csv"
                  value={fileUrl}
                  onChange={handleUrlChange}
                  disabled={isUploading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter the URL of a CSV file to process</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isUploading ? (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {uploadProgress < 100 ? "Processing..." : "Complete!"}
          </p>
        </div>
      ) : (
        <Button onClick={handleUpload} disabled={(!file && !fileUrl) || isUploading} className="w-full">
          Upload and Process
        </Button>
      )}
    </div>
  )
}
