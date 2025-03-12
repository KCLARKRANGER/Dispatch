"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { getAllTrucks } from "@/lib/google-sheets"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("Checking connection to Google Sheets...")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkConnection = async () => {
    try {
      setStatus("checking")
      setMessage("Checking connection to Google Sheets...")
      setIsRefreshing(true)

      const trucks = await getAllTrucks()

      if (trucks && Array.isArray(trucks)) {
        setStatus("connected")
        setMessage(`Connected to Google Sheets. Found ${trucks.length} trucks.`)
      } else {
        setStatus("error")
        setMessage("Connected to Google Sheets but no data was returned.")
      }
    } catch (error) {
      console.error("Connection error:", error)
      setStatus("error")
      setMessage("Failed to connect to Google Sheets. Check your credentials.")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-white shadow-sm border">
      {status === "checking" || isRefreshing ? (
        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      ) : status === "connected" ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}

      <span className={`text-sm ${status === "error" ? "text-red-500" : ""}`}>{message}</span>

      {status === "error" && (
        <Button variant="outline" size="sm" onClick={checkConnection} disabled={isRefreshing} className="ml-2">
          Retry
        </Button>
      )}
    </div>
  )
}

