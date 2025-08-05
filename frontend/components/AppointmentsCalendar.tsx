"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"

interface Appointment {
  _id: string
  doctor_name: string
  date: Date
  type: string
  notes: string
}

interface AppointmentsCalendarProps {
  appointments: Appointment[]
}

export function AppointmentsCalendar({ appointments }: AppointmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(
      (apt) =>
        apt.date.getDate() === date.getDate() &&
        apt.date.getMonth() === currentDate.getMonth() &&
        apt.date.getFullYear() === currentDate.getFullYear(),
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2 h-24" />
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          const dayAppointments = getAppointmentsForDate(date)
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={day}
              className={`p-2 h-24 border rounded-lg transition-colors hover:bg-background ${
                isToday ? "bg-teal-50 border-teal-200" : "border-gray-200"
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? "text-teal-600" : "text-foreground"}`}>{day}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt._id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                    title={`${apt.doctor_name} - ${apt.type}`}
                  >
                    {apt.doctor_name}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Today's Appointments */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            Today's Appointments
          </h4>
          {appointments
            .filter((apt) => {
              const today = new Date()
              return (
                apt.date.getDate() === today.getDate() &&
                apt.date.getMonth() === today.getMonth() &&
                apt.date.getFullYear() === today.getFullYear()
              )
            })
            .map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-2 border rounded mb-2 last:mb-0">
                <div>
                  <p className="font-medium text-sm">{apt.doctor_name}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-muted-foreground">
                    {apt.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          {appointments.filter((apt) => {
            const today = new Date()
            return (
              apt.date.getDate() === today.getDate() &&
              apt.date.getMonth() === today.getMonth() &&
              apt.date.getFullYear() === today.getFullYear()
            )
          }).length === 0 && <p className="text-sm text-muted-foreground">No appointments today</p>}
        </CardContent>
      </Card>
    </div>
  )
}
