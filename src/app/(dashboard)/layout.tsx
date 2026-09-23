"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LogOut,
  Building2,
  Loader2,
  Users,
  Baby,
  BarChart3,
  Crown,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userFullName, setUserFullName] = useState<string | null>(null)
  const [groupName, setGroupName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("member")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/login")
          return
        }

        const email = user.email ?? null
        setUserEmail(email)
        setUserFullName(
          user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            email?.split("@")[0] ??
            "Pengguna"
        )

        // Cek profil pengguna
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, is_super_admin, onboarding_completed")
          .eq("id", user.id)
          .single()

        if (profile?.full_name) {
          setUserFullName(profile.full_name)
        }

        // Ambil data keanggotaan grup
        const { data: member } = await supabase
          .from("group_members")
          .select("groups(name, type), role")
          .eq("user_id", user.id)
          .limit(1)
          .single()

        let detectedRole = "member"
        if (member?.role) {
          detectedRole = member.role.toLowerCase()
        } else if (profile?.role) {
          detectedRole = profile.role.toLowerCase()
        }

        // Deteksi Super Admin (berdasarkan email primer, flag db, atau metadata role)
        const superAdminCheck =
          email === "kreasi.hambali@gmail.com" ||
          detectedRole === "super_admin" ||
          detectedRole === "superadmin" ||
          profile?.is_super_admin === true ||
          user.user_metadata?.role === "super_admin"

        if (superAdminCheck) {
          detectedRole = "super_admin"
          setIsSuperAdmin(true)
        }
        setUserRole(detectedRole)

        if (member?.groups) {
          const g = member.groups as unknown as { name?: string; type?: string }
          setGroupName(g.name ?? null)
        }
      } catch {
        // Fallback jika ada error
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
      router.push("/login")
    } catch {
      router.push("/login")
    }
  }

  // Render Badge Peran
  const renderRoleBadge = () => {
    if (isSuperAdmin || userRole === "super_admin") {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
          <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>SUPER ADMIN</span>
        </div>
      )
    }

    if (userRole === "admin") {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-500/30">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          <span>ADMIN KELOMPOK</span>
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
        <UserCheck className="h-3.5 w-3.5" />
        <span>KADER / ANGGOTA</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Memuat sesi dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold shadow-sm">
                J
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-bold text-base">Jarimas</span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Data Anak & Komunitas
                </span>
              </div>
            </Link>

            {/* Nav Menu */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/dashboard" || pathname.startsWith("/children")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Baby className="h-3.5 w-3.5" />
                <span>Data Anak</span>
              </Link>
              <Link
                href="/groups"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/groups")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Kelompok & Peran</span>
              </Link>
              <Link
                href="/reports"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/reports")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Rekapitulasi & Ekspor</span>
              </Link>
            </nav>

            {groupName && (
              <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{groupName}</span>
              </div>
            )}
          </div>

          {/* User Profile & Menu */}
          <div className="flex items-center gap-3">
            {/* Penanda Peran Visual di Header */}
            <div className="hidden md:flex items-center">
              {renderRoleBadge()}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-9 px-3 rounded-full text-xs font-medium border-border/80"
                  />
                }
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                  isSuperAdmin
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-primary/10 text-primary"
                }`}>
                  {isSuperAdmin ? "👑" : userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline-block max-w-[120px] truncate text-foreground font-medium">
                  {userFullName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold leading-none truncate">{userFullName}</p>
                      {isSuperAdmin && (
                        <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          SUPER ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Info Hak Akses di Dropdown */}
                <div className="px-2 py-1.5 text-xs text-muted-foreground bg-muted/40 rounded-sm mx-1 my-1">
                  <span className="block font-semibold text-foreground mb-0.5">Status Hak Akses:</span>
                  {isSuperAdmin ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      👑 Akses Penuh Seluruh Sistem & Seluruh Kelompok
                    </span>
                  ) : userRole === "admin" ? (
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      🛡️ Admin Kelompok ({groupName || "Semua"})
                    </span>
                  ) : (
                    <span>Kader / Anggota Penginput Data</span>
                  )}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/groups")} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Kelola Kelompok & Peran</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar Akun</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
