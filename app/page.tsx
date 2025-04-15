import { FileUpload } from "@/components/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportPreview } from "@/components/report-preview"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Spallina Daily Report Generator</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload ClickUp CSV</CardTitle>
            <CardDescription>Upload your ClickUp CSV file to generate a daily transaction report</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <ReportPreview />
      </div>
    </div>
  )
}

