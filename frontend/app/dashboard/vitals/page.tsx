"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { Plus, TrendingUp, Heart, Thermometer, Weight, Droplets } from "lucide-react"
import { AddVitalModal } from "@/components/modals/add-vital-modal"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function VitalsPage() {
  const { vitals } = useHealthcare()
  const [showAddModal, setShowAddModal] = useState(false)

  const latestVital = vitals[vitals.length - 1]

  // Prepare chart data
  const chartData = vitals.map((vital, index) => ({
    date: vital.timestamp.toLocaleDateString(),
    systolic: vital.bp_systolic,
    diastolic: vital.bp_diastolic,
    sugar: vital.sugar,
    weight: vital.weight,
    temperature: vital.temperature,
  }))

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case "bp_systolic":
        if (value > 140) return { status: "high", color: "destructive" }
        if (value < 90) return { status: "low", color: "destructive" }
        return { status: "normal", color: "secondary" }
      case "bp_diastolic":
        if (value > 90) return { status: "high", color: "destructive" }
        if (value < 60) return { status: "low", color: "destructive" }
        return { status: "normal", color: "secondary" }
      case "sugar":
        if (value > 140) return { status: "high", color: "destructive" }
        if (value < 70) return { status: "low", color: "destructive" }
        return { status: "normal", color: "secondary" }
      case "temperature":
        if (value > 99.5) return { status: "fever", color: "destructive" }
        if (value < 97) return { status: "low", color: "destructive" }
        return { status: "normal", color: "secondary" }
      default:
        return { status: "normal", color: "secondary" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vitals Tracker</h1>
          <p className="text-muted-foreground">Monitor your health metrics over time</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Vitals
        </Button>
      </div>

      {/* Latest Vitals Overview */}
      {latestVital && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestVital.bp_systolic}/{latestVital.bp_diastolic}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getVitalStatus("bp_systolic", latestVital.bp_systolic).color as any}>
                  {getVitalStatus("bp_systolic", latestVital.bp_systolic).status}
                </Badge>
                <span className="text-xs text-muted-foreground">mmHg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestVital.sugar}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getVitalStatus("sugar", latestVital.sugar).color as any}>
                  {getVitalStatus("sugar", latestVital.sugar).status}
                </Badge>
                <span className="text-xs text-muted-foreground">mg/dL</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight</CardTitle>
              <Weight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestVital.weight}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">stable</Badge>
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestVital.temperature}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getVitalStatus("temperature", latestVital.temperature).color as any}>
                  {getVitalStatus("temperature", latestVital.temperature).status}
                </Badge>
                <span className="text-xs text-muted-foreground">°F</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Blood Pressure Trend
            </CardTitle>
            <CardDescription>Systolic and diastolic readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Blood Sugar Trend
            </CardTitle>
            <CardDescription>Blood glucose levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={2} name="Blood Sugar" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Vitals History */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardHeader>
          <CardTitle>Recent Vitals History</CardTitle>
          <CardDescription>Your latest vital sign measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vitals
              .slice(-5)
              .reverse()
              .map((vital) => (
                <div key={vital._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {vital.timestamp.toLocaleDateString()} at {vital.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {vital.bp_systolic}/{vital.bp_diastolic}
                      </div>
                      <div className="text-xs text-muted-foreground">BP (mmHg)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{vital.sugar}</div>
                      <div className="text-xs text-muted-foreground">Sugar (mg/dL)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{vital.weight}</div>
                      <div className="text-xs text-muted-foreground">Weight (kg)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{vital.temperature}</div>
                      <div className="text-xs text-muted-foreground">Temp (°F)</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {vitals.length === 0 && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardContent className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No vitals recorded</h3>
            <p className="text-muted-foreground mb-4">Start tracking your health by recording your first vital signs</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Vitals
            </Button>
          </CardContent>
        </Card>
      )}

      <AddVitalModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
