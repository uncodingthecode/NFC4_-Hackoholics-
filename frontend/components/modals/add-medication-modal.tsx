"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"

interface AddMedicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMedicationModal({ open, onOpenChange }: AddMedicationModalProps) {
  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    timing: "",
    stock_count: "",
    refill_alert_threshold: "10",
    start_date: "",
    end_date: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addMedication } = useHealthcare()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addMedication({
        medicine_name: formData.medicine_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        timing: formData.timing.split(",").map((t) => t.trim()),
        stock_count: Number.parseInt(formData.stock_count),
        refill_alert_threshold: Number.parseInt(formData.refill_alert_threshold),
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
      })

      toast({
        title: "Medication added",
        description: `${formData.medicine_name} has been added to your medications.`,
      })

      // Reset form
      setFormData({
        medicine_name: "",
        dosage: "",
        frequency: "",
        timing: "",
        stock_count: "",
        refill_alert_threshold: "10",
        start_date: "",
        end_date: "",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>Add a new medication to your healthcare routine.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicine_name">Medicine Name</Label>
              <Input
                id="medicine_name"
                value={formData.medicine_name}
                onChange={(e) => updateFormData("medicine_name", e.target.value)}
                placeholder="e.g., Lisinopril"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => updateFormData("dosage", e.target.value)}
                  placeholder="e.g., 10mg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => updateFormData("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="Four times daily">Four times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timing">Timing (comma-separated)</Label>
              <Input
                id="timing"
                value={formData.timing}
                onChange={(e) => updateFormData("timing", e.target.value)}
                placeholder="e.g., 08:00, 20:00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock_count">Stock Count</Label>
                <Input
                  id="stock_count"
                  type="number"
                  value={formData.stock_count}
                  onChange={(e) => updateFormData("stock_count", e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refill_alert_threshold">Refill Alert</Label>
                <Input
                  id="refill_alert_threshold"
                  type="number"
                  value={formData.refill_alert_threshold}
                  onChange={(e) => updateFormData("refill_alert_threshold", e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? "Adding..." : "Add Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
