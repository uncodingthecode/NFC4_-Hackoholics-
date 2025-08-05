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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"

interface AddAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAppointmentModal({ open, onOpenChange }: AddAppointmentModalProps) {
  const [formData, setFormData] = useState({
    doctor_name: "",
    date: "",
    time: "",
    type: "",
    notes: "",
    reminder: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addAppointment } = useHealthcare()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const appointmentDate = new Date(`${formData.date} ${formData.time}`)

      await addAppointment({
        doctor_name: formData.doctor_name,
        date: appointmentDate,
        type: formData.type,
        notes: formData.notes,
        reminder: formData.reminder,
      })

      toast({
        title: "Appointment scheduled",
        description: `Appointment with ${formData.doctor_name} has been scheduled.`,
      })

      // Reset form
      setFormData({
        doctor_name: "",
        date: "",
        time: "",
        type: "",
        notes: "",
        reminder: true,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>Schedule a new medical appointment with your healthcare provider.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doctor_name">Doctor Name</Label>
              <Input
                id="doctor_name"
                value={formData.doctor_name}
                onChange={(e) => updateFormData("doctor_name", e.target.value)}
                placeholder="Dr. Smith"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateFormData("time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular Checkup">Regular Checkup</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Lab Work">Lab Work</SelectItem>
                  <SelectItem value="Specialist Visit">Specialist Visit</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Any additional notes about the appointment..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="reminder"
                checked={formData.reminder}
                onCheckedChange={(checked) => updateFormData("reminder", checked)}
              />
              <Label htmlFor="reminder" className="text-sm font-medium">
                Enable appointment reminder
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
