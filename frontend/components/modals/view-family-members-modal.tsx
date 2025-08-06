import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useHealthcare } from "@/context/healthcare-context"
import { Family, FamilyMember } from "@/types/family"

interface ViewFamilyMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewFamilyMembersModal({ open, onOpenChange }: ViewFamilyMembersModalProps) {
  const { family } = useHealthcare()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Family Members</DialogTitle>
          <DialogDescription>
            Members of {family?.name || 'your family'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {family?.members?.map((member) => (
            <Card key={member._id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-teal-700">
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Age</span>
                      <span className="text-sm font-medium">{member.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gender</span>
                      <span className="text-sm font-medium">{member.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Blood Group</span>
                      <span className="text-sm font-medium">{member.blood_group || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <span className="text-sm font-medium">{member.phone || 'Not specified'}</span>
                    </div>
                    {member.medical_conditions && member.medical_conditions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground">Medical Conditions</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {member.medical_conditions.map((condition, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
