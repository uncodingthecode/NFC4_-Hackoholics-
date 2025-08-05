"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useHealthcare } from "@/context/healthcare-context"
import { Plus, Phone, Share, Shield, AlertTriangle, User } from "lucide-react"
import { AddEmergencyContactModal } from "@/components/modals/add-emergency-contact-modal"
import { EmergencyContactCard } from "@/components/EmergencyContactCard"
import { useToast } from "@/hooks/use-toast"

export default function EmergencyPage() {
  const { family, user, updateEmergencyContacts } = useHealthcare()
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  const handleEmergencyCall = (phone: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${phone}`
    }
  }

  const handleShareSummary = () => {
    // Mock implementation for sharing health summary
    console.log("Sharing health summary...")
  }

  const handleDeleteContact = async (contactIndex: number) => {
    try {
      const currentContacts = family?.emergency_contacts || []
      const updatedContacts = currentContacts.filter((_, index) => index !== contactIndex)
      
      await updateEmergencyContacts(updatedContacts)
      
      toast({
        title: "Contact removed",
        description: "Emergency contact has been removed successfully.",
      })
    } catch (error) {
      console.error('Error removing emergency contact:', error)
      toast({
        title: "Error",
        description: "Failed to remove emergency contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Contacts</h1>
          <p className="text-muted-foreground">Manage emergency contacts and quick access to important information</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Emergency Contact
        </Button>
      </div>

      {/* Emergency Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Emergency Information
          </CardTitle>
          <CardDescription className="text-red-600">
            In case of medical emergency, call 911 immediately. Use contacts below for non-emergency situations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="destructive" className="flex-1" onClick={() => handleEmergencyCall("911")}>
              <Phone className="mr-2 h-4 w-4" />
              Call 911 - Emergency
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
              onClick={handleShareSummary}
            >
              <Share className="mr-2 h-4 w-4" />
              Share Health Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-blue-800 mb-2">Poison Control</h3>
            <p className="text-sm text-blue-600 mb-3">24/7 Poison Control Hotline</p>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
              onClick={() => handleEmergencyCall("1-800-222-1222")}
            >
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-green-800 mb-2">Mental Health Crisis</h3>
            <p className="text-sm text-green-600 mb-3">Crisis Text Line Support</p>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              onClick={() => handleEmergencyCall("988")}
            >
              Call 988
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-purple-800 mb-2">Insurance Info</h3>
            <p className="text-sm text-purple-600 mb-3">Access insurance details</p>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-600" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>People to contact in case of medical emergency</CardDescription>
        </CardHeader>
        <CardContent>
          {family?.emergency_contacts && family.emergency_contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {family.emergency_contacts.map((contact, index) => (
                <EmergencyContactCard 
                  key={index} 
                  contact={contact} 
                  onDelete={() => handleDeleteContact(index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No emergency contacts</h3>
              <p className="text-muted-foreground mb-4">Add emergency contacts to ensure help is available when needed</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Add First Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Information Summary */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Medical Information Summary
          </CardTitle>
          <CardDescription>Critical health information for emergency responders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {user?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-medium">Family:</span> {family?.name}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Critical Medical Info</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Blood Type:</span> O+ (example)
                </p>
                <p>
                  <span className="font-medium">Allergies:</span> Peanuts (example)
                </p>
                <p>
                  <span className="font-medium">Conditions:</span> Hypertension (example)
                </p>
                <p>
                  <span className="font-medium">Current Medications:</span> Lisinopril 10mg (example)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This information is automatically generated from your health profile. Please ensure all medical
                  information is kept up to date.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddEmergencyContactModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
