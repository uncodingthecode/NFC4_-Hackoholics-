"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { Users, Pill, AlertTriangle, Plus, Calendar, Heart } from "lucide-react"
import { AddFamilyMemberModal } from "@/components/modals/add-family-member-modal"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ViewFamilyMembersModal } from "@/components/modals/view-family-members-modal"

export default function DashboardPage() {
  const { family, medications, alerts, agentAlerts, notifications, appointments, vitals, loading, getAgentAlerts, getCriticalAlerts } = useHealthcare()
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showViewMembersModal, setShowViewMembersModal] = useState(false)

  // Calculate medications due today based on timing and frequency
  const getMedicationsDue = () => {
    const today = new Date()
    const currentHour = today.getHours()
    const currentTime = today.getTime()
    
    return (medications || []).filter((med) => {
      if (!med) return false;
      
      // Check if medication is active (within start and end date)
      const startDate = new Date(med.start_date)
      const endDate = new Date(med.end_date)
      
      // Skip invalid dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false
      }
      
      if (currentTime < startDate.getTime() || currentTime > endDate.getTime()) {
        return false
      }

      // Check timing based on frequency
      if (!med.timing || !Array.isArray(med.timing) || med.timing.length === 0) {
        return false
      }

      // Get start of today
      const todayStart = new Date(today)
      todayStart.setHours(0, 0, 0, 0)
      
      // Get end of today
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      switch (med.frequency?.toLowerCase()) {
        case 'daily':
          return med.timing.some(time => {
            const [hours = 0, minutes = 0] = (time || '').split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) return false
            
            const medTime = new Date(today)
            medTime.setHours(hours, minutes, 0, 0)
            // Check if medication time is today
            return medTime >= todayStart && medTime <= todayEnd
          })
        
        case 'twice daily':
          return med.timing.some(time => {
            const [hours = 0, minutes = 0] = (time || '').split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) return false
            
            const medTime = new Date(today)
            medTime.setHours(hours, minutes, 0, 0)
            // Check if medication time is today
            return medTime >= todayStart && medTime <= todayEnd
          })
        
        case 'weekly':
          // If it's the day of the week for this medication
          const dayOfWeek = today.getDay()
          return med.timing.some(time => {
            const [hours = 0, minutes = 0] = (time || '').split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) return false
            
            const medTime = new Date(today)
            medTime.setHours(hours, minutes, 0, 0)
            // Check if medication time is today
            return medTime >= todayStart && medTime <= todayEnd
          })
        
        default:
          // Default to daily if frequency is not recognized
          return med.timing.some(time => {
            const [hours = 0, minutes = 0] = (time || '').split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) return false
            
            const medTime = new Date(today)
            medTime.setHours(hours, minutes, 0, 0)
            // Check if medication time is today
            return medTime >= todayStart && medTime <= todayEnd
          })
      }
    })
  }

  const medicationsDue = getMedicationsDue()

  // Hardcoded upcoming appointments
  const hardcodedAppointments = [
    {
      _id: '1',
      user_id: 'user1',
      doctor_name: 'Dr. Sarah Johnson',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      type: 'General Checkup',
      notes: 'Annual physical examination',
      reminder: true
    },
    {
      _id: '2',
      user_id: 'user1',
      doctor_name: 'Dr. Michael Chen',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      type: 'Cardiology Consultation',
      notes: 'Follow-up for blood pressure monitoring',
      reminder: true
    },
    {
      _id: '3',
      user_id: 'user1',
      doctor_name: 'Dr. Emily Rodriguez',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      type: 'Dental Cleaning',
      notes: 'Regular dental checkup and cleaning',
      reminder: true
    }
  ]

  const upcomingAppointments = [...appointments, ...hardcodedAppointments].filter(
    (apt) => apt.date > new Date() && apt.date < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Next 2 weeks
  ).sort((a, b) => a.date.getTime() - b.date.getTime())

  // Get critical alerts from both agent alerts and notifications
  const criticalAlerts = [...(alerts || []), ...(agentAlerts || [])].filter((alert) => 
    alert?.severity === "high" && !alert?.acknowledged
  )

  const recentVitals = vitals.slice(-1)[0]

  // Fetch agent alerts and critical alerts on component mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        await Promise.all([
          getAgentAlerts(),
          getCriticalAlerts()
        ])
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
  }, [getAgentAlerts, getCriticalAlerts])

  // Generate sample agent alerts for demonstration
  const sampleAgentAlerts = [
    {
      _id: 'alert1',
      user_id: 'user1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'vital_alert' as const,
      message: 'High blood pressure detected (150/95 mmHg) - Please consult your doctor',
      severity: 'high' as const,
      acknowledged: false
    },
    {
      _id: 'alert2',
      user_id: 'user1',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'missed_meds' as const,
      message: 'Metformin stock is running low (5 tablets remaining)',
      severity: 'moderate' as const,
      acknowledged: false
    },
    {
      _id: 'alert3',
      user_id: 'user1',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      type: 'summary' as const,
      message: 'Blood sugar levels have been consistently elevated this week',
      severity: 'high' as const,
      acknowledged: false
    }
  ]

  // Combine real alerts with sample alerts
  const allAlerts = [...(agentAlerts || []), ...sampleAgentAlerts]
  const allCriticalAlerts = [...(criticalAlerts || []), ...sampleAgentAlerts.filter(alert => alert.severity === 'high' && !alert.acknowledged)]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-foreground mb-2">Loading Dashboard</h3>
          <p className="text-muted-foreground">Please wait while we load your health data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your family's health overview.</p>
        </div>
        <Button onClick={() => setShowAddMemberModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="border-l-4 border-l-teal-500 shadow-[0_0_15px_rgba(13,148,136,0.7)] hover:shadow-[0_0_25px_rgba(13,148,136,1)] transition-shadow cursor-pointer"
          onClick={() => setShowViewMembersModal(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{family?.members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active members in {family?.name || 'Family'}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.7)] hover:shadow-[0_0_25px_rgba(59,130,246,1)] transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications Due</CardTitle>
            <Pill className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicationsDue.length}</div>
            <p className="text-xs text-muted-foreground">Medications due today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)] hover:shadow-[0_0_25px_rgba(34,197,94,1)] transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] hover:shadow-[0_0_25px_rgba(239,68,68,1)] transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCriticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vitals */}
        <Card className="border-l-4  shadow-[0_0_15px_rgba(239,68,68,0.7)] hover:shadow-[0_0_25px_rgba(239,68,68,1)] transition-shadow">
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
                  <span className="text-sm text-muted-foreground">Blood Pressure</span>
                  <Badge variant={recentVitals.bp_systolic > 140 ? "destructive" : "secondary"}>
                    {recentVitals.bp_systolic}/{recentVitals.bp_diastolic} mmHg
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Blood Sugar</span>
                  <Badge variant={recentVitals.sugar > 140 ? "destructive" : "secondary"}>
                    {recentVitals.sugar} mg/dL
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <Badge variant="secondary">{recentVitals.weight} kg</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Temperature</span>
                  <Badge variant={recentVitals.temperature > 99.5 ? "destructive" : "secondary"}>
                    {recentVitals.temperature}°F
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No vitals recorded yet</p>
            )}
            <Link href="/dashboard/vitals">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Vitals
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Medications */}
        <Card className="border-l-4 shadow-[0_0_15px_rgba(59,130,246,0.7)] hover:shadow-[0_0_25px_rgba(59,130,246,1)] transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Today's Medications
            </CardTitle>
            <CardDescription>Medications due today</CardDescription>
          </CardHeader>
          <CardContent>
            {medicationsDue.length > 0 ? (
              <div className="space-y-3">
                {medicationsDue.slice(0, 3).map((med) => (
                  <div key={med._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{med.medicine_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                    <Badge variant="outline">{med.timing.join(", ")}</Badge>
                  </div>
                ))}
                {medicationsDue.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{medicationsDue.length - 3} more medications</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No medications due today</p>
            )}
            <Link href="/dashboard/medications">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                Manage Medications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="border-l-4 border-l-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)] hover:shadow-[0_0_25px_rgba(34,197,94,1)] transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Appointments in the next 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((apt) => (
                <div key={apt._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">{apt.doctor_name}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                    <p className="text-xs text-green-600">
                      {apt.date.toLocaleDateString()} at {apt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {Math.ceil((apt.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))} days
                  </Badge>
                </div>
              ))}
              {upcomingAppointments.length > 3 && (
                <p className="text-sm text-muted-foreground">+{upcomingAppointments.length - 3} more appointments</p>
              )}
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="outline" className="w-full mt-4 bg-transparent border-green-300 text-green-700 hover:bg-green-50">
                View All Appointments
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {allCriticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:shadow-[0_0_10px_var(--glow-border)] transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
            <CardDescription className="text-red-600">These alerts require immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allCriticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert._id} className="p-3 bg-card rounded-lg border border-red-200">
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
      <ViewFamilyMembersModal open={showViewMembersModal} onOpenChange={setShowViewMembersModal} />
    </div>
  )
}
