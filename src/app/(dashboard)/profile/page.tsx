"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  User,
  Phone,
  CreditCard,
  Building2,
  Crown,
  ShieldCheck,
  UserCheck,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [nik, setNik] = useState<string>("")
  const [groupName, setGroupName] = useState<string>("")
  const [groupType, setGroupType] = useState<string>("")
  const [role, setRole] = useState<string>("member")
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)

  // Password state
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false)
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUserData() {
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

        if (!isMounted) return
        setUserId(user.id)
        setEmail(user.email ?? "")

        const userEmail = user.email ?? ""
        const isSuper =
          userEmail === "kreasi.hambali@gmail.com" ||
          user.user_metadata?.role === "super_admin"

        setIsSuperAdmin(isSuper)

        // 1. Ambil data dari tabel profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile && isMounted) {
          setFullName(profile.full_name || user.user_metadata?.full_name || "")
          setPhone(profile.phone || "")
          setNik(profile.nik || "")
          if (profile.role) setRole(profile.role)
          if (profile.is_super_admin) setIsSuperAdmin(true)
        } else if (isMounted) {
          setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "")
        }

        // 2. Ambil data kelompok & peran dari group_members
        const { data: member } = await supabase
          .from("group_members")
          .select("role, groups(name, type)")
          .eq("user_id", user.id)
          .limit(1)
          .single()

        if (member && isMounted) {
          if (member.role) setRole(member.role)
          if (member.groups) {
            const g = member.groups as unknown as { name?: string; type?: string }
            setGroupName(g.name || "")
            setGroupType(g.type || "")
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUserData()

    return () => {
      isMounted = false
    }
  }, [router])

  // Handler Simpan Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setProfileMessage(null)
    setIsSavingProfile(true)

    try {
      const supabase = createClient()

      // Update profil di tabel profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          phone: phone.trim(),
          nik: nik.trim(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw new Error(profileError.message)

      // Update auth metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
        },
      })

      setProfileMessage({
        type: "success",
        text: "Data profil Anda berhasil diperbarui!",
      })
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileMessage({ type: "error", text: err.message })
      } else {
        setProfileMessage({
          type: "error",
          text: "Gagal menyimpan perubahan profil.",
        })
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handler Ganti Kata Sandi
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Kata sandi baru minimal harus 6 karakter.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Konfirmasi kata sandi tidak cocok.",
      })
      return
    }

    setIsSavingPassword(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw new Error(error.message)

      setPasswordMessage({
        type: "success",
        text: "Kata sandi berhasil diperbarui dengan aman!",
      })
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordMessage({ type: "error", text: err.message })
      } else {
        setPasswordMessage({
          type: "error",
          text: "Gagal memperbarui kata sandi.",
        })
      }
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Memuat data pengaturan profil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          Pengaturan Profil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola data pribadi, informasi akun, instansi, dan keamanan kata sandi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Kartu Identitas & Status Hak Akses */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm text-center overflow-hidden">
            <div className="h-20 bg-linear-to-r from-teal-500/20 via-emerald-500/20 to-amber-500/20" />
            <CardContent className="pt-0 -mt-10 pb-6 flex flex-col items-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black border-4 border-background shadow-md ${
                isSuperAdmin
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}>
                {isSuperAdmin ? "👑" : fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </div>

              <h2 className="text-lg font-bold mt-3 text-foreground">{fullName || "Pengguna"}</h2>
              <p className="text-xs text-muted-foreground font-mono">{email}</p>

              {/* Badge Peran */}
              <div className="mt-3">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    SUPER ADMIN
                  </span>
                ) : role === "admin" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                    ADMIN KELOMPOK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                    <UserCheck className="h-3.5 w-3.5" />
                    KADER / PETUGAS
                  </span>
                )}
              </div>
            </CardContent>

            {/* Info Kelompok / Instansi */}
            <div className="border-t border-border/50 bg-muted/30 p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" />
                <span>Instansi Terdaftar</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {groupName || "Belum terikat kelompok"}
              </p>
              {groupType && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Tipe: {groupType}
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Form Edit Profil & Ganti Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Form Informasi Pribadi */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-xs">
                Perbarui nama lengkap, nomor telepon, dan nomor induk kependudukan Anda.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                {profileMessage && (
                  <div
                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs sm:text-sm ${
                      profileMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-destructive/15 border-destructive/30 text-destructive"
                    }`}
                  >
                    {profileMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Alamat Email (Tidak dapat diubah langsung)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Contoh: Ali Hambali Hidayat"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSavingProfile}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Nomor Telepon / WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSavingProfile}
                      className="text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nik" className="text-xs font-semibold flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      NIK (16 Digit)
                    </Label>
                    <Input
                      id="nik"
                      type="text"
                      placeholder="3201xxxxxxxxxxxx"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                      disabled={isSavingProfile}
                      className="text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/50 py-3 flex justify-end">
                <Button type="submit" size="sm" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      Simpan Perubahan Profil
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Form Keamanan Kata Sandi */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Keamanan & Ganti Kata Sandi
              </CardTitle>
              <CardDescription className="text-xs">
                Ubah kata sandi akun Anda untuk menjaga keamanan akses dashboard.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                {passwordMessage && (
                  <div
                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs sm:text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-destructive/15 border-destructive/30 text-destructive"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-semibold">
                      Kata Sandi Baru
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isSavingPassword}
                        className="pr-10 text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-0 h-full px-3 py-1 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                      Konfirmasi Kata Sandi Baru
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSavingPassword}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/50 py-3 flex justify-end">
                <Button type="submit" size="sm" variant="outline" disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1.5 h-4 w-4" />
                      Perbarui Kata Sandi
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
