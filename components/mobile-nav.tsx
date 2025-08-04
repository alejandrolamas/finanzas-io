// components/mobile-nav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, CreditCard, Goal, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/transactions/add", label: "Añadir", icon: PlusCircle, isCentral: true },
  { href: "/debts", label: "Deudas", icon: CreditCard },
  { href: "/goals", label: "Objetivos", icon: Goal },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)
        if (item.isCentral) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex-shrink-0 -mt-8 bg-accent text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            >
              <item.icon className="h-8 w-8" />
            </Link>
          )
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-muted-foreground",
              isActive && "text-accent",
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
