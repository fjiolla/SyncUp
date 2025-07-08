"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plus, Bell } from "lucide-react"
import Link from "next/link"

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    description: "Welcome back! Find your next Pod",
  },
  "/dashboard/pods": {
    title: "My Pods",
    description: "Manage your active and past Pods",
  },
  "/dashboard/calendar": {
    title: "Calendar",
    description: "View your schedule and upcoming events",
  },
  "/profile": {
    title: "Profile",
    description: "Manage your SyncUp profile",
  },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentPage = pageInfo[pathname as keyof typeof pageInfo] || pageInfo["/dashboard"]

  return (
    <header className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{currentPage.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button
          className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
          asChild
        >
          <Link href="/create-pod">
            <Plus className="h-4 w-4 mr-2" />
            Create Pod
          </Link>
        </Button>
      </div>
    </header>
  )
}
