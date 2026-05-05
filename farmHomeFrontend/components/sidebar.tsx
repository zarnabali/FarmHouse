"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Heart,
  Syringe,
  Baby,
  Wrench,
  AlertTriangle,
  BarChart3,
  FileText,
  Bell,
  Smartphone,
  Search,
  Settings,
  LogOut,
  Package,
  OctagonAlert,
  ChevronDown,
  PackageOpen,
  ChevronRight,
  House,
  Sparkles, // <-- Add Sparkles icon for recommendation
  MessageSquare,
} from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { LanguageSelector } from "@/components/language-selector"

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "animals", href: "/animals", icon: Users },
  { name: "health", href: "/health", icon: Heart },
  { name: "vaccinations", href: "/vaccinations", icon: Syringe },
  { name: "breeding", href: "/breeding", icon: Baby },
  { name: "breeding-recommendation", href: "/breeding/recommendation", icon: Sparkles }, // <-- Add this line
  { name: "maintenance", href: "/maintenance", icon: Wrench },
  { name: "incidents", href: "/incidents", icon: AlertTriangle },
  { name: "farmhouse", href: "/farmhouse", icon: House },
  // Add Farmhouse Users for admin only
  { name: "farmhouse-users", href: "/farmhouse-users", icon: Users, adminOnly: true },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: OctagonAlert,
  },
  {
    name: "orders",
    href: "/orders",
    icon: PackageOpen,
  },
  {
    name: "quotes",
    href: "/quotes",
    icon: MessageSquare,
    superAdminOnly: true,
  },
]

const milestone2Navigation = [
  { name: "analytics", href: "/analytics", icon: BarChart3, badge: "New" },
  { name: "reports", href: "/reports", icon: FileText, badge: "New" },
  { name: "notifications", href: "/notifications", icon: Bell, badge: "New" },
  { name: "mobile", href: "/mobile", icon: Smartphone, badge: "New" },
]

const adminNavigation = [
  { name: "users", href: "/users", icon: Users },
  { name: "settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('Sidebar')
  const [milestone2Expanded, setMilestone2Expanded] = useState(true)
  const [adminExpanded, setAdminExpanded] = useState(false)

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 justify-between">
        <h1 className="text-xl font-bold text-gray-900">Farm Home</h1>
        <div className="ml-2">
          <LanguageSelector />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {/* Core Features */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Core Features</div>
            {navigation.map((item) => {
              if (item.superAdminOnly && typeof window !== 'undefined' && localStorage.getItem('role') !== 'super_admin') return null;
              if (item.adminOnly && typeof window !== 'undefined' && localStorage.getItem('role') !== 'admin') return null;
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", isActive && "bg-blue-50 text-blue-700 border-blue-200")}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {t(`${item.name}`)}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Milestone 2 Features */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              onClick={() => setMilestone2Expanded(!milestone2Expanded)}
            >
              <span>Advanced Features</span>
              {milestone2Expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            {milestone2Expanded && (
              <div className="space-y-1 pl-2">
                {milestone2Navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn("w-full justify-start", isActive && "bg-blue-50 text-blue-700 border-blue-200")}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <span className="flex-1 text-left">{t(`${item.name}`)}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}

                {/* Advanced Search */}
                <div className="px-3 py-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Search className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{t("advancedSearch")}</span>
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Search across all modules with complex filters</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Search className="h-3 w-3 mr-2" />
                      Open Search
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Features */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              onClick={() => setAdminExpanded(!adminExpanded)}
            >
              <span>Administration</span>
              {adminExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            {adminExpanded && (
              <div className="space-y-1 pl-2">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn("w-full justify-start", isActive && "bg-blue-50 text-blue-700 border-blue-200")}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {t(`${item.name}`)}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
            <p className="text-xs text-gray-500 truncate">Farm Administrator</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="mr-3 h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  )
}
