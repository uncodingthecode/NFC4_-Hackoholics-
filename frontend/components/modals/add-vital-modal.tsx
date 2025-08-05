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
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"

interface AddVitalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddVitalModal({ open, onOpenChange }: AddVitalModalProps) {
  const [formData, setFormData] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    sugar: "",
    weight: "",
    temperature: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addVital } = useHealthcare()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await addVital({
        bp_systolic: Number.parseInt(formData.bp_systolic),
        bp_diastolic: Number.parseInt(formData.bp_diastolic),
        sugar: Number.parseInt(formData.sugar),
        weight: Number.parseFloat(formData.weight),
        temperature: Number.parseFloat(formData.temperature),
        timestamp: new Date(),
      })

      toast({
        title: "Vitals recorded",
        description: "Your vital signs have been successfully recorded.",
      })

      // Reset form
      setFormData({
        bp_systolic: "",
        bp_diastolic: "",
        sugar: "",
        weight: "",
        temperature: "",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vitals. Please try again.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Vitals</DialogTitle>
          <DialogDescription>Enter your current vital sign measurements.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bp_systolic">Systolic BP</Label>
                <Input
                  id="bp_systolic"
                  type="number"
                  value={formData.bp_systolic}
                  onChange={(e) => updateFormData("bp_systolic", e.target.value)}
                  placeholder="120"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bp_diastolic">Diastolic BP</Label>
                <Input
                  id="bp_diastolic"
                  type="number"
                  value={formData.bp_diastolic}
                  onChange={(e) => updateFormData("bp_diastolic", e.target.value)}
                  placeholder="80"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sugar">Blood Sugar (mg/dL)</Label>
              <Input
                id="sugar"
                type="number"
                value={formData.sugar}
                onChange={(e) => updateFormData("sugar", e.target.value)}
                placeholder="95"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => updateFormData("weight", e.target.value)}
                placeholder="70.5"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => updateFormData("temperature", e.target.value)}
                placeholder="98.6"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? "Recording..." : "Record Vitals"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
