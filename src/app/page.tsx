import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Heart,
  Smile,
  Users,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Building2,
  HeartPulse,
  TrendingUp,
  CheckCircle2,
  Sparkle,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-900 dark:selection:text-teal-100">
      {/* GLOW MESH GRADIENT & BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Glow Mesh Gradient Orbs */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-linear-to-br from-teal-500/20 via-emerald-500/15 to-transparent blur-[140px]" />
        <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-linear-to-bl from-amber-500/20 via-rose-500/15 to-transparent blur-[150px]" />
        <div className="absolute top-2/3 left-1/3 w-[650px] h-[650px] rounded-full bg-linear-to-tr from-indigo-500/20 via-cyan-500/15 to-transparent blur-[160px]" />

        {/* Pola Titik / Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15" />
      </div>

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo with Glowing Gradient Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-500 via-emerald-500 to-amber-500 text-white font-black text-xl shadow-md shadow-teal-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                J
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl sm:text-2xl tracking-tight">
                  jarimas
                  <span className="bg-linear-to-r from-teal-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                    .id
                  </span>
                </span>
              </div>
            </Link>

            {/* Glowing Gradient Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-teal-500/15 via-emerald-500/15 to-amber-500/15 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-xs backdrop-blur-xs">
              <Sparkle className="h-3 w-3 text-amber-500 animate-spin-slow" />
              <span>Jaringan Informasi Masyarakat Indonesia</span>
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 hover:border-teal-500/60 hover:bg-teal-500/10 text-foreground font-semibold px-4 rounded-xl transition-all"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Masuk
            </Button>

            <Button
              size="sm"
              className="bg-linear-to-r from-teal-500 via-emerald-500 to-amber-500 hover:from-teal-600 hover:via-emerald-600 hover:to-amber-600 text-white font-bold px-4.5 rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* HERO SECTION (Dynamic & Eye-Catching) */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
            {/* Badge Pill Melayang Warna-Warni */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-linear-to-r from-teal-500/10 via-amber-500/15 to-rose-500/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 backdrop-blur-md animate-bounce-subtle">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>✨ Menyambut Masa Keemasan Indonesia 2045</span>
            </div>

            {/* Slogan / Headline Utama with Big Gradient Text */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-heading tracking-tight leading-[1.12] uppercase">
                <span className="text-foreground">“KETIKA JARI BERKATA, </span>
                <span className="bg-linear-to-r from-teal-500 via-indigo-500 to-rose-500 dark:from-teal-400 dark:via-sky-400 dark:to-rose-400 bg-clip-text text-transparent drop-shadow-xs">
                  JARINGAN TERCIPTA
                </span>
                <span className="text-foreground">”</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
                Platform Sinergi Integrasi Data Posyandu, PAUD/PNF, RT/RW, dan Pemerintah Kota Tegal
              </p>
            </div>

            {/* Blok Narasi Filosofis di dalam Kartu Glassmorphism */}
            <div className="relative mx-auto max-w-3xl">
              {/* Glowing Gradient Ring */}
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-teal-500 via-amber-500 to-indigo-500 opacity-40 blur-lg transition duration-500 group-hover:opacity-70" />

              <div className="relative rounded-2xl border border-white/40 dark:border-white/10 bg-card/75 dark:bg-card/85 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-4 text-left">
                {/* Decorative Pill Header */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span>Filosofi Gerakan jarimas.id</span>
                </div>

                {/* Paragraph 1 */}
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                  Jari memiliki peran yang sangat penting sebagai salah satu alat komunikasi bagi
                  manusia. Jari digunakan untuk berbicara dalam bahasa isyarat. Jari melahirkan
                  kata-kata ketika menari di atas tombol mesin ketik, keyboard komputer dan layar
                  sentuh telepon genggam.
                </p>

                {/* Paragraph 2 (Highlighted Quote) */}
                <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 p-4 my-2">
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground italic leading-relaxed">
                    “Apa yang tidak bisa diutarakan oleh lisan, terkadang berhasil disuarakan dengan
                    indah dan melahirkan ikatan yang kuat lewat tarian jari-jari tangan.”
                  </p>
                </div>

                {/* Paragraph 3 */}
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                  <strong className="font-bold text-foreground">jarimas.id</strong> berharap bisa
                  menjadi salah satu media penting yang digunakan oleh masyarakat dalam menyongsong
                  masa keemasan Indonesia.
                </p>
              </div>
            </div>

            {/* Tombol CTA Utama */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="h-13 px-8 text-base font-bold bg-linear-to-r from-teal-500 via-emerald-500 to-amber-500 hover:from-teal-600 hover:via-emerald-600 hover:to-amber-600 text-white rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 gap-2.5 border-none"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                <span>Bergabung Bersama Kami</span>
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-13 px-8 text-base font-bold rounded-2xl border-2 border-indigo-500/40 hover:border-indigo-500/80 hover:bg-indigo-500/10 shadow-md backdrop-blur-md transition-all duration-300"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Portal Masuk
              </Button>
            </div>
          </div>
        </section>

        {/* KARTU SEKTOR WARNA-WARNI (Color-Coded Cards Grid) */}
        <section className="py-16 sm:py-24 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-rose-500/10 via-amber-500/10 to-cyan-500/10 px-3.5 py-1 text-xs font-bold text-foreground border border-border/80">
                <Smile className="h-3.5 w-3.5 text-teal-500" />
                <span>Empat Pilar Kolaborasi Terpadu</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
                Sinergi Lintas Sektor Kota Tegal
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ekosistem terintegrasi yang memberdayakan setiap elemen masyarakat untuk perlindungan dan masa depan anak.
              </p>
            </div>

            {/* 4 Color-Coded Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CARD 1: Pink / Rose Card (Posyandu) */}
              <Card className="group relative overflow-hidden rounded-3xl border-2 border-rose-500/30 hover:border-rose-500 bg-linear-to-b from-rose-500/10 via-rose-500/5 to-card backdrop-blur-md shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform">
                      <HeartPulse className="h-7 w-7" />
                    </div>
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                      Posyandu
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      Layanan Kesehatan & Tumbuh Kembang
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Pencatatan antropometri (BB, TB, Lingkar Kepala), deteksi dini stunting, serta buku imunisasi digital anak secara real-time.
                    </p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Monitoring Antropometri</span>
                  </div>
                </div>
              </Card>

              {/* CARD 2: Amber / Kuning Card (PAUD/PNF) */}
              <Card className="group relative overflow-hidden rounded-3xl border-2 border-amber-500/30 hover:border-amber-500 bg-linear-to-b from-amber-500/10 via-amber-500/5 to-card backdrop-blur-md shadow-lg shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                      PAUD / PNF
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Pendataan Pendidikan Usia Dini
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Pelacakan partisipasi sekolah anak usia dini, verifikasi identitas NPSN satuan pendidikan, dan kesiapan transisi PAUD ke SD.
                    </p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verifikasi Satuan NPSN</span>
                  </div>
                </div>
              </Card>

              {/* CARD 3: Hijau / Emerald Card (RT/RW) */}
              <Card className="group relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-card backdrop-blur-md shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7" />
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      RT / RW
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Validasi Swadaya & Komunitas Warga
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Validasi kependudukan dan konfirmasi domisili riil anak tingkat akar rumput untuk memastikan tidak ada anak yang terlewatkan.
                    </p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Konfirmasi Domisili Riil</span>
                  </div>
                </div>
              </Card>

              {/* CARD 4: Biru / Cyan Card (Kecamatan/Kelurahan) */}
              <Card className="group relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 hover:border-cyan-500 bg-linear-to-b from-cyan-500/10 via-cyan-500/5 to-card backdrop-blur-md shadow-lg shadow-cyan-500/5 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-md shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                      Pemerintah
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      Integrasi Layanan Publik Kota Tegal
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Sinergi kebijakan tingkat Kecamatan & Kelurahan berbasis data agregat lintas sektor untuk tata kelola pemerintahan presisi.
                    </p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Tata Kelola Kebijakan Presisi</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-card/60 backdrop-blur-md py-10 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-bold text-sm text-foreground">
              jarimas<span className="text-teal-500">.id</span>
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-muted-foreground">Kota Tegal, Jawa Tengah</span>
          </div>

          <p className="font-semibold text-foreground text-xs sm:text-sm">
            Hak cipta © 2026 <span className="text-teal-600 dark:text-teal-400 font-bold">jarimas.id</span> - Menyongsong Masa Keemasan Indonesia.
          </p>

          <p className="text-[11px] text-muted-foreground/75 max-w-xl mx-auto">
            Jaringan Informasi Masyarakat Indonesia • Sinergi Posyandu, PAUD/PNF, RT/RW, dan Pemerintah Kota Tegal menyambut Generasi Emas 2045.
          </p>
        </div>
      </footer>
    </div>
  )
}
