"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useHealthcare } from "@/context/healthcare-context"
import { Plus, Search, Clock, AlertTriangle, Calendar } from "lucide-react"
import { AddMedicationModal } from "@/components/modals/add-medication-modal"
import { Pill } from "lucide-react" // Declaring the Pill variable

export default function MedicationsPage() {
  const { medications } = useHealthcare()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMedications = medications.filter((med) =>
    med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockMeds = medications.filter((med) => med.stock_count <= med.refill_alert_threshold)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medications</h1>
          <p className="text-muted-foreground">Manage your family's medications and schedules</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMeds.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-orange-600">
              {lowStockMeds.length} medication(s) need refilling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMeds.map((med) => (
                <div key={med._id} className="flex justify-between items-center p-2 bg-card rounded border">
                  <span className="font-medium">{med.medicine_name}</span>
                  <Badge variant="destructive">{med.stock_count} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => (
          <Card key={medication._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{medication.medicine_name}</CardTitle>
              <CardDescription>{medication.dosage}</CardDescription>
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
                  <Badge
                    variant={medication.stock_count <= medication.refill_alert_threshold ? "destructive" : "secondary"}
                  >
                    {medication.stock_count} pills
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm">
                    {medication.start_date.toLocaleDateString()} - {medication.end_date.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Clock className="mr-1 h-3 w-3" />
                  Set Reminder
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Calendar className="mr-1 h-3 w-3" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardContent className="text-center py-12">
            <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No medications found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first medication"}
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      )}

      <AddMedicationModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
