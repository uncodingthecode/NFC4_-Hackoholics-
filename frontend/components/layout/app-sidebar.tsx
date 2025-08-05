"use client"

import { Calendar, Heart, Home, MessageCircle, Pill, Shield, TrendingUp, User, FileText, Bell } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useHealthcare } from "@/context/healthcare-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Medications",
    url: "/dashboard/medications",
    icon: Pill,
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Vitals",
    url: "/dashboard/vitals",
    icon: TrendingUp,
  },
  {
    title: "Prescriptions",
    url: "/dashboard/prescriptions",
    icon: FileText,
  },
  {
    title: "Alerts",
    url: "/dashboard/alerts",
    icon: Bell,
  },
  {
    title: "Emergency",
    url: "/dashboard/emergency",
    icon: Shield,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: MessageCircle,
  },
]

export function AppSidebar() {
  const { family } = useHealthcare()
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Heart className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">HealthCare</h2>
            <p className="text-sm text-gray-600">{family?.name || "Family Dashboard"}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-gray-700 hover:bg-teal-50 hover:text-teal-700 data-[active=true]:bg-teal-100 data-[active=true]:text-teal-700"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
