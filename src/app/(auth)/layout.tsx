import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autentikasi | Jarimas",
  description: "Masuk atau daftar akun Jarimas",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-muted/30">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
