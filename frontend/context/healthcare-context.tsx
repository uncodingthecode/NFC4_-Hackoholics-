"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  _id: string
  name: string
  email: string
  role: "head" | "member"
  family_id: string
  created_at: Date
}

interface Family {
  _id: string
  name: string
  head_id: string
  members: string[]
  emergency_contacts: Array<{
    name: string
    relation: string
    phone: string
  }>
}

interface Profile {
  _id: string
  user_id: string
  DOB: Date
  height: number
  weight: number
  gender: "Male" | "Female" | "Other"
  blood_group: string
  family_doctor_email: string[]
  allergies: string[]
  existing_conditions: string[]
  medications: string[]
}

interface Medication {
  _id: string
  user_id: string
  medicine_name: string
  dosage: string
  frequency: string
  timing: string[]
  start_date: Date
  end_date: Date
  stock_count: number
  refill_alert_threshold: number
}

interface Vital {
  _id: string
  user_id: string
  timestamp: Date
  bp_systolic: number
  bp_diastolic: number
  sugar: number
  weight: number
  temperature: number
}

interface Alert {
  _id: string
  user_id: string
  timestamp: Date
  type: "vital_alert" | "missed_meds" | "summary"
  message: string
  severity: "low" | "moderate" | "high"
  acknowledged: boolean
}

interface Appointment {
  _id: string
  user_id: string
  doctor_name: string
  date: Date
  type: string
  notes: string
  reminder: boolean
}

interface HealthcareContextType {
  user: User | null
  family: Family | null
  profiles: Profile[]
  medications: Medication[]
  vitals: Vital[]
  alerts: Alert[]
  appointments: Appointment[]
  darkMode: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  toggleDarkMode: () => void
  addFamilyMember: (memberData: Partial<User>) => void
  updateProfile: (userId: string, profileData: Partial<Profile>) => void
  addMedication: (medicationData: Partial<Medication>) => void
  addVital: (vitalData: Partial<Vital>) => void
  addAppointment: (appointmentData: Partial<Appointment>) => void
  acknowledgeAlert: (alertId: string) => void
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined)

export function HealthcareProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [vitals, setVitals] = useState<Vital[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [darkMode, setDarkMode] = useState(false)

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    const mockUser: User = {
      _id: "user1",
      name: "John Smith",
      email: "john@example.com",
      role: "head",
      family_id: "family1",
      created_at: new Date(),
    }

    const mockFamily: Family = {
      _id: "family1",
      name: "Smith Family",
      head_id: "user1",
      members: ["user1", "user2", "user3"],
      emergency_contacts: [
        { name: "Dr. Johnson", relation: "Family Doctor", phone: "+1-555-0123" },
        { name: "Sarah Smith", relation: "Sister", phone: "+1-555-0124" },
      ],
    }

    const mockProfiles: Profile[] = [
      {
        _id: "profile1",
        user_id: "user1",
        DOB: new Date("1985-06-15"),
        height: 175,
        weight: 70,
        gender: "Male",
        blood_group: "O+",
        family_doctor_email: ["dr.johnson@clinic.com"],
        allergies: ["Peanuts"],
        existing_conditions: ["Hypertension"],
        medications: ["med1"],
      },
    ]

    const mockMedications: Medication[] = [
      {
        _id: "med1",
        user_id: "user1",
        medicine_name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        timing: ["08:00"],
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-12-31"),
        stock_count: 25,
        refill_alert_threshold: 10,
      },
    ]

    const mockVitals: Vital[] = [
      {
        _id: "vital1",
        user_id: "user1",
        timestamp: new Date(),
        bp_systolic: 130,
        bp_diastolic: 85,
        sugar: 95,
        weight: 70,
        temperature: 98.6,
      },
    ]

    const mockAlerts: Alert[] = [
      {
        _id: "alert1",
        user_id: "user1",
        timestamp: new Date(),
        type: "vital_alert",
        message: "Blood pressure reading is elevated. Consider consulting your doctor.",
        severity: "moderate",
        acknowledged: false,
      },
    ]

    const mockAppointments: Appointment[] = [
      {
        _id: "appt1",
        user_id: "user1",
        doctor_name: "Dr. Johnson",
        date: new Date("2024-02-15T10:00:00"),
        type: "Regular Checkup",
        notes: "Annual physical examination",
        reminder: true,
      },
    ]

    setUser(mockUser)
    setFamily(mockFamily)
    setProfiles(mockProfiles)
    setMedications(mockMedications)
    setVitals(mockVitals)
    setAlerts(mockAlerts)
    setAppointments(mockAppointments)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    if (email === "john@example.com" && password === "password") {
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setFamily(null)
    setProfiles([])
    setMedications([])
    setVitals([])
    setAlerts([])
    setAppointments([])
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const addFamilyMember = (memberData: Partial<User>) => {
    // Mock implementation
    console.log("Adding family member:", memberData)
  }

  const updateProfile = (userId: string, profileData: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((profile) => (profile.user_id === userId ? { ...profile, ...profileData } : profile)),
    )
  }

  const addMedication = (medicationData: Partial<Medication>) => {
    const newMedication: Medication = {
      _id: `med${Date.now()}`,
      user_id: user?._id || "",
      medicine_name: "",
      dosage: "",
      frequency: "",
      timing: [],
      start_date: new Date(),
      end_date: new Date(),
      stock_count: 0,
      refill_alert_threshold: 10,
      ...medicationData,
    }
    setMedications((prev) => [...prev, newMedication])
  }

  const addVital = (vitalData: Partial<Vital>) => {
    const newVital: Vital = {
      _id: `vital${Date.now()}`,
      user_id: user?._id || "",
      timestamp: new Date(),
      bp_systolic: 0,
      bp_diastolic: 0,
      sugar: 0,
      weight: 0,
      temperature: 0,
      ...vitalData,
    }
    setVitals((prev) => [...prev, newVital])
  }

  const addAppointment = (appointmentData: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      _id: `appt${Date.now()}`,
      user_id: user?._id || "",
      doctor_name: "",
      date: new Date(),
      type: "",
      notes: "",
      reminder: false,
      ...appointmentData,
    }
    setAppointments((prev) => [...prev, newAppointment])
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert._id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  return (
    <HealthcareContext.Provider
      value={{
        user,
        family,
        profiles,
        medications,
        vitals,
        alerts,
        appointments,
        darkMode,
        login,
        logout,
        toggleDarkMode,
        addFamilyMember,
        updateProfile,
        addMedication,
        addVital,
        addAppointment,
        acknowledgeAlert,
      }}
    >
      {children}
    </HealthcareContext.Provider>
  )
}

export function useHealthcare() {
  const context = useContext(HealthcareContext)
  if (context === undefined) {
    throw new Error("useHealthcare must be used within a HealthcareProvider")
  }
  return context
}
