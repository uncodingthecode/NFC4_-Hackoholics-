"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { User, Calendar, Ruler, Weight, Droplets } from "lucide-react"

interface ProfileCardProps {
  userId: string
}

export function ProfileCard({ userId }: ProfileCardProps) {
  const { profiles } = useHealthcare()
  const profile = profiles.find((p) => p.user_id === userId)

  if (!profile) {
    return null
  }

  const age = new Date().getFullYear() - profile.DOB.getFullYear()
  const bmi = profile.weight / (profile.height / 100) ** 2

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-teal-100 rounded-full">
            <User className="h-8 w-8 text-teal-600" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Health Profile</h2>
              <p className="text-muted-foreground">Personal health information overview</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{profile.height} cm</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{profile.weight} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{profile.blood_group || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-card">
                BMI: {bmi.toFixed(1)}
              </Badge>
              <Badge variant="outline" className="bg-card">
                {profile.gender}
              </Badge>
              {profile.allergies.length > 0 && (
                <Badge variant="destructive">{profile.allergies.length} Allergies</Badge>
              )}
              {profile.existing_conditions.length > 0 && (
                <Badge variant="secondary">{profile.existing_conditions.length} Conditions</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
