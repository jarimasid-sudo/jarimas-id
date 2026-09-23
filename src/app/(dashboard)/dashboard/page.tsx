"use client"

import { useState, useEffect, useMemo } from "react"
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  RotateCcw,
  Loader2,
  UserPlus,
  FileText,
  Eye,
} from "lucide-react"

export interface ChildData {
  id: string
  nik: string
  full_name: string
  gender: "L" | "P" | string
  birth_date: string
  birth_place?: string
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | string
  group_id?: string
  created_at?: string
  created_by?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [childrenList, setChildrenList] = useState<ChildData[]>([])
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal Tambah Anak states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form Fields
  const [nik, setNik] = useState("")
  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState<string>("L")
  const [birthDate, setBirthDate] = useState("")
  const [birthPlace, setBirthPlace] = useState("")

  // Fetch data awal saat komponen dimount
  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
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
        setCurrentUserId(user.id)

        // Cek apakah onboarding sudah selesai
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single()

        if (profile && profile.onboarding_completed === false) {
          router.push("/onboarding")
          return
        }

        // Ambil grup user
        const { data: memberData } = await supabase
          .from("group_members")
          .select("group_id, role")
          .eq("user_id", user.id)
          .limit(1)
          .single()

        if (memberData && isMounted) {
          setCurrentGroupId(memberData.group_id)
        }

        // Ambil data anak
        const { data: children, error: childrenError } = await supabase
          .from("children_data")
          .select("*")
          .order("created_at", { ascending: false })

        if (!childrenError && children && isMounted) {
          setChildrenList(children as ChildData[])
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [router])

  // Ringkasan Statistik
  const stats = useMemo(() => {
    const total = childrenList.length
    const pending = childrenList.filter(
      (c) => c.status === "PENDING_VERIFICATION" || !c.status
    ).length
    const verified = childrenList.filter((c) => c.status === "VERIFIED").length
    const rejected = childrenList.filter((c) => c.status === "REJECTED").length

    return { total, pending, verified, rejected }
  }, [childrenList])

  // Filtered list
  const filteredChildren = useMemo(() => {
    return childrenList.filter((child) => {
      const matchSearch =
        child.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.nik?.includes(searchQuery) ||
        child.birth_place?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PENDING_VERIFICATION"
          ? child.status === "PENDING_VERIFICATION" || !child.status
          : child.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [childrenList, searchQuery, statusFilter])

  // Handler Submit Tambah Data Anak
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (nik.length !== 16) {
      setErrorMessage("NIK harus tepat 16 digit.")
      return
    }

    if (!fullName.trim() || !birthDate || !birthPlace.trim()) {
      setErrorMessage("Semua kolom formulir wajib diisi.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const newRecord = {
        nik: nik.trim(),
        full_name: fullName.trim(),
        gender,
        birth_date: birthDate,
        birth_place: birthPlace.trim(),
        status: "PENDING_VERIFICATION",
        group_id: currentGroupId || null,
        created_by: currentUserId || null,
      }

      const { data, error } = await supabase
        .from("children_data")
        .insert(newRecord)
        .select()
        .single()

      if (error) {
        throw new Error(`Gagal menambahkan data anak: ${error.message}`)
      }

      if (data) {
        setChildrenList((prev) => [data as ChildData, ...prev])
      }

      // Reset form & close modal
      setNik("")
      setFullName("")
      setGender("L")
      setBirthDate("")
      setBirthPlace("")
      setIsAddModalOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Terjadi kesalahan saat menyimpan data anak.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler Ubah Status Verifikasi
  const handleUpdateStatus = async (
    childId: string,
    newStatus: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED"
  ) => {
    setActionLoadingId(childId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("children_data")
        .update({ status: newStatus })
        .eq("id", childId)

      if (error) {
        throw new Error(error.message)
      }

      setChildrenList((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, status: newStatus } : c))
      )
    } catch (err) {
      console.error("Gagal memperbarui status:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handler Hapus Data Anak
  const handleDeleteChild = async (childId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data anak ini?")) return

    setActionLoadingId(childId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("children_data")
        .delete()
        .eq("id", childId)

      if (error) {
        throw new Error(error.message)
      }

      setChildrenList((prev) => prev.filter((c) => c.id !== childId))
    } catch (err) {
      console.error("Gagal menghapus data anak:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Helper render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Terverifikasi
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Ditolak
          </span>
        )
      case "PENDING_VERIFICATION":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
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
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Memuat data dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Halaman & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Data Anak & Verifikasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data registrasi anak, informasi identitas, dan status verifikasi.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMessage(null)
            setIsAddModalOpen(true)
          }}
          className="shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Data Anak
        </Button>
      </div>

      {/* 4 Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Anak */}
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Anak
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
                  {stats.total}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Total anak terdaftar dalam grup
            </p>
          </CardContent>
        </Card>

        {/* Pending Verifikasi */}
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Pending Verifikasi
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Menunggu validasi dokumen/identitas
            </p>
          </CardContent>
        </Card>

        {/* Terverifikasi */}
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Terverifikasi
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.verified}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Data valid dan telah disetujui
            </p>
          </CardContent>
        </Card>

        {/* Ditolak */}
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Ditolak
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-rose-600 dark:text-rose-400">
                  {stats.rejected}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Perlu perbaikan atau penyesuaian data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Anak & Filter Controls */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Daftar Data Anak</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Total {filteredChildren.length} anak ditemukan
              </CardDescription>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Cari nama, NIK, tempat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-full"
                />
              </div>

              {/* Status Filter Dropdown */}
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val ?? "ALL")}
              >
                <SelectTrigger className="h-8 text-xs min-w-[140px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pending Verifikasi</SelectItem>
                  <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          {filteredChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <FileText className="h-7 w-7" />
              </div>
              <h4 className="text-base font-semibold">Belum Ada Data Anak</h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {searchQuery || statusFilter !== "ALL"
                  ? "Tidak ada data yang sesuai dengan kriteria pencarian atau filter Anda."
                  : "Mulai dengan menambahkan data anak pertama Anda ke dalam sistem."}
              </p>
              {searchQuery || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("ALL")
                  }}
                  className="mt-4 text-xs"
                >
                  Reset Filter
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Data Anak
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs py-3">Nama Lengkap</TableHead>
                  <TableHead className="font-semibold text-xs py-3">NIK</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Gender</TableHead>
                  <TableHead className="font-semibold text-xs py-3">
                    Tempat & Tanggal Lahir
                  </TableHead>
                  <TableHead className="font-semibold text-xs py-3">Status</TableHead>
                  <TableHead className="font-semibold text-xs py-3 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.map((child) => (
                  <TableRow key={child.id} className="hover:bg-muted/40 transition-colors">
                    {/* Nama Lengkap */}
                    <TableCell className="py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {child.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <Link
                          href={`/children/${child.id}`}
                          className="truncate max-w-[180px] sm:max-w-none hover:underline font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {child.full_name}
                        </Link>
                      </div>
                    </TableCell>

                    {/* NIK */}
                    <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                      {child.nik}
                    </TableCell>

                    {/* Gender */}
                    <TableCell className="py-3 text-xs">
                      {child.gender === "L" ? (
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                          Laki-laki
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-pink-500/10 px-2 py-0.5 text-xs font-medium text-pink-600 dark:text-pink-400">
                          Perempuan
                        </span>
                      )}
                    </TableCell>

                    {/* Tempat & Tanggal Lahir */}
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          {child.birth_place || "-"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(child.birth_date)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3">
                      {renderStatusBadge(child.status)}
                    </TableCell>

                    {/* Aksi Dropdown */}
                    <TableCell className="py-3 text-right">
                      {actionLoadingId === child.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              />
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Buka menu aksi</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() => router.push(`/children/${child.id}`)}
                              className="text-xs cursor-pointer font-medium"
                            >
                              <Eye className="mr-2 h-3.5 w-3.5 text-primary" />
                              <span>Lihat Detail Profil</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel className="text-xs">
                              Status Verifikasi
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(child.id, "VERIFIED")}
                              disabled={child.status === "VERIFIED"}
                              className="text-xs text-emerald-600 focus:text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                              <span>Setujui (Verifikasi)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(child.id, "REJECTED")}
                              disabled={child.status === "REJECTED"}
                              className="text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
                            >
                              <XCircle className="mr-2 h-3.5 w-3.5" />
                              <span>Tolak Data</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(child.id, "PENDING_VERIFICATION")
                              }
                              disabled={child.status === "PENDING_VERIFICATION"}
                              className="text-xs text-amber-600 focus:text-amber-600 cursor-pointer"
                            >
                              <RotateCcw className="mr-2 h-3.5 w-3.5" />
                              <span>Set Pending</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteChild(child.id)}
                              className="text-xs cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span>Hapus Data Anak</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modal: Tambah Data Anak */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Tambah Data Anak Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan identitas anak untuk diregistrasikan ke dalam database kelompok.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddChild} className="space-y-4 pt-1">
            {errorMessage && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* NIK */}
            <div className="space-y-1.5">
              <Label htmlFor="nik" className="text-xs">
                Nomor Induk Kependudukan (NIK Anak)
              </Label>
              <Input
                id="nik"
                type="text"
                placeholder="16 digit NIK anak"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs">
                Nama Lengkap Anak
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Contoh: Muhammad Rizky Pratama"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs">
                Jenis Kelamin
              </Label>
              <Select
                value={gender}
                onValueChange={(val) => setGender(val ?? "L")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki (L)</SelectItem>
                  <SelectItem value="P">Perempuan (P)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tempat & Tanggal Lahir Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="birthPlace" className="text-xs">
                  Tempat Lahir
                </Label>
                <Input
                  id="birthPlace"
                  type="text"
                  placeholder="Contoh: Jakarta"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate" className="text-xs">
                  Tanggal Lahir
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  "Simpan Data Anak"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
