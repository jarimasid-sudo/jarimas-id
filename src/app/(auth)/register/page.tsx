"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessInfo(null)
    setIsLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrorMsg(error.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Jika Supabase membutuhkan konfirmasi email (session masih null)
        if (!data.session && data.user.identities && data.user.identities.length > 0) {
          setSuccessInfo(
            `Pendaftaran berhasil! Email konfirmasi telah dikirim ke ${cleanEmail}. Silakan periksa kotak masuk/spam Anda untuk mengonfirmasi email sebelum masuk.`
          )
          setIsLoading(false)
          return
        }

        router.refresh()
        router.push("/onboarding")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
      }
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Buat Akun Baru
        </CardTitle>
        <CardDescription>
          Daftarkan diri Anda untuk mulai menggunakan Jarimas
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold mb-1">Verifikasi Email Diperlukan</p>
                <p>{successInfo}</p>
                <div className="mt-3">
                  <Link
                    href="/login"
                    className="font-medium underline underline-offset-2 hover:opacity-80"
                  >
                    Menuju ke Halaman Masuk &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!successInfo && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 h-full px-3 py-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t py-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
