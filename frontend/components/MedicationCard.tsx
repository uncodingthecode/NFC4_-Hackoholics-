"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, Calendar } from "lucide-react"

interface Medication {
  _id: string
  medicine_name: string
  dosage: string
  frequency: string
  timing: string[]
  stock_count: number
  refill_alert_threshold: number
  start_date: Date
  end_date: Date
}

interface MedicationCardProps {
  medication: Medication
  onSetReminder?: () => void
  onViewSchedule?: () => void
}

export function MedicationCard({ medication, onSetReminder, onViewSchedule }: MedicationCardProps) {
  const isLowStock = medication.stock_count <= medication.refill_alert_threshold
  const isExpiringSoon = medication.end_date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <Card className={`hover:shadow-md transition-shadow ${isLowStock ? "border-orange-300" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{medication.medicine_name}</span>
          {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Frequency</span>
            <Badge variant="outline">{medication.frequency}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Timing</span>
            <div className="flex gap-1">
              {medication.timing.map((time, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Stock</span>
            <Badge variant={isLowStock ? "destructive" : "secondary"}>{medication.stock_count} pills</Badge>
          </div>
          {isExpiringSoon && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires</span>
              <Badge variant="destructive">{medication.end_date.toLocaleDateString()}</Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onSetReminder}>
            <Clock className="mr-1 h-3 w-3" />
            Reminder
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onViewSchedule}>
            <Calendar className="mr-1 h-3 w-3" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
