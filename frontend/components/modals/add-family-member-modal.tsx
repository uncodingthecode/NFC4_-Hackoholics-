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

interface AddFamilyMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFamilyMemberModal({ open, onOpenChange }: AddFamilyMemberModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [relation, setRelation] = useState("other")
  const [isLoading, setIsLoading] = useState(false)
  const { addFamilyMember } = useHealthcare()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Send all required fields to create new family member
      await addFamilyMember({
        name,
        email,
        password,
        relation,
      })

      toast({
        title: "Family member created",
        description: `${name} has been successfully added to your family. They can now sign in using their email and password.`,
      })

      // Reset form
      setName("")
      setEmail("")
      setPassword("")
      setRelation("other")
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error adding family member:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create family member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Create a new family member account. They can sign in later using their email and password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relation">Relation *</Label>
              <Select value={relation} onValueChange={(value) => setRelation(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="son">Son</SelectItem>
                  <SelectItem value="daughter">Daughter</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
