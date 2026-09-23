"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  GraduationCap,
  HeartPulse,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RotateCcw,
  BarChart3,
  MapPin,
} from "lucide-react"

export interface ChildRecord {
  id: string
  nik: string
  full_name: string
  gender: string
  birth_date: string
  birth_place?: string
  status: string
  group_id?: string
  created_at?: string
  group_name?: string
  group_type?: string
  posyandu_health_record?: {
    weight_kg?: string
    height_cm?: string
    head_circumference_cm?: string
    immunization_status?: string
    check_date?: string
  }
  school_enrollment_record?: {
    is_enrolled?: string
    school_name?: string
    npsn?: string
  }
}

// Data Wilayah Kecamatan & Kelurahan di Kota Tegal
const TEGAL_DISTRICTS = [
  {
    name: "Tegal Barat",
    villages: ["Tegalsari", "Kraton", "Kemandungan", "Pekauman", "Pesurungan Kidul", "Muarareja"],
  },
  {
    name: "Tegal Timur",
    villages: ["Mintaragen", "Panggung", "Mangkukusuman", "Kejambon", "Slerok"],
  },
  {
    name: "Tegal Selatan",
    villages: ["Debong Kidul", "Debong Kulon", "Debong Tengah", "Debong Lor", "Kalinyamat Wetan", "Kalinyamat Kulon", "Bandung", "Randugunting"],
  },
  {
    name: "Margadana",
    villages: ["Margadana", "Cabawan", "Krandon", "Kaligangsa", "Pesurungan Lor", "Sumurpanggang"],
  },
]

export default function ReportsPage() {
  const router = useRouter()
  const [childrenData, setChildrenData] = useState<ChildRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL")
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL")
  const [selectedSector, setSelectedSector] = useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch all children & group data
  useEffect(() => {
    let isMounted = true

    async function loadReportData() {
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

        // Ambil data anak
        const { data: children } = await supabase
          .from("children_data")
          .select("*")
          .order("created_at", { ascending: false })

        // Ambil data kelompok
        const { data: groups } = await supabase
          .from("groups")
          .select("id, name, type")

        if (!isMounted) return

        const groupMap = new Map<string, { name: string; type: string }>()
        if (groups) {
          groups.forEach((g) => {
            groupMap.set(g.id, { name: g.name, type: g.type })
          })
        }

        const enrichedList: ChildRecord[] = (children || []).map((c) => {
          const grp = c.group_id ? groupMap.get(c.group_id) : undefined
          return {
            ...c,
            group_name: grp?.name || "Umum / Mandiri",
            group_type: grp?.type || "LAINNYA",
          }
        })

        setChildrenData(enrichedList)
      } catch (err) {
        console.error("Error loading report data:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReportData()

    return () => {
      isMounted = false
    }
  }, [router])

  // List kelurahan berdasarkan kecamatan yang dipilih
  const availableVillages = useMemo(() => {
    if (selectedDistrict === "ALL") {
      return TEGAL_DISTRICTS.flatMap((d) => d.villages)
    }
    const found = TEGAL_DISTRICTS.find((d) => d.name === selectedDistrict)
    return found ? found.villages : []
  }, [selectedDistrict])

  // Filtered dataset
  const filteredData = useMemo(() => {
    return childrenData.filter((item) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !searchQuery ||
        item.full_name?.toLowerCase().includes(q) ||
        item.nik?.includes(q) ||
        item.birth_place?.toLowerCase().includes(q) ||
        item.group_name?.toLowerCase().includes(q)

      // 2. Status filter
      const matchStatus =
        selectedStatus === "ALL"
          ? true
          : selectedStatus === "PENDING_VERIFICATION"
          ? item.status === "PENDING_VERIFICATION" || !item.status
          : item.status === selectedStatus

      // 3. Sector / Group Type filter
      const matchSector =
        selectedSector === "ALL" ? true : item.group_type === selectedSector

      // 4. District / Village filter
      let matchLocation = true
      if (selectedVillage !== "ALL") {
        matchLocation = Boolean(
          item.birth_place?.toLowerCase().includes(selectedVillage.toLowerCase()) ||
          item.group_name?.toLowerCase().includes(selectedVillage.toLowerCase())
        )
      } else if (selectedDistrict !== "ALL") {
        const villagesInDistrict =
          TEGAL_DISTRICTS.find((d) => d.name === selectedDistrict)?.villages || []
        matchLocation = Boolean(
          item.birth_place?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
          villagesInDistrict.some(
            (v) =>
              item.birth_place?.toLowerCase().includes(v.toLowerCase()) ||
              item.group_name?.toLowerCase().includes(v.toLowerCase())
          )
        )
      }

      return matchSearch && matchStatus && matchSector && matchLocation
    })
  }, [childrenData, searchQuery, selectedStatus, selectedSector, selectedDistrict, selectedVillage])

  // Metrics Rekapitulasi
  const summaryMetrics = useMemo(() => {
    const total = filteredData.length
    if (total === 0) {
      return {
        total: 0,
        paudEnrolled: 0,
        paudPercentage: 0,
        posyanduActive: 0,
        posyanduPercentage: 0,
        verified: 0,
        verifiedPercentage: 0,
        pending: 0,
        rejected: 0,
      }
    }

    const paudEnrolled = filteredData.filter(
      (c) => c.school_enrollment_record?.is_enrolled === "YA"
    ).length

    const posyanduActive = filteredData.filter(
      (c) =>
        c.posyandu_health_record &&
        (c.posyandu_health_record.weight_kg || c.posyandu_health_record.check_date)
    ).length

    const verified = filteredData.filter((c) => c.status === "VERIFIED").length
    const pending = filteredData.filter(
      (c) => c.status === "PENDING_VERIFICATION" || !c.status
    ).length
    const rejected = filteredData.filter((c) => c.status === "REJECTED").length

    return {
      total,
      paudEnrolled,
      paudPercentage: Math.round((paudEnrolled / total) * 100),
      posyanduActive,
      posyanduPercentage: Math.round((posyanduActive / total) * 100),
      verified,
      verifiedPercentage: Math.round((verified / total) * 100),
      pending,
      rejected,
    }
  }, [filteredData])

  // Handler Ekspor ke CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.")
      return
    }

    const headers = [
      "No",
      "NIK",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Nama Kelompok",
      "Tipe Kelompok",
      "Status PAUD",
      "Nama PAUD/Sekolah",
      "Status Imunisasi",
      "Berat Badan (kg)",
      "Tinggi Badan (cm)",
      "Status Verifikasi",
    ]

    const rows = filteredData.map((item, index) => [
      index + 1,
      `'${item.nik}`, // prevent Excel auto-scientific notation
      `"${(item.full_name || "").replace(/"/g, '""')}"`,
      item.gender === "L" ? "Laki-laki" : "Perempuan",
      `"${(item.birth_place || "").replace(/"/g, '""')}"`,
      item.birth_date || "-",
      `"${(item.group_name || "").replace(/"/g, '""')}"`,
      item.group_type || "-",
      item.school_enrollment_record?.is_enrolled === "YA" ? "Terdaftar" : "Belum Terdaftar",
      `"${(item.school_enrollment_record?.school_name || "-").replace(/"/g, '""')}"`,
      item.posyandu_health_record?.immunization_status || "-",
      item.posyandu_health_record?.weight_kg || "-",
      item.posyandu_health_record?.height_cm || "-",
      item.status || "PENDING_VERIFICATION",
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const dateStr = new Date().toISOString().split("T")[0]
    link.setAttribute("href", url)
    link.setAttribute("download", `rekapitulasi_anak_jarimas_tegal_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDistrict("ALL")
    setSelectedVillage("ALL")
    setSelectedSector("ALL")
    setSelectedStatus("ALL")
    setSearchQuery("")
  }

  // Helper render status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Terverifikasi
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Ditolak
          </span>
        )
      case "PENDING_VERIFICATION":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            Pending
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
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Memuat rekapitulasi data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Rekapitulasi & Ekspor Data
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Laporan agregasi data anak Kota Tegal berdasarkan wilayah, sektor, dan status verifikasi.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={filteredData.length === 0}
          className="shrink-0 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Ekspor ke CSV (Excel)
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filter Rekapitulasi Wilayah & Sektor
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Filter Kecamatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Kecamatan (Kota Tegal)
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={(val) => {
                  setSelectedDistrict(val ?? "ALL")
                  setSelectedVillage("ALL")
                }}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Semua Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kecamatan</SelectItem>
                  {TEGAL_DISTRICTS.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kelurahan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Kelurahan
              </label>
              <Select
                value={selectedVillage}
                onValueChange={(val) => setSelectedVillage(val ?? "ALL")}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Semua Kelurahan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kelurahan</SelectItem>
                  {availableVillages.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Sektor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Sektor / Tipe Kelompok
              </label>
              <Select
                value={selectedSector}
                onValueChange={(val) => setSelectedSector(val ?? "ALL")}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Semua Sektor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Sektor</SelectItem>
                  <SelectItem value="POSYANDU">Posyandu</SelectItem>
                  <SelectItem value="PAUD_PNF">PAUD / PNF</SelectItem>
                  <SelectItem value="RT_RW">RT / RW</SelectItem>
                  <SelectItem value="DINAS_KECAMATAN">Dinas / Kecamatan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Status Verifikasi
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val ?? "ALL")}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pending Verifikasi</SelectItem>
                  <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Pencarian Cepat
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Nama, NIK, tempat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan Kartu Rekapitulasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Terfilter */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Anak Terdata
                </p>
                <h3 className="text-2xl font-bold mt-1 tracking-tight">
                  {summaryMetrics.total}
                </h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sesuai parameter filter aktif
            </p>
          </CardContent>
        </Card>

        {/* Partisipasi PAUD */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Terdaftar PAUD/PNF
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summaryMetrics.paudEnrolled}
                  </h3>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {summaryMetrics.paudPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${summaryMetrics.paudPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Catatan Posyandu Aktif */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Kesehatan Posyandu
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {summaryMetrics.posyanduActive}
                  </h3>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {summaryMetrics.posyanduPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <HeartPulse className="h-5 w-5" />
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${summaryMetrics.posyanduPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tingkat Verifikasi */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Terverifikasi
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {summaryMetrics.verified}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {summaryMetrics.verifiedPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${summaryMetrics.verifiedPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Rekapitulasi Data */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Daftar Rekapitulasi Data Anak ({filteredData.length})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Data teragregasi yang siap dipelajari dan diekspor ke format spreadsheet.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold">Tidak Ada Data Sesuai Filter</h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Silakan sesuaikan kembali filter wilayah, sektor, atau status verifikasi Anda.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 text-xs"
              >
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs py-3">Nama & NIK</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Gender</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Tempat / Lahir</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Kelompok / Sektor</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Status PAUD</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Posyandu (BB/TB)</TableHead>
                  <TableHead className="font-semibold text-xs py-3">Status Verifikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    {/* Nama & NIK */}
                    <TableCell className="py-3 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">
                          {item.full_name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.nik}
                        </span>
                      </div>
                    </TableCell>

                    {/* Gender */}
                    <TableCell className="py-3 text-xs">
                      {item.gender === "L" ? (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">L</span>
                      ) : (
                        <span className="text-pink-600 dark:text-pink-400 font-medium">P</span>
                      )}
                    </TableCell>

                    {/* Tempat & Tanggal Lahir */}
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground inline" />
                          {item.birth_place || "-"}
                        </span>
                        <span className="text-[11px]">{formatDate(item.birth_date)}</span>
                      </div>
                    </TableCell>

                    {/* Kelompok & Sektor */}
                    <TableCell className="py-3 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{item.group_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {item.group_type}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status PAUD */}
                    <TableCell className="py-3 text-xs">
                      {item.school_enrollment_record?.is_enrolled === "YA" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Terdaftar
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Belum</span>
                      )}
                    </TableCell>

                    {/* Posyandu BB/TB */}
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {item.posyandu_health_record?.weight_kg ? (
                        <span>
                          {item.posyandu_health_record.weight_kg}kg /{" "}
                          {item.posyandu_health_record.height_cm || "-"}cm
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">-</span>
                      )}
                    </TableCell>

                    {/* Status Verifikasi */}
                    <TableCell className="py-3">
                      {renderStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
