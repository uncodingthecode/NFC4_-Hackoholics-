"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useHealthcare } from "@/context/healthcare-context"
import { Plus, Calendar, Clock, Search, User } from "lucide-react"
import { AddAppointmentModal } from "@/components/modals/add-appointment-modal"
import { AppointmentsCalendar } from "@/components/AppointmentsCalendar"

export default function AppointmentsPage() {
  const { appointments } = useHealthcare()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const upcomingAppointments = filteredAppointments.filter((apt) => apt.date > new Date())
  const pastAppointments = filteredAppointments.filter((apt) => apt.date <= new Date())

  const getAppointmentStatus = (date: Date) => {
    const now = new Date()
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) return { status: "completed", color: "secondary" }
    if (diffHours < 24) return { status: "today", color: "destructive" }
    if (diffHours < 72) return { status: "soon", color: "default" }
    return { status: "scheduled", color: "secondary" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage your medical appointments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-teal-600 hover:bg-teal-700" : "bg-transparent"}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-teal-600 hover:bg-teal-700" : "bg-transparent"}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Calendar View
            </CardTitle>
            <CardDescription>Visual calendar of your upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsCalendar appointments={filteredAppointments} />
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Your scheduled medical appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => {
                    const status = getAppointmentStatus(appointment.date)
                    return (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{appointment.doctor_name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {appointment.date.toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {appointment.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            {appointment.notes && <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={status.color as any}>{status.status.toUpperCase()}</Badge>
                          {appointment.reminder && (
                            <Badge variant="outline" className="text-green-600">
                              Reminder ON
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Past Appointments
                </CardTitle>
                <CardDescription>Your completed medical appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastAppointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700">{appointment.doctor_name}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {appointment.date.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Clock className="h-3 w-3" />
                              {appointment.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">COMPLETED</Badge>
                    </div>
                  ))}
                  {pastAppointments.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{pastAppointments.length - 5} more past appointments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Appointments */}
      {filteredAppointments.length === 0 && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Schedule your first medical appointment"}
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>
      )}

      <AddAppointmentModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
