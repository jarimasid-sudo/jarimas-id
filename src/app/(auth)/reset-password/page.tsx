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
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatusMsg(null)

    if (password.length < 6) {
      setStatusMsg({ type: "error", text: "Password minimal harus 6 karakter." })
      return
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: "error", text: "Konfirmasi password tidak cocok." })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setStatusMsg({ type: "error", text: error.message })
        setIsLoading(false)
        return
      }

      setStatusMsg({
        type: "success",
        text: "Kata sandi Anda berhasil diperbarui! Mengalihkan ke dashboard...",
      })

      setTimeout(() => {
        router.refresh()
        router.push("/dashboard")
      }, 2000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMsg({ type: "error", text: err.message })
      } else {
        setStatusMsg({
          type: "error",
          text: "Terjadi kesalahan saat memperbarui kata sandi.",
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Perbarui Kata Sandi
        </CardTitle>
        <CardDescription>
          Masukkan kata sandi baru untuk akun Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {statusMsg && (
            <div
              className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-destructive/15 border-destructive/30 text-destructive"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi Baru</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Kata Sandi Baru"
            )}
          </Button>
        </CardContent>

        <CardFooter className="justify-center border-t py-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Batal & Kembali ke Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
