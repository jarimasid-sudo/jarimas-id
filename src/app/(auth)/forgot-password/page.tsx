"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, Mail, Info } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [mode, setMode] = useState<"reset" | "resend_confirmation">("reset")
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string; isRateLimit?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatusMsg(null)
    setIsLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setStatusMsg({ type: "error", text: "Silakan masukkan alamat email yang valid." })
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          const msg = error.message.toLowerCase()
          const isRateLimit = msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")
          setStatusMsg({
            type: "error",
            text: isRateLimit
              ? "Batas pengiriman email Supabase tercapai (Email rate limit exceeded). Supabase membatasi jumlah email per jam. Silakan tunggu beberapa saat atau hubungi administrator untuk mengubah password via Supabase Dashboard."
              : error.message,
            isRateLimit,
          })
        } else {
          setStatusMsg({
            type: "success",
            text: `Tautan reset kata sandi telah dikirim ke ${cleanEmail}. Silakan periksa kotak masuk atau spam email Anda.`,
          })
        }
      } else {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          const msg = error.message.toLowerCase()
          const isRateLimit = msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")
          setStatusMsg({
            type: "error",
            text: isRateLimit
              ? "Batas pengiriman email Supabase tercapai (Email rate limit exceeded). Silakan konfirmasi akun langsung melalui Supabase Dashboard (Auth > Users > Confirm Email)."
              : error.message,
            isRateLimit,
          })
        } else {
          setStatusMsg({
            type: "success",
            text: `Email konfirmasi aktivasi akun telah dikirim ulang ke ${cleanEmail}. Silakan periksa kotak masuk atau spam email Anda.`,
          })
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        const isRateLimit = msg.includes("rate limit")
        setStatusMsg({
          type: "error",
          text: isRateLimit
            ? "Batas pengiriman email Supabase tercapai. Silakan coba kembali beberapa saat lagi."
            : err.message,
          isRateLimit,
        })
      } else {
        setStatusMsg({
          type: "error",
          text: "Terjadi kesalahan yang tidak terduga. Silakan coba beberapa saat lagi.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === "reset" ? "Pemulihan Kata Sandi" : "Kirim Ulang Aktivasi Email"}
        </CardTitle>
        <CardDescription>
          {mode === "reset"
            ? "Masukkan email Anda untuk menerima tautan pembuatan kata sandi baru"
            : "Kirim ulang email konfirmasi pendaftaran akun Anda"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("reset")
                setStatusMsg(null)
              }}
              className={`rounded-md py-1.5 transition-all ${
                mode === "reset"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reset Kata Sandi
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("resend_confirmation")
                setStatusMsg(null)
              }}
              className={`rounded-md py-1.5 transition-all ${
                mode === "resend_confirmation"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Konfirmasi Email
            </button>
          </div>

          {statusMsg && (
            <div
              className={`space-y-2 rounded-lg border p-3.5 text-sm ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-destructive/15 border-destructive/30 text-destructive"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                )}
                <span>{statusMsg.text}</span>
              </div>

              {statusMsg.isRateLimit && (
                <div className="pt-2 border-t border-destructive/20 text-xs text-foreground/90 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" /> Tips Mengatasi:
                  </p>
                  <p>
                    Anda dapat langsung mengonfirmasi email atau mereset kata sandi akun di <strong>Supabase Dashboard &gt; Authentication &gt; Users &gt; [User] &gt; Confirm Email / Send Recovery</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Terdaftar</Label>
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

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses Permintaan...
              </>
            ) : mode === "reset" ? (
              "Kirim Tautan Reset Password"
            ) : (
              "Kirim Ulang Email Konfirmasi"
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 justify-center border-t py-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Halaman Masuk
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
