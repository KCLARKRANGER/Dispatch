"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ReportData, TruckEntry } from "@/lib/types"

interface EditableReportProps {
  reportData: ReportData
  onSave: (updatedData: ReportData) => void
}

export function EditableReport({ reportData, onSave }: EditableReportProps) {
  const [editedData, setEditedData] = useState<ReportData>(reportData)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Update local state when reportData changes
  useEffect(() => {
    setEditedData(reportData)
  }, [reportData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save directly to localStorage
      localStorage.setItem("reportData", JSON.stringify(editedData))

      // Call the onSave callback
      onSave(editedData)

      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCheckboxChange = (
    sectionKey: "slingers" | "dumpTrucks" | "tractors" | "asphaltTrucks" | "mixers",
    index: number,
    checked: boolean,
  ) => {
    setEditedData((prev) => {
      const newData = { ...prev }
      if (newData[sectionKey] && newData[sectionKey][index]) {
        newData[sectionKey][index].pay = checked
      }
      return newData
    })
  }

  const handleInputChange = (
    sectionKey: "slingers" | "dumpTrucks" | "tractors" | "asphaltTrucks" | "mixers",
    index: number,
    field: keyof TruckEntry,
    value: string,
  ) => {
    setEditedData((prev) => {
      const newData = { ...prev }
      if (newData[sectionKey] && newData[sectionKey][index]) {
        newData[sectionKey][index][field] = value
      }
      return newData
    })
  }

  // Get header color based on truck type
  const getHeaderColor = (sectionKey: string) => {
    switch (sectionKey) {
      case "slingers":
        return "bg-blue-200 text-blue-900"
      case "dumpTrucks":
        return "bg-green-200 text-green-900"
      case "tractors":
        return "bg-amber-200 text-amber-900"
      case "asphaltTrucks":
        return "bg-orange-200 text-orange-900"
      case "mixers":
        return "bg-purple-200 text-purple-900"
      default:
        return "bg-gray-200 text-gray-900"
    }
  }

  const renderEditableTable = (
    title: string,
    entries: TruckEntry[],
    sectionKey: "slingers" | "dumpTrucks" | "tractors" | "asphaltTrucks" | "mixers",
  ) => {
    if (!entries || entries.length === 0) return null

    const headerClass = getHeaderColor(sectionKey)

    return (
      <div className="mb-8">
        <h3 className={`text-lg font-bold p-2 rounded-t-md ${headerClass}`}>{title}</h3>
        <div className="overflow-x-auto border rounded-b-md">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[150px]">Payment received?</TableHead>
                <TableHead>JOB NAME (with Account)</TableHead>
                <TableHead>LOAD TIME</TableHead>
                <TableHead>TRUCK #</TableHead>
                <TableHead>PIT</TableHead>
                <TableHead>LOCATION</TableHead>
                <TableHead>MATERIALS</TableHead>
                <TableHead>NOTES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index} className="border-b">
                  <TableCell className="align-top">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${sectionKey}-${index}-pay`}
                          checked={entry.pay || false}
                          onCheckedChange={(checked) => handleCheckboxChange(sectionKey, index, checked as boolean)}
                        />
                        <label
                          htmlFor={`${sectionKey}-${index}-pay`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Payment received
                        </label>
                      </div>

                      {/* Only show Card checkbox if payment type is Credit Card */}
                      {entry.accountType === "Credit Card" && (
                        <div className="flex items-center space-x-2 ml-5">
                          <Checkbox id={`${sectionKey}-${index}-card`} checked={true} disabled={true} />
                          <label
                            htmlFor={`${sectionKey}-${index}-card`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Card
                          </label>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Input
                      value={entry.jobName}
                      onChange={(e) => handleInputChange(sectionKey, index, "jobName", e.target.value)}
                      className="h-8 w-full min-w-[150px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Input
                      value={entry.loadTime || "N/A"}
                      onChange={(e) => handleInputChange(sectionKey, index, "loadTime", e.target.value)}
                      className="h-8 w-full min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Input
                      value={entry.truckNumber}
                      onChange={(e) => handleInputChange(sectionKey, index, "truckNumber", e.target.value)}
                      className="h-8 w-full min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Input
                      value={entry.pit}
                      onChange={(e) => handleInputChange(sectionKey, index, "pit", e.target.value)}
                      className="h-8 w-full min-w-[80px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Textarea
                      value={entry.location}
                      onChange={(e) => handleInputChange(sectionKey, index, "location", e.target.value)}
                      className="min-h-[60px] w-full min-w-[200px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Input
                      value={entry.materials}
                      onChange={(e) => handleInputChange(sectionKey, index, "materials", e.target.value)}
                      className="h-8 w-full min-w-[150px]"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <Textarea
                      value={entry.notes || ""}
                      onChange={(e) => handleInputChange(sectionKey, index, "notes", e.target.value)}
                      className="h-16 w-full min-w-[150px] resize-y"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <div>
          <CardTitle>Edit Trucking Report</CardTitle>
          <CardDescription>
            {editedData.date} - {editedData.totalEntries} entries
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-6">
          {renderEditableTable("DUMP TRUCK REPORT", editedData.dumpTrucks, "dumpTrucks")}
          {renderEditableTable("SLINGER REPORT", editedData.slingers, "slingers")}
          {renderEditableTable("TRAILER REPORT", editedData.tractors, "tractors")}
          {renderEditableTable("ASPHALT REPORT", editedData.asphaltTrucks, "asphaltTrucks")}
          {editedData.mixers && renderEditableTable("MIXER REPORT", editedData.mixers, "mixers")}
        </div>
      </CardContent>
    </Card>
  )
}
