"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Loader2, Eye, EyeOff, AlertCircle, HelpCircle } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [infoMsg, setInfoMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCredentialError, setIsCredentialError] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "auth_callback_failed") {
      setErrorMsg("Tautan verifikasi telah kedaluwarsa atau tidak valid. Silakan minta tautan baru.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setInfoMsg(null)
    setIsCredentialError(false)
    setIsLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid grant")
        ) {
          setIsCredentialError(true)
          setErrorMsg(
            "Email atau password salah. Jika Anda baru mendaftar atau belum memverifikasi email, pastikan email telah dikonfirmasi atau lakukan reset kata sandi."
          )
        } else {
          setErrorMsg(error.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        router.refresh()
        router.push("/dashboard")
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
          Selamat Datang Kembali
        </CardTitle>
        <CardDescription>
          Masukkan email dan password untuk masuk ke akun Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {infoMsg && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              {infoMsg}
            </div>
          )}

          {errorMsg && (
            <div className="space-y-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {isCredentialError && (
                <div className="pt-2 border-t border-destructive/20 text-xs flex flex-wrap gap-2 items-center">
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(email)}`}
                    className="font-semibold underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Lupa Password / Kirim Ulang Email Konfirmasi?
                  </Link>
                </div>
              )}
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
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
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </CardContent>

        <CardFooter className="justify-center border-t py-4 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full shadow-sm p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
