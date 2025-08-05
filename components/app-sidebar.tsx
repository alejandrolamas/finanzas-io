"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Landmark,
  TrendingUp,
  Settings,
  CreditCard,
  Goal,
  Repeat,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "./ui/use-toast"
import type { UserSession } from "@/lib/auth"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/debts", label: "Deudas", icon: CreditCard },
  { href: "/goals", label: "Objetivos", icon: Goal },
  { href: "/recurring", label: "Recurrentes", icon: Repeat },
  { href: "/stats", label: "Estadísticas", icon: TrendingUp },
]

const configItems = [
  { href: "/config/accounts", label: "Cuentas", icon: Landmark },
  { href: "/config/categories", label: "Categorías", icon: Wallet },
  { href: "/config/settings", label: "Ajustes", icon: Settings },
]

export function AppSidebar({ user, isSetupComplete }: { user: UserSession | null; isSetupComplete: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." })
    router.push("/login")
    router.refresh()
  }

  const userInitials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-semibold">Finanzas.io</h1>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <SidebarMenu>
            {navItems.map((item) => {
              const isDisabled = !isSetupComplete && item.href !== "/"
              const isActive =
                item.href === "/" ? pathname === item.href : isSetupComplete && pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="group-data-[collapsible=icon]:justify-center"
                    tooltip={item.label}
                    disabled={isDisabled}
                  >
                    <Link href={isDisabled ? "#" : item.href} aria-disabled={isDisabled}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
          <SidebarMenu className="mt-4">
            <p className="text-xs text-muted-foreground px-4 py-2 group-data-[collapsible=icon]:hidden">
              Configuración
            </p>
            {configItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  className="group-data-[collapsible=icon]:justify-center"
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.username}.png`} alt={user?.username} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="group-data-[collapsible=icon]:hidden capitalize">{user?.username || "Usuario"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="group-data-[collapsible=icon]:justify-center"
              tooltip="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
