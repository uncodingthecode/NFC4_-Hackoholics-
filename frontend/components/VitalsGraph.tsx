"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface Vital {
  timestamp: Date
  bp_systolic: number
  bp_diastolic: number
  sugar: number
  weight: number
  temperature: number
}

interface VitalsGraphProps {
  vitals: Vital[]
  type: "blood_pressure" | "sugar" | "weight" | "temperature"
  title: string
  color: string
}

export function VitalsGraph({ vitals, type, title, color }: VitalsGraphProps) {
  const chartData = vitals
    .map((vital) => ({
      date: vital.timestamp.toLocaleDateString(),
      timestamp: vital.timestamp.getTime(),
      ...vital,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  const getDataKey = () => {
    switch (type) {
      case "blood_pressure":
        return ["bp_systolic", "bp_diastolic"]
      case "sugar":
        return ["sugar"]
      case "weight":
        return ["weight"]
      case "temperature":
        return ["temperature"]
      default:
        return []
    }
  }

  const getUnit = () => {
    switch (type) {
      case "blood_pressure":
        return "mmHg"
      case "sugar":
        return "mg/dL"
      case "weight":
        return "kg"
      case "temperature":
        return "°F"
      default:
        return ""
    }
  }

  const dataKeys = getDataKey()

  return (
    <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} tick={{ fill: "#6b7280" }} />
            <YAxis
              fontSize={12}
              tick={{ fill: "#6b7280" }}
              label={{ value: getUnit(), angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number, name: string) => [
                `${value} ${getUnit()}`,
                name === "bp_systolic"
                  ? "Systolic"
                  : name === "bp_diastolic"
                    ? "Diastolic"
                    : name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={index === 0 ? color : "#f97316"}
                strokeWidth={2}
                dot={{ fill: index === 0 ? color : "#f97316", strokeWidth: 2, r: 4 }}
                name={
                  key === "bp_systolic"
                    ? "Systolic"
                    : key === "bp_diastolic"
                      ? "Diastolic"
                      : key.charAt(0).toUpperCase() + key.slice(1)
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
