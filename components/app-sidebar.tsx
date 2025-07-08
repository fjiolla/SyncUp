"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, Users, Calendar, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { title: "Home", icon: Home, href: "/dashboard" },
  { title: "My Pods", icon: Users, href: "/dashboard/pods" },
  { title: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
  { title: "Profile", icon: User, href: "/profile" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">SyncUp</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Connect & Collaborate</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-3 py-2 rounded-md transition-colors hover:bg-muted",
                      isActive && "bg-muted border-l-4 border-l-blue-600 font-medium",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-4 px-3 py-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            asChild
          >
            <Link href="/auth">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
