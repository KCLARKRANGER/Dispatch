"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { importInitialTruckData } from "@/app/actions"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function SetupButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const result = await importInitialTruckData()

      if (result.success) {
        setSetupComplete(true)
        setImportedCount(result.rowsImported || 0)
        toast.success(`Successfully imported ${result.rowsImported} trucks from CSV data`)
      } else {
        toast.error(result.error || "Failed to import data")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {setupComplete && (
        <div className="bg-green-100 text-green-800 p-2 rounded-md mb-2 text-sm">
          ✅ Imported {importedCount} trucks successfully
        </div>
      )}
      <Button onClick={handleSetup} disabled={isLoading} variant={setupComplete ? "outline" : "default"}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing Data...
          </>
        ) : setupComplete ? (
          "Re-Import Data"
        ) : (
          "Import Initial Data"
        )}
      </Button>
    </div>
  )
}

