"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Tag, CheckCircle, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportReportToGithub } from "@/lib/actions"

type Task = {
  id: string
  name: string
  status: string
  assignee: string
  dueDate: string
  completedAt: string
  tags: string[]
}

export function ReportDisplay() {
  const [reportData, setReportData] = useState<Task[] | null>(null)
  const [activeTab, setActiveTab] = useState("table")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // In a real app, this would come from the server after processing the CSV
  useEffect(() => {
    // Simulated data - in a real app this would come from the server
    const mockData: Task[] = [
      {
        id: "1",
        name: "Repair pothole on Main Street",
        status: "Complete",
        assignee: "John Smith",
        dueDate: "2023-03-18",
        completedAt: "2023-03-18T14:30:00",
        tags: ["Repair", "Priority"],
      },
      {
        id: "2",
        name: "Asphalt resurfacing at 123 Oak Avenue",
        status: "Complete",
        assignee: "Mike Johnson",
        dueDate: "2023-03-18",
        completedAt: "2023-03-18T16:45:00",
        tags: ["Resurfacing", "Residential"],
      },
      {
        id: "3",
        name: "Crack sealing at Westfield Mall parking lot",
        status: "Complete",
        assignee: "Sarah Williams",
        dueDate: "2023-03-18",
        completedAt: "2023-03-18T11:20:00",
        tags: ["Maintenance", "Commercial"],
      },
      {
        id: "4",
        name: "Quote for driveway paving at 456 Pine Street",
        status: "Complete",
        assignee: "John Smith",
        dueDate: "2023-03-18",
        completedAt: "2023-03-18T09:15:00",
        tags: ["Quote", "Residential"],
      },
      {
        id: "5",
        name: "Line striping at Downtown Office Complex",
        status: "Complete",
        assignee: "Mike Johnson",
        dueDate: "2023-03-18",
        completedAt: "2023-03-18T13:00:00",
        tags: ["Striping", "Commercial"],
      },
    ]

    setReportData(mockData)
  }, [])

  const handleExportToGithub = async () => {
    if (!reportData) return

    setIsExporting(true)

    try {
      await exportReportToGithub(reportData)

      toast({
        title: "Report exported",
        description: "Successfully exported report to GitHub",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export report to GitHub",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Completed Tasks Report</CardTitle>
          <CardDescription>Upload a ClickUp CSV file to generate a report</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <p>No report data available. Please upload a CSV file.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daily Completed Tasks Report</CardTitle>
          <CardDescription>
            {reportData.length} tasks completed on {new Date().toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportToGithub} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export to GitHub"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="summary">Summary View</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        {new Date(task.completedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    <span className="text-2xl font-bold">{reportData.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">By Assignee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      reportData.reduce(
                        (acc, task) => {
                          acc[task.assignee] = (acc[task.assignee] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([assignee, count]) => (
                      <div key={assignee} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{assignee}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">By Tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      reportData
                        .flatMap((task) => task.tags)
                        .reduce(
                          (acc, tag) => {
                            acc[tag] = (acc[tag] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    ).map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{tag}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
