"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { Users, Pill, AlertTriangle, Plus, Calendar, Heart } from "lucide-react"
import { AddFamilyMemberModal } from "@/components/modals/add-family-member-modal"
import { useState } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { family, medications, alerts, appointments, vitals } = useHealthcare()
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

  const todaysMeds = medications.filter((med) => {
    const today = new Date().toDateString()
    return med.timing.some((time) => new Date().toDateString() === today)
  })

  const upcomingAppointments = appointments.filter(
    (apt) => apt.date > new Date() && apt.date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  )

  const criticalAlerts = alerts.filter((alert) => alert.severity === "high" && !alert.acknowledged)

  const recentVitals = vitals.slice(-1)[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your family's health overview.</p>
        </div>
        <Button onClick={() => setShowAddMemberModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{family?.members.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active members in {family?.name}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications Due</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMeds.length}</div>
            <p className="text-xs text-muted-foreground">Medications due today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Latest Vitals
            </CardTitle>
            <CardDescription>Most recent health measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVitals ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blood Pressure</span>
                  <Badge variant={recentVitals.bp_systolic > 140 ? "destructive" : "secondary"}>
                    {recentVitals.bp_systolic}/{recentVitals.bp_diastolic} mmHg
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blood Sugar</span>
                  <Badge variant={recentVitals.sugar > 140 ? "destructive" : "secondary"}>
                    {recentVitals.sugar} mg/dL
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weight</span>
                  <Badge variant="secondary">{recentVitals.weight} kg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <Badge variant={recentVitals.temperature > 99.5 ? "destructive" : "secondary"}>
                    {recentVitals.temperature}°F
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No vitals recorded yet</p>
            )}
            <Link href="/dashboard/vitals">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Vitals
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Today's Medications
            </CardTitle>
            <CardDescription>Medications scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysMeds.length > 0 ? (
              <div className="space-y-3">
                {todaysMeds.slice(0, 3).map((med) => (
                  <div key={med._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{med.medicine_name}</p>
                      <p className="text-sm text-gray-600">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                    <Badge variant="outline">{med.timing.join(", ")}</Badge>
                  </div>
                ))}
                {todaysMeds.length > 3 && (
                  <p className="text-sm text-gray-500">+{todaysMeds.length - 3} more medications</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No medications scheduled for today</p>
            )}
            <Link href="/dashboard/medications">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Manage Medications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
            <CardDescription className="text-red-600">These alerts require immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert._id} className="p-3 bg-white rounded-lg border border-red-200">
                  <p className="font-medium text-red-800">{alert.message}</p>
                  <p className="text-sm text-red-600">
                    {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/alerts">
              <Button
                variant="outline"
                className="w-full mt-4 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
              >
                View All Alerts
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <AddFamilyMemberModal open={showAddMemberModal} onOpenChange={setShowAddMemberModal} />
    </div>
  )
}
