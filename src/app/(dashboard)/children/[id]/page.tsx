"use client"

import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HeartPulse,
  GraduationCap,
  Info,
  Loader2,
  MessageSquare,
  Send,
  User,
  XCircle,
  Activity,
  School,
} from "lucide-react"

export interface PosyanduHealthRecord {
  weight_kg?: string
  height_cm?: string
  head_circumference_cm?: string
  immunization_status?: string
  check_date?: string
  growth_notes?: string
  updated_at?: string
}

export interface SchoolEnrollmentRecord {
  is_enrolled?: string
  school_name?: string
  npsn?: string
  academic_year?: string
  education_notes?: string
  updated_at?: string
}

export interface ChildDetail {
  id: string
  nik: string
  full_name: string
  gender: "L" | "P" | string
  birth_date: string
  birth_place?: string
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | string
  group_id?: string
  created_at?: string
  posyandu_health_record?: PosyanduHealthRecord
  school_enrollment_record?: SchoolEnrollmentRecord
}

export interface CommentItem {
  id: string
  child_id: string
  content: string
  author_name?: string
  author_role?: string
  created_at: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ChildDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const childId = resolvedParams.id
  const router = useRouter()

  const [child, setChild] = useState<ChildDetail | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Tab 1 Comment input state
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Tab 2 Posyandu Form state
  const [weightKg, setWeightKg] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState("")
  const [immunizationStatus, setImmunizationStatus] = useState("LENGKAP")
  const [checkDate, setCheckDate] = useState("")
  const [growthNotes, setGrowthNotes] = useState("")
  const [isSavingPosyandu, setIsSavingPosyandu] = useState(false)
  const [posyanduSuccessMsg, setPosyanduSuccessMsg] = useState<string | null>(null)

  // Tab 3 School Form state
  const [isEnrolled, setIsEnrolled] = useState("YA")
  const [schoolName, setSchoolName] = useState("")
  const [npsn, setNpsn] = useState("")
  const [academicYear, setAcademicYear] = useState("2025/2026")
  const [educationNotes, setEducationNotes] = useState("")
  const [isSavingSchool, setIsSavingSchool] = useState(false)
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState<string | null>(null)

  // Fetch Child Detail & Comments
  useEffect(() => {
    let isMounted = true

    async function loadData() {
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

        if (isMounted) {
          setCurrentUser({
            id: user.id,
            name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              "Petugas",
          })
        }

        // Ambil data anak
        const { data: childData, error: childError } = await supabase
          .from("children_data")
          .select("*")
          .eq("id", childId)
          .single()

        if (childError || !childData) {
          router.push("/dashboard")
          return
        }

        if (isMounted) {
          setChild(childData as ChildDetail)

          // Isi state Form Posyandu jika sudah ada
          if (childData.posyandu_health_record) {
            const p = childData.posyandu_health_record as PosyanduHealthRecord
            setWeightKg(p.weight_kg ?? "")
            setHeightCm(p.height_cm ?? "")
            setHeadCircumferenceCm(p.head_circumference_cm ?? "")
            setImmunizationStatus(p.immunization_status ?? "LENGKAP")
            setCheckDate(p.check_date ?? "")
            setGrowthNotes(p.growth_notes ?? "")
          }

          // Isi state Form PAUD jika sudah ada
          if (childData.school_enrollment_record) {
            const s = childData.school_enrollment_record as SchoolEnrollmentRecord
            setIsEnrolled(s.is_enrolled ?? "YA")
            setSchoolName(s.school_name ?? "")
            setNpsn(s.npsn ?? "")
            setAcademicYear(s.academic_year ?? "2025/2026")
            setEducationNotes(s.education_notes ?? "")
          }
        }

        // Ambil riwayat komentar / catatan
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("child_id", childId)
          .order("created_at", { ascending: false })

        if (isMounted && commentsData) {
          setComments(commentsData as CommentItem[])
        }
      } catch (err) {
        console.error("Error loading child details:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [childId, router])

  // Hitung Usia
  const childBirthDate = child?.birth_date
  const calculatedAge = useMemo(() => {
    if (!childBirthDate) return "-"
    const birth = new Date(childBirthDate)
    const now = new Date()
    if (isNaN(birth.getTime())) return "-"

    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()

    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--
      months += 12
    }

    if (now.getDate() < birth.getDate()) {
      months--
      if (months < 0) {
        months += 12
        years--
      }
    }

    if (years <= 0 && months <= 0) return "Kurang dari 1 Bulan"
    if (years <= 0) return `${months} Bulan`
    if (months === 0) return `${years} Tahun`
    return `${years} Tahun ${months} Bulan`
  }, [childBirthDate])

  // Handler Kirim Komentar / Catatan
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setIsSubmittingComment(true)
    try {
      const supabase = createClient()
      const newEntry = {
        child_id: childId,
        content: newComment.trim(),
        author_name: currentUser.name,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("comments")
        .insert(newEntry)
        .select()
        .single()

      if (!error && data) {
        setComments((prev) => [data as CommentItem, ...prev])
        setNewComment("")
      }
    } catch (err) {
      console.error("Gagal mengirim catatan:", err)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handler Simpan Data Posyandu
  const handleSavePosyandu = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPosyandu(true)
    setPosyanduSuccessMsg(null)

    try {
      const supabase = createClient()
      const posyanduPayload: PosyanduHealthRecord = {
        weight_kg: weightKg,
        height_cm: heightCm,
        head_circumference_cm: headCircumferenceCm,
        immunization_status: immunizationStatus,
        check_date: checkDate || new Date().toISOString().split("T")[0],
        growth_notes: growthNotes.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("children_data")
        .update({
          posyandu_health_record: posyanduPayload,
        })
        .eq("id", childId)

      if (error) {
        throw new Error(error.message)
      }

      setChild((prev) =>
        prev ? { ...prev, posyandu_health_record: posyanduPayload } : prev
      )
      setPosyanduSuccessMsg("Data kesehatan posyandu berhasil disimpan!")
      setTimeout(() => setPosyanduSuccessMsg(null), 4000)
    } catch (err) {
      console.error("Gagal menyimpan data posyandu:", err)
    } finally {
      setIsSavingPosyandu(false)
    }
  }

  // Handler Simpan Data Sekolah PAUD
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSchool(true)
    setSchoolSuccessMsg(null)

    try {
      const supabase = createClient()
      const schoolPayload: SchoolEnrollmentRecord = {
        is_enrolled: isEnrolled,
        school_name: schoolName.trim(),
        npsn: npsn.trim(),
        academic_year: academicYear.trim(),
        education_notes: educationNotes.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("children_data")
        .update({
          school_enrollment_record: schoolPayload,
        })
        .eq("id", childId)

      if (error) {
        throw new Error(error.message)
      }

      setChild((prev) =>
        prev ? { ...prev, school_enrollment_record: schoolPayload } : prev
      )
      setSchoolSuccessMsg("Data integrasi PAUD/PNF berhasil diperbarui!")
      setTimeout(() => setSchoolSuccessMsg(null), 4000)
    } catch (err) {
      console.error("Gagal menyimpan data sekolah:", err)
    } finally {
      setIsSavingSchool(false)
    }
  }

  // Helper render status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            Terverifikasi
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-4 w-4" />
            Ditolak
          </span>
        )
      case "PENDING_VERIFICATION":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-4 w-4" />
            Pending Verifikasi
          </span>
        )
    }
  }

  // Format tanggal Indonesia
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading || !child) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Memuat detail profil anak...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Nav Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Header & Ringkasan Profil Anak */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold font-heading">
                {child.full_name?.charAt(0).toUpperCase() || "?"}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
                    {child.full_name}
                  </h1>
                  {renderStatusBadge(child.status)}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-mono">NIK: {child.nik}</span>
                  <span>•</span>
                  <span>
                    Gender:{" "}
                    <strong className="text-foreground font-medium">
                      {child.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Usia: <strong className="text-foreground font-medium">{calculatedAge}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
              <div className="text-center px-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  BB Terakhir
                </p>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {child.posyandu_health_record?.weight_kg
                    ? `${child.posyandu_health_record.weight_kg} kg`
                    : "-"}
                </p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="text-center px-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  TB Terakhir
                </p>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {child.posyandu_health_record?.height_cm
                    ? `${child.posyandu_health_record.height_cm} cm`
                    : "-"}
                </p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="text-center px-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status PAUD
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {child.school_enrollment_record?.is_enrolled === "YA" ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Aktif</span>
                  ) : (
                    <span className="text-muted-foreground">Belum</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Container */}
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl h-auto p-1 bg-muted/60">
          <TabsTrigger value="general" className="py-2 text-xs sm:text-sm font-medium">
            <Info className="h-4 w-4 mr-1.5 shrink-0" />
            Informasi & Catatan
          </TabsTrigger>
          <TabsTrigger value="posyandu" className="py-2 text-xs sm:text-sm font-medium">
            <HeartPulse className="h-4 w-4 mr-1.5 shrink-0" />
            Kesehatan Posyandu
          </TabsTrigger>
          <TabsTrigger value="school" className="py-2 text-xs sm:text-sm font-medium">
            <GraduationCap className="h-4 w-4 mr-1.5 shrink-0" />
            Integrasi PAUD/PNF
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Informasi Umum & Riwayat Verifikasi / Komentar */}
        <TabsContent value="general" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demographic Info Card */}
            <Card className="lg:col-span-1 border-border/60 shadow-sm h-fit">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Biodata Lengkap Anak
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Nama Lengkap</span>
                  <span className="font-medium text-foreground">{child.full_name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">NIK (16 Digit)</span>
                  <span className="font-mono text-foreground">{child.nik}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Jenis Kelamin</span>
                  <span className="font-medium text-foreground">
                    {child.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Tempat & Tanggal Lahir</span>
                  <span className="font-medium text-foreground">
                    {child.birth_place || "-"}, {formatDate(child.birth_date)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Usia Saat Ini</span>
                  <span className="font-medium text-foreground">{calculatedAge}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Tanggal Registrasi</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(child.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Comments & Cross-Sector Communication */}
            <Card className="lg:col-span-2 border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Catatan & Riwayat Verifikasi Antar-Sektor
                </CardTitle>
                <CardDescription className="text-xs">
                  Kolaborasi catatan antara Posyandu, PAUD/PNF, RT/RW, dan Dinas Kecamatan.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Form Tambah Catatan */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="comment" className="text-xs font-semibold">
                      Tulis Catatan / Temuan Baru
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Contoh: Perlu perhatian khusus pada asupan gizi seimbang dan imunisasi lanjutan..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      disabled={isSubmittingComment}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="text-xs"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Kirim Catatan
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* List of Comments */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Riwayat Catatan ({comments.length})
                  </h4>

                  {comments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                      Belum ada catatan atau intervensi tercatat untuk anak ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border/50 bg-muted/20 p-3.5 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {item.author_name || "Petugas Terkait"}
                            </span>
                            <span className="text-[11px]">{formatDate(item.created_at)}</span>
                          </div>
                          <p className="text-foreground/90 whitespace-pre-line text-sm">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Catatan Kesehatan Posyandu */}
        <TabsContent value="posyandu" className="space-y-6 outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Catatan Pertumbuhan & Kesehatan Posyandu
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pencatatan data antropometri berkala dan status imunisasi anak.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {posyanduSuccessMsg && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{posyanduSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePosyandu} className="space-y-6">
                {/* Antropometri Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-xs font-semibold">
                      Berat Badan (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 12.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      disabled={isSavingPosyandu}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-xs font-semibold">
                      Tinggi / Panjang Badan (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 88.0"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      disabled={isSavingPosyandu}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="headCircumference" className="text-xs font-semibold">
                      Lingkar Kepala (cm)
                    </Label>
                    <Input
                      id="headCircumference"
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 46.5"
                      value={headCircumferenceCm}
                      onChange={(e) => setHeadCircumferenceCm(e.target.value)}
                      disabled={isSavingPosyandu}
                    />
                  </div>
                </div>

                {/* Status Imunisasi & Tanggal Pemeriksaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="immunization" className="text-xs font-semibold">
                      Status Imunisasi
                    </Label>
                    <Select
                      value={immunizationStatus}
                      onValueChange={(val) => setImmunizationStatus(val ?? "LENGKAP")}
                      disabled={isSavingPosyandu}
                    >
                      <SelectTrigger id="immunization" className="w-full">
                        <SelectValue placeholder="Pilih status imunisasi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LENGKAP">Lengkap Sesuai Usia</SelectItem>
                        <SelectItem value="BELUM_LENGKAP">Belum Lengkap</SelectItem>
                        <SelectItem value="DASAR_SAJA">Imunisasi Dasar Saja</SelectItem>
                        <SelectItem value="TIDAK_ADA">Tidak Ada Riwayat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="checkDate" className="text-xs font-semibold">
                      Tanggal Penimbangan / Pemeriksaan
                    </Label>
                    <Input
                      id="checkDate"
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                      disabled={isSavingPosyandu}
                    />
                  </div>
                </div>

                {/* Catatan Gizi / Tumbuh Kembang */}
                <div className="space-y-1.5">
                  <Label htmlFor="growthNotes" className="text-xs font-semibold">
                    Catatan Perkembangan Gizi & Vitamin
                  </Label>
                  <Textarea
                    id="growthNotes"
                    placeholder="Contoh: Sudah menerima Vitamin A dan obat cacing bulan ini. Pertumbuhan dalam grafik hijau (normal)..."
                    value={growthNotes}
                    onChange={(e) => setGrowthNotes(e.target.value)}
                    rows={3}
                    disabled={isSavingPosyandu}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-border/40">
                  <Button type="submit" disabled={isSavingPosyandu}>
                    {isSavingPosyandu ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <HeartPulse className="mr-2 h-4 w-4" />
                        Simpan Catatan Posyandu
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Integrasi PAUD/PNF (Sekolah) */}
        <TabsContent value="school" className="space-y-6 outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Integrasi Data PAUD / PNF
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Informasi status pendaftaran dan partisipasi pendidikan anak usia dini.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {schoolSuccessMsg && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{schoolSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSchool} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Terdaftar */}
                  <div className="space-y-1.5">
                    <Label htmlFor="isEnrolled" className="text-xs font-semibold">
                      Status Partisipasi Pendidikan
                    </Label>
                    <Select
                      value={isEnrolled}
                      onValueChange={(val) => setIsEnrolled(val ?? "YA")}
                      disabled={isSavingSchool}
                    >
                      <SelectTrigger id="isEnrolled" className="w-full">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YA">Terdaftar / Aktif Bersekolah</SelectItem>
                        <SelectItem value="TIDAK">Belum Terdaftar di PAUD/PNF</SelectItem>
                        <SelectItem value="LULUS">Lulus / Masuk SD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tahun Ajaran */}
                  <div className="space-y-1.5">
                    <Label htmlFor="academicYear" className="text-xs font-semibold">
                      Tahun Ajaran / Rombel
                    </Label>
                    <Input
                      id="academicYear"
                      type="text"
                      placeholder="Contoh: 2025/2026 - Kelompok A"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      disabled={isSavingSchool}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Satuan PAUD/PNF */}
                  <div className="space-y-1.5">
                    <Label htmlFor="schoolName" className="text-xs font-semibold">
                      Nama Satuan PAUD / PNF
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Contoh: PAUD Kasih Bunda / KB Melati Indah"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      disabled={isSavingSchool}
                    />
                  </div>

                  {/* NPSN */}
                  <div className="space-y-1.5">
                    <Label htmlFor="npsn" className="text-xs font-semibold">
                      NPSN (Nomor Pokok Sekolah Nasional)
                    </Label>
                    <Input
                      id="npsn"
                      type="text"
                      placeholder="Contoh: 69871234"
                      value={npsn}
                      onChange={(e) => setNpsn(e.target.value)}
                      disabled={isSavingSchool}
                    />
                  </div>
                </div>

                {/* Catatan Pendidikan */}
                <div className="space-y-1.5">
                  <Label htmlFor="educationNotes" className="text-xs font-semibold">
                    Catatan Perkembangan Pembelajaran / Karakter
                  </Label>
                  <Textarea
                    id="educationNotes"
                    placeholder="Contoh: Kehadiran aktif 90%. Perkembangan motorik halus dan sosialisasi dengan teman sebaya sangat baik..."
                    value={educationNotes}
                    onChange={(e) => setEducationNotes(e.target.value)}
                    rows={3}
                    disabled={isSavingSchool}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-border/40">
                  <Button type="submit" disabled={isSavingSchool}>
                    {isSavingSchool ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Simpan Data PAUD/PNF
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
