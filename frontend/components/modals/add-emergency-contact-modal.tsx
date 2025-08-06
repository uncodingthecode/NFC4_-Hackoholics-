"use client"

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
import { useToast } from "@/hooks/use-toast"
// Update the import to match the actual export from '@/lib/api'
import { familyAPI } from "@/lib/api"

// OR, if the correct named export is different, for example 'api':
// import { api as familyAPI } from "@/lib/api"

interface AddEmergencyContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmergencyContactModal({ open, onOpenChange }: AddEmergencyContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    email: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { family, updateEmergencyContacts } = useHealthcare()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await familyAPI.addEmergencyContact(formData) // ✅ call real backend
      toast({
        title: "Emergency contact added",
        description: `${formData.name} was added to your emergency contacts.`,
      })

      // Reset
      setFormData({ name: "", relation: "", email: "", phone: "" })
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      toast({
        title: "Error",
        description: "Could not add contact. Try again.",
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
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogDescription>Provide emergency contact info (email used for alerts).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relation">Relationship</Label>
              <Select value={formData.relation} onValueChange={(value) => updateFormData("relation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Family Doctor">Family Doctor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}