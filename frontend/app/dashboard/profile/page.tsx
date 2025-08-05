"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"
import { User, Edit, Save, X, Plus, Trash2 } from "lucide-react"
import { ProfileCard } from "@/components/ProfileCard"

export default function ProfilePage() {
  const { user, profile, getProfile, updateProfile, addFamilyDoctor } = useHealthcare()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentProfile, setCurrentProfile] = useState({
    DOB: "",
    height: "",
    weight: "",
    gender: "Male" as "Male" | "Female" | "Other",
    blood_group: "",
    family_doctor_email: [] as string[],
    allergies: [] as string[],
    existing_conditions: [] as string[],
  })
  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [newDoctorEmail, setNewDoctorEmail] = useState("")

  // Load profile data when component mounts
  useEffect(() => {
    if (user) {
      getProfile()
    }
  }, [user, getProfile])

  // Update form when profile data changes (only on initial load)
  useEffect(() => {
    if (profile && !isInitialized) {
      setCurrentProfile({
        DOB: profile.DOB ? new Date(profile.DOB).toISOString().split("T")[0] : "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        gender: profile.gender || "Male",
        blood_group: profile.blood_group || "",
        family_doctor_email: [...(profile.family_doctor_email || [])], // Use profile data
        allergies: [...(profile.allergies || [])],
        existing_conditions: [...(profile.existing_conditions || [])],
      })
      setIsInitialized(true)
    }
  }, [profile, isInitialized])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateProfile(user?._id || "", {
        DOB: currentProfile.DOB ? new Date(currentProfile.DOB) : null,
        height: currentProfile.height ? Number.parseFloat(currentProfile.height) : null,
        weight: currentProfile.weight ? Number.parseFloat(currentProfile.weight) : null,
        gender: currentProfile.gender,
        blood_group: currentProfile.blood_group,
        family_doctor_email: profile?.family_doctor_email || [], // Use profile data instead of currentProfile
        allergies: currentProfile.allergies,
        existing_conditions: currentProfile.existing_conditions,
      })

      // Refresh profile data after successful update
      await getProfile()
      setIsInitialized(false) // Reset to allow form to update with new data

      toast({
        title: "Profile updated",
        description: "Health profile has been successfully updated.",
      })
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (type: "allergies" | "existing_conditions" | "family_doctor_email", value: string) => {
    if (!value.trim()) return

    if (type === "family_doctor_email") {
      try {
        await addFamilyDoctor(value.trim())
        setNewDoctorEmail("")
        // Refresh profile data to get the updated family doctors
        await getProfile()
        toast({
          title: "Family doctor added",
          description: "Family doctor email has been successfully added to your profile.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add family doctor. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setCurrentProfile((prev) => ({
        ...prev,
        [type]: [...prev[type], value.trim()],
      }))

      // Reset input
      if (type === "allergies") setNewAllergy("")
      if (type === "existing_conditions") setNewCondition("")
    }
  }

  const removeItem = async (type: "allergies" | "existing_conditions" | "family_doctor_email", index: number) => {
    if (type === "family_doctor_email") {
      // For family doctors, we need to update the profile with the filtered list
      const updatedEmails = profile.family_doctor_email?.filter((_, i) => i !== index) || []
      try {
        await updateProfile(user?._id || "", {
          family_doctor_email: updatedEmails,
        })
        // Refresh profile data to get the updated family doctors
        await getProfile()
        toast({
          title: "Family doctor removed",
          description: "Family doctor has been successfully removed from your profile.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove family doctor. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setCurrentProfile((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }))
    }
  }

  const handleEditClick = () => {
    // Ensure form is initialized with current profile data
    if (profile) {
      setCurrentProfile({
        DOB: profile.DOB ? new Date(profile.DOB).toISOString().split("T")[0] : "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        gender: profile.gender || "Male",
        blood_group: profile.blood_group || "",
        family_doctor_email: [...(profile.family_doctor_email || [])], // Use profile data
        allergies: [...(profile.allergies || [])],
        existing_conditions: [...(profile.existing_conditions || [])],
      })
    }
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    // Reset form to original profile data
    if (profile) {
      setCurrentProfile({
        DOB: profile.DOB ? new Date(profile.DOB).toISOString().split("T")[0] : "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        gender: profile.gender || "Male",
        blood_group: profile.blood_group || "",
        family_doctor_email: [...(profile.family_doctor_email || [])], // Use profile data
        allergies: [...(profile.allergies || [])],
        existing_conditions: [...(profile.existing_conditions || [])],
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">User not logged in</h3>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  // Show loading state while profile is being fetched
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-foreground mb-2">Loading Profile</h3>
          <p className="text-muted-foreground">Please wait while we load your health profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Hello {user?.name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your health information and medical details
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelClick}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={handleEditClick} className="bg-teal-600 hover:bg-teal-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <ProfileCard />

      {/* Basic Information */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Personal and medical details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dob"
                  type="date"
                  value={currentProfile.DOB}
                  onChange={(e) => setCurrentProfile((prev) => ({ ...prev, DOB: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-background rounded border">
                  {currentProfile.DOB ? new Date(currentProfile.DOB).toLocaleDateString() : "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <Select
                  value={currentProfile.gender}
                  onValueChange={(value: "Male" | "Female" | "Other") =>
                    setCurrentProfile((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 bg-background rounded border">{currentProfile.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              {isEditing ? (
                <Select
                  value={currentProfile.blood_group}
                  onValueChange={(value) => setCurrentProfile((prev) => ({ ...prev, blood_group: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="p-2 bg-background rounded border">{currentProfile.blood_group || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              {isEditing ? (
                <Input
                  id="height"
                  type="number"
                  value={currentProfile.height}
                  onChange={(e) => setCurrentProfile((prev) => ({ ...prev, height: e.target.value }))}
                  placeholder="175"
                />
              ) : (
                <p className="p-2 bg-background rounded border">
                  {currentProfile.height ? `${currentProfile.height} cm` : "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              {isEditing ? (
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={currentProfile.weight}
                  onChange={(e) => setCurrentProfile((prev) => ({ ...prev, weight: e.target.value }))}
                  placeholder="70.5"
                />
              ) : (
                <p className="p-2 bg-background rounded border">
                  {currentProfile.weight ? `${currentProfile.weight} kg` : "Not specified"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Doctors */}
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">
          <CardHeader>
            <CardTitle>Family Doctors</CardTitle>
            <CardDescription>Healthcare provider contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.family_doctor_email?.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                  <span className="text-sm">{email}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem("family_doctor_email", index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="doctor@clinic.com"
                    value={newDoctorEmail}
                    onChange={(e) => setNewDoctorEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addItem("family_doctor_email", newDoctorEmail)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("family_doctor_email", newDoctorEmail)}
                    className="bg-transparent"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {(!profile.family_doctor_email || profile.family_doctor_email.length === 0) && !isEditing && (
                <p className="text-muted-foreground text-sm">No family doctors added</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>Known allergic reactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentProfile.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    {allergy}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("allergies", index)}
                        className="h-3 w-3 p-0 hover:bg-transparent"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addItem("allergies", newAllergy)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("allergies", newAllergy)}
                    className="bg-transparent"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {currentProfile.allergies.length === 0 && !isEditing && (
                <p className="text-muted-foreground text-sm">No known allergies</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Conditions */}
      <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


        <CardHeader>
          <CardTitle>Existing Medical Conditions</CardTitle>
          <CardDescription>Current health conditions and diagnoses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {currentProfile.existing_conditions.map((condition, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {condition}
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem("existing_conditions", index)}
                      className="h-3 w-3 p-0 hover:bg-transparent"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add medical condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem("existing_conditions", newCondition)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItem("existing_conditions", newCondition)}
                  className="bg-transparent"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            {currentProfile.existing_conditions.length === 0 && !isEditing && (
              <p className="text-muted-foreground text-sm">No existing conditions reported</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
