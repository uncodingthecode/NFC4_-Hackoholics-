"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useHealthcare()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "moderate":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "moderate":
        return <Clock className="h-4 w-4" />
      case "low":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Alerts</h1>
          <p className="text-muted-foreground">Monitor important health notifications and AI insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            {unacknowledgedAlerts.length} Unread
          </Badge>
        </div>
      </div>

      {/* AI Health Agent Panel */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <TrendingUp className="h-5 w-5" />
            AI Health Agent Insights
          </CardTitle>
          <CardDescription className="text-teal-600">
            Personalized health recommendations based on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-card rounded-lg border border-teal-200">
              <p className="font-medium text-teal-800">Blood Pressure Trend Analysis</p>
              <p className="text-sm text-teal-600 mt-1">
                Your BP readings have been elevated for 3 consecutive days. Consider scheduling a consultation with your
                doctor.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-teal-300 text-teal-700 hover:bg-teal-100 bg-transparent"
              >
                Schedule Appointment
              </Button>
            </div>
            <div className="p-3 bg-card rounded-lg border border-teal-200">
              <p className="font-medium text-teal-800">Medication Adherence</p>
              <p className="text-sm text-teal-600 mt-1">
                Great job! You've maintained 95% medication adherence this month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unacknowledged Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unread Alerts</h2>
          <div className="space-y-3">
            {unacknowledgedAlerts.map((alert) => (
              <Card key={alert._id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{alert.type.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <p className="font-medium text-foreground mb-1">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert._id)} className="ml-4">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Alerts</h2>
          <div className="space-y-3">
            {acknowledgedAlerts.slice(0, 5).map((alert) => (
              <Card key={alert._id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{alert.severity.toUpperCase()}</Badge>
                        <Badge variant="outline">{alert.type.replace("_", " ").toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-green-600">
                          ACKNOWLEDGED
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-700 mb-1">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No alerts</h3>
            <p className="text-muted-foreground">You're all caught up! No health alerts at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
