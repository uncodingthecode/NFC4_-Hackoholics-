"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Edit, Trash2 } from "lucide-react"

interface EmergencyContact {
  name: string
  relation: string
  phone: string
}

interface EmergencyContactCardProps {
  contact: EmergencyContact
  onEdit?: () => void
  onDelete?: () => void
}

export function EmergencyContactCard({ contact, onEdit, onDelete }: EmergencyContactCardProps) {
  const handleCall = () => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${contact.phone}`
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

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{contact.phone}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCall}>
            <Phone className="mr-1 h-3 w-3" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
