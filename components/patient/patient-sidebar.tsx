"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { WalletDetails } from "@/components/wallet-details"
import {
  FileText,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type PatientView = "docs" | "appointments" | "audit"

interface PatientSidebarProps {
  activeView: PatientView
  onViewChange: (view: PatientView) => void
}

const navItems = [
  { key: "docs" as const, label: "Your Docs", icon: FileText },
  { key: "appointments" as const, label: "Your Appointments", icon: CalendarDays },
  { key: "audit" as const, label: "Audit & Logs", icon: ShieldCheck },
]

export function PatientSidebar({ activeView, onViewChange }: PatientSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">MedSync</span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            className={cn(
              "justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              activeView === item.key &&
              "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            )}
            onClick={() => onViewChange(item.key)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/50">
              {user?.email}
            </span>
          </div>
        </div>
        
        {/* Wallet Details Button */}
        <WalletDetails />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
