export interface FamilyMember {
  _id: string
  name: string
  relationship: string
  age: number
  gender: string
  blood_group?: string
  phone?: string
  medical_conditions?: string[]
}

export interface Family {
  _id: string
  name: string
  members: FamilyMember[]
}
