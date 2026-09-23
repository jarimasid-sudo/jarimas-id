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
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Building2, UserCheck, ShieldAlert } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Form states
  const [phone, setPhone] = useState("")
  const [nik, setNik] = useState("")
  const [groupType, setGroupType] = useState<string>("")
  const [groupName, setGroupName] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/login")
          return
        }

        setUserId(user.id)
      } catch {
        router.push("/login")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!userId) {
      router.push("/login")
      return
    }

    if (!groupType) {
      setErrorMsg("Silakan pilih jenis kelompok terlebih dahulu.")
      return
    }

    if (!groupName.trim()) {
      setErrorMsg("Nama kelompok / institusi tidak boleh kosong.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // 1. Buat entry baru di tabel groups
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: groupName.trim(),
          type: groupType,
        })
        .select("id")
        .single()

      if (groupError) {
        throw new Error(`Gagal membuat data kelompok: ${groupError.message}`)
      }

      if (!groupData?.id) {
        throw new Error("ID Kelompok tidak ditemukan setelah pembuatan.")
      }

      // 2. Masukkan user ke tabel group_members
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupData.id,
          user_id: userId,
          role: "admin",
        })

      if (memberError) {
        throw new Error(`Gagal mendaftarkan anggota kelompok: ${memberError.message}`)
      }

      // 3. Perbarui profil user di tabel profiles (onboarding_completed = true)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          phone: phone.trim(),
          nik: nik.trim(),
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        throw new Error(`Gagal memperbarui profil: ${profileError.message}`)
      }

      // 4. Redirect ke /dashboard setelah berhasil
      router.refresh()
      router.push("/dashboard")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg("Terjadi kesalahan sistem saat menyimpan data.")
      }
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Memeriksa sesi pengguna...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-muted/30">
      <div className="w-full max-w-lg">
        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
              <UserCheck className="h-4 w-4" />
              <span>Langkah Terakhir</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Lengkapi Data Onboarding
            </CardTitle>
            <CardDescription>
              Isi data identitas diri dan kelompok Anda untuk memulai menggunakan platform.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive">
                  <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Data Pribadi */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  Identitas Pengguna
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nik">NIK (16 Digit)</Label>
                    <Input
                      id="nik"
                      type="text"
                      placeholder="3201xxxxxxxxxxxx"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Data Kelompok */}
              <div className="space-y-3 pt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Informasi Kelompok / Instansi
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="groupType">Pilih Jenis Kelompok</Label>
                  <Select
                    value={groupType}
                    onValueChange={(val) => setGroupType(val ?? "")}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="groupType" className="w-full">
                      <SelectValue placeholder="Pilih Jenis Kelompok" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAUD_PNF">PAUD / PNF</SelectItem>
                      <SelectItem value="POSYANDU">Posyandu</SelectItem>
                      <SelectItem value="RT_RW">RT / RW</SelectItem>
                      <SelectItem value="DINAS_KECAMATAN">Dinas / Kecamatan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groupName">Nama Kelompok / Sekolah / Posyandu</Label>
                  <Input
                    id="groupName"
                    type="text"
                    placeholder="Contoh: Posyandu Melati 03 / PAUD Kasih Bunda"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  "Selesaikan & Masuk ke Dashboard"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
