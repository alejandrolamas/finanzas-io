import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { MobileNav } from "@/components/mobile-nav"
import { FloatingChatButton } from "@/components/floating-chat-button"
import { getCurrentUser } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finanzas Personales",
  description: "Tu app para gestionar tus finanzas personales.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
              <div className="w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 pb-20 md:pb-8">{children}</div>
            </SidebarInset>
            <MobileNav />
            <Toaster />
            {user && <FloatingChatButton />}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
