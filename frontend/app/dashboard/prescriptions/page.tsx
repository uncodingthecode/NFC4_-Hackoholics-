"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Search, Eye, Camera, Check } from "lucide-react"
import { OCRUploader } from "@/components/OCRUploader"

interface Prescription {
  _id: string
  user_id: string
  upload_time: Date
  image_url: string
  ocr_text: string
  extracted_medications: Array<{
    name: string
    dosage: string
    frequency: string
    linked_medication_id?: string
  }>
  status: "processing" | "completed" | "error"
}

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploader, setShowUploader] = useState(false)

  // Mock prescriptions data
  const [prescriptions] = useState<Prescription[]>([
    {
      _id: "1",
      user_id: "user1",
      upload_time: new Date("2024-01-15"),
      image_url: "/prescription-document.png",
      ocr_text: "Dr. Johnson\nPatient: John Smith\nRx: Lisinopril 10mg\nTake once daily\nQty: 30\nRefills: 2",
      extracted_medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          linked_medication_id: "med1",
        },
      ],
      status: "completed",
    },
    {
      _id: "2",
      user_id: "user1",
      upload_time: new Date("2024-01-10"),
      image_url: "/medical-prescription.png",
      ocr_text: "Processing...",
      extracted_medications: [],
      status: "processing",
    },
  ])

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.ocr_text.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground">Upload and manage your prescription documents with OCR processing</p>
        </div>
        <Button onClick={() => setShowUploader(true)} className="bg-teal-600 hover:bg-teal-700">
          <Upload className="mr-2 h-4 w-4" />
          Upload Prescription
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search prescriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Upload Instructions */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Camera className="h-5 w-5" />
            AI-Powered OCR Processing
          </CardTitle>
          <CardDescription className="text-teal-600">
            Upload prescription images for automatic text extraction and medication parsing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-2">
                <Upload className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-medium text-teal-800">1. Upload Image</h3>
              <p className="text-sm text-teal-600">Take a clear photo of your prescription</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-2">
                <Eye className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-medium text-teal-800">2. OCR Processing</h3>
              <p className="text-sm text-teal-600">AI extracts text and identifies medications</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-2">
                <Check className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-medium text-teal-800">3. Add to Medications</h3>
              <p className="text-sm text-teal-600">Review and add to your medication list</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Prescription Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={prescription.image_url || "/placeholder.svg"}
                      alt="Prescription"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-foreground">Prescription #{prescription._id}</h3>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {prescription.upload_time.toLocaleDateString()} at{" "}
                        {prescription.upload_time.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                  </div>

                  {/* OCR Text */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Extracted Text:</h4>
                    <div className="p-3 bg-background rounded border text-sm text-gray-700 font-mono whitespace-pre-line">
                      {prescription.ocr_text}
                    </div>
                  </div>

                  {/* Extracted Medications */}
                  {prescription.extracted_medications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Extracted Medications:</h4>
                      <div className="space-y-2">
                        {prescription.extracted_medications.map((med, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} - {med.frequency}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {med.linked_medication_id ? (
                                <Badge className="bg-green-100 text-green-800">Added to Medications</Badge>
                              ) : (
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                                  Add to Medications
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.status === "processing" && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <span className="text-sm">Processing prescription image...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Prescriptions */}
      {filteredPrescriptions.length === 0 && (
        <Card className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow">


          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No prescriptions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Upload your first prescription for OCR processing"}
            </p>
            <Button onClick={() => setShowUploader(true)} className="bg-teal-600 hover:bg-teal-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload Prescription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* OCR Uploader Modal */}
      {showUploader && (
        <OCRUploader
          onClose={() => setShowUploader(false)}
          onUploadComplete={(result) => {
            console.log("Upload completed:", result)
            setShowUploader(false)
          }}
        />
      )}
    </div>
  )
}
