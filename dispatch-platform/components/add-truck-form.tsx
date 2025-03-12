"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTrucks } from "@/hooks/use-trucks"
import { toast } from "@/hooks/use-toast"

export function AddTruckForm() {
  const { addNewTruck } = useTrucks()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    truckNumber: "",
    driverName: "",
    truckType: "Dump Truck",
    maxTonnage: 20,
    isContractor: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addNewTruck(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Truck added successfully",
        })
        setOpen(false)
        setFormData({
          truckNumber: "",
          driverName: "",
          truckType: "Dump Truck",
          maxTonnage: 20,
          isContractor: false,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add truck",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add New Truck</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Truck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="truckNumber">Truck Number</Label>
            <Input
              id="truckNumber"
              value={formData.truckNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, truckNumber: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="driverName">Driver Name</Label>
            <Input
              id="driverName"
              value={formData.driverName}
              onChange={(e) => setFormData((prev) => ({ ...prev, driverName: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="truckType">Truck Type</Label>
            <Select
              value={formData.truckType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, truckType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select truck type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conveyor">Conveyor</SelectItem>
                <SelectItem value="Mixer">Mixer</SelectItem>
                <SelectItem value="Dump Truck">Dump Truck</SelectItem>
                <SelectItem value="Slinger">Slinger</SelectItem>
                <SelectItem value="Trailer">Trailer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxTonnage">Max Tonnage Capacity</Label>
            <Input
              id="maxTonnage"
              type="number"
              value={formData.maxTonnage}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxTonnage: Number.parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isContractor"
              checked={formData.isContractor}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isContractor: checked }))}
            />
            <Label htmlFor="isContractor">Is Contractor</Label>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-4">
            {isSubmitting ? "Adding..." : "Add Truck"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

