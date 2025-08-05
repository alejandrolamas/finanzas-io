"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Goal,
  PlusCircle,
  Plus,
  TrendingUp,
  Repeat,
  Landmark,
  Wallet,
  Settings,
  LogOut,
  ArrowRightLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { AnimatePresence, motion } from "framer-motion"

// Main navigation items for the bottom bar
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/transactions/add", label: "Añadir", icon: PlusCircle, isCentral: true },
  { href: "/goals", label: "Objetivos", icon: Goal },
]

// Items for the speed dial menu
const speedDialItems = [
  { href: "/transfers", label: "Transferencias", icon: ArrowRightLeft },
  { href: "/debts", label: "Deudas", icon: CreditCard },
  { href: "/stats", label: "Estadísticas", icon: TrendingUp },
  { href: "/recurring", label: "Recurrentes", icon: Repeat },
  { href: "/config/accounts", label: "Cuentas", icon: Landmark },
  { href: "/config/categories", label: "Categorías", icon: Wallet },
  { href: "/config/settings", label: "Ajustes", icon: Settings },
  { action: "logout", label: "Cerrar sesión", icon: LogOut },
]

export function MobileNav({ isSetupComplete }: { isSetupComplete: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." })
    setIsMenuOpen(false)
    router.push("/login")
    router.refresh()
  }

  const handleSpeedDialClick = (item: (typeof speedDialItems)[0]) => {
    if (item.action === "logout") {
      handleLogout()
    } else if (item.href) {
      router.push(item.href)
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Menu */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3 md:hidden">
        <AnimatePresence>
          {isMenuOpen &&
            speedDialItems.map((item, index) => {
              const isAllowed = item.href?.startsWith("/config/") || item.action === "logout"
              const isDisabled = !isSetupComplete && !isAllowed

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 },
                  }}
                  exit={{
                    opacity: 0,
                    y: 50,
                    scale: 0.5,
                    transition: { duration: 0.15 },
                  }}
                  className="flex items-center gap-3"
                >
                  <span
                    className={cn(
                      "bg-card text-card-foreground rounded-md px-3 py-1.5 text-sm shadow-lg",
                      isDisabled && "opacity-50",
                    )}
                  >
                    {item.label}
                  </span>
                  <button
                    onClick={() => !isDisabled && handleSpeedDialClick(item)}
                    className={cn(
                      "bg-accent text-accent-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={isDisabled}
                  >
                    <item.icon className="h-6 w-6" />
                  </button>
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const isDisabled = item.isCentral ? !isSetupComplete : !isSetupComplete && item.href !== "/"
          const isActive = !isDisabled && (item.href === "/" ? pathname === item.href : pathname.startsWith(item.href))

          return (
            <Link
              key={item.label}
              href={isDisabled ? "#" : item.href}
              aria-disabled={isDisabled}
              onClick={(e) => {
                if (isDisabled) e.preventDefault()
              }}
              className={cn(
                item.isCentral
                  ? "flex-shrink-0 -mt-8 bg-accent text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  : "flex flex-col items-center justify-center w-full h-full text-muted-foreground",
                isActive && !item.isCentral && "text-accent",
                isDisabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <item.icon className={item.isCentral ? "h-8 w-8" : "h-6 w-6"} />
              {!item.isCentral && <span className="text-xs">{item.label}</span>}
            </Link>
          )
        })}
        {/* Speed Dial Trigger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground"
        >
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }}>
            <Plus className="h-6 w-6" />
          </motion.div>
          <span className={cn("text-xs", isMenuOpen && "text-accent")}>Más</span>
        </button>
      </div>
    </>
  )
}
