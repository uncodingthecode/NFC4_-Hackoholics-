import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string | Date | null): number => {
  if (!dateOfBirth) return 0
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) return 0
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return Math.max(0, age) // Ensure age is not negative
}

// Function to format age display
export const formatAge = (age: number, hasDOB: boolean): string => {
  if (age > 0) {
    return `${age} ${age === 1 ? 'year' : 'years'}`
  } else if (hasDOB) {
    return 'Calculating...'
  } else {
    return 'Not specified'
  }
}

// Function to calculate BMI
export const calculateBMI = (weight: number | null, height: number | null): number => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0
  
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  
  return Math.round(bmi * 10) / 10 // Round to 1 decimal place
}

// Function to get BMI category
export const getBMICategory = (bmi: number): string => {
  if (bmi === 0) return 'N/A'
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

// Function to format BMI display
export const formatBMI = (bmi: number): string => {
  if (bmi === 0) return 'Not specified'
  return `${bmi} (${getBMICategory(bmi)})`
}
