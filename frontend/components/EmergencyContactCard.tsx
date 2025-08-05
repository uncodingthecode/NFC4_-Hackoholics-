"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { emergencyAPI } from "@/lib/api"

interface EmergencyContact {
  _id: string
  name: string
  relation: string
  phone: string
  email: string
}

interface EmergencyContactCardProps {
  contact: EmergencyContact
  onEdit?: () => void
  onDelete?: () => void
}

export function EmergencyContactCard({ contact, onEdit, onDelete }: EmergencyContactCardProps) {
  const { toast } = useToast()

  const handleSendEmail = async () => {
    try {
      const response = await emergencyAPI.shareWithContact(contact._id)

      if (response.success) {
        toast({
          title: "Success",
          description: `Emergency info sent to ${contact.email}`,
        })
      } else {
        throw new Error(response.error || "Failed to send")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send emergency info",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-foreground">{contact.name}</h3>
            <Badge variant="outline" className="text-xs mt-1">
              {contact.relation}
            </Badge>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <span>{contact.email}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleSendEmail}>
            <Mail className="mr-1 h-3 w-3" />
            Send Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
