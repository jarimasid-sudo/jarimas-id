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
  Building2,
  Users,
  UserCheck,
  Plus,
  Loader2,
  Check,
  X,
  Clock,
  Search,
} from "lucide-react"

export interface GroupItem {
  id: string
  name: string
  type: string
  created_at?: string
  member_count?: number
}

export interface PendingMember {
  id: string
  user_id: string
  group_id: string
  role?: string
  is_approved?: boolean
  created_at?: string
  user_name?: string
  user_email?: string
  user_phone?: string
  group_name?: string
  group_type?: string
}

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Search filter
  const [searchPending, setSearchPending] = useState("")
  const [searchGroups, setSearchGroups] = useState("")

  // Modal Tambah Kelompok
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupType, setNewGroupType] = useState("POSYANDU")
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false)
  const [groupError, setGroupError] = useState<string | null>(null)

  // Fetch data
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

        // Ambil data kelompok (groups)
        const { data: groupsData } = await supabase
          .from("groups")
          .select("*")
          .order("created_at", { ascending: false })

        // Ambil data keanggotaan (group_members)
        const { data: membersData } = await supabase
          .from("group_members")
          .select("*")
          .order("created_at", { ascending: false })

        // Ambil data profil pengguna
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, phone, nik")

        if (!isMounted) return

        const profileMap = new Map<string, { full_name?: string; phone?: string }>()
        if (profilesData) {
          profilesData.forEach((p) => {
            profileMap.set(p.id, { full_name: p.full_name, phone: p.phone })
          })
        }

        const groupMap = new Map<string, { name: string; type: string }>()
        const groupCountMap = new Map<string, number>()

        if (groupsData) {
          groupsData.forEach((g) => {
            groupMap.set(g.id, { name: g.name, type: g.type })
            groupCountMap.set(g.id, 0)
          })
        }

        const pendingList: PendingMember[] = []

        if (membersData) {
          membersData.forEach((m) => {
            // Hitung anggota aktif
            if (m.is_approved !== false) {
              const curr = groupCountMap.get(m.group_id) || 0
              groupCountMap.set(m.group_id, curr + 1)
            }

            // Cek pending (is_approved === false atau null)
            if (m.is_approved === false || m.is_approved === null || m.is_approved === undefined) {
              const grp = groupMap.get(m.group_id)
              const prof = profileMap.get(m.user_id)
              pendingList.push({
                id: m.id,
                user_id: m.user_id,
                group_id: m.group_id,
                role: m.role,
                is_approved: m.is_approved,
                created_at: m.created_at,
                user_name: prof?.full_name || "Pengguna Baru",
                user_phone: prof?.phone || "-",
                group_name: grp?.name || "Kelompok",
                group_type: grp?.type || "-",
              })
            }
          })
        }

        const formattedGroups: GroupItem[] = (groupsData || []).map((g) => ({
          ...g,
          member_count: groupCountMap.get(g.id) || 0,
        }))

        setGroups(formattedGroups)
        setPendingMembers(pendingList)
      } catch (err) {
        console.error("Error loading groups data:", err)
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
  }, [router])

  // Filtered Pending Members
  const filteredPending = useMemo(() => {
    return pendingMembers.filter((item) => {
      const q = searchPending.toLowerCase()
      return (
        item.user_name?.toLowerCase().includes(q) ||
        item.group_name?.toLowerCase().includes(q) ||
        item.group_type?.toLowerCase().includes(q) ||
        item.user_phone?.includes(q)
      )
    })
  }, [pendingMembers, searchPending])

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const q = searchGroups.toLowerCase()
      return (
        g.name?.toLowerCase().includes(q) ||
        g.type?.toLowerCase().includes(q)
      )
    })
  }, [groups, searchGroups])

  // Handler Setujui (Approve)
  const handleApprove = async (memberId: string) => {
    setActionLoadingId(memberId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("group_members")
        .update({ is_approved: true })
        .eq("id", memberId)

      if (error) throw new Error(error.message)

      // Update state
      const approvedMember = pendingMembers.find((m) => m.id === memberId)
      setPendingMembers((prev) => prev.filter((m) => m.id !== memberId))

      if (approvedMember) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === approvedMember.group_id
              ? { ...g, member_count: (g.member_count || 0) + 1 }
              : g
          )
        )
      }
    } catch (err) {
      console.error("Gagal menyetujui anggota:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handler Tolak (Reject)
  const handleReject = async (memberId: string) => {
    if (!confirm("Apakah Anda yakin ingin menolak permohonan keanggotaan ini?")) return

    setActionLoadingId(memberId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId)

      if (error) throw new Error(error.message)

      setPendingMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch (err) {
      console.error("Gagal menolak anggota:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handler Tambah Kelompok Baru
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setGroupError(null)

    if (!newGroupName.trim()) {
      setGroupError("Nama kelompok tidak boleh kosong.")
      return
    }

    setIsSubmittingGroup(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: newGroupName.trim(),
          type: newGroupType,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      if (data) {
        const newGroupItem: GroupItem = {
          ...data,
          member_count: 0,
        }
        setGroups((prev) => [newGroupItem, ...prev])
        setNewGroupName("")
        setNewGroupType("POSYANDU")
        setIsAddGroupOpen(false)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGroupError(err.message)
      } else {
        setGroupError("Terjadi kesalahan saat membuat kelompok.")
      }
    } finally {
      setIsSubmittingGroup(false)
    }
  }

  // Format Badge Tipe Kelompok
  const renderGroupTypeBadge = (type?: string) => {
    switch (type) {
      case "POSYANDU":
        return (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Posyandu
          </span>
        )
      case "PAUD_PNF":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            PAUD / PNF
          </span>
        )
      case "RT_RW":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            RT / RW
          </span>
        )
      case "DINAS_KECAMATAN":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Dinas / Kecamatan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {type || "-"}
          </span>
        )
    }
  }

  // Format Tanggal
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
        <p className="mt-3 text-sm text-muted-foreground">Memuat data kelompok & persetujuan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Manajemen Kelompok & Anggota
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola persetujuan pendaftaran anggota kelompok dan daftar instansi terdaftar.
          </p>
        </div>

        <Button
          onClick={() => {
            setGroupError(null)
            setIsAddGroupOpen(true)
          }}
          className="shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Kelompok Baru
        </Button>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="pending" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-auto p-1 bg-muted/60">
          <TabsTrigger value="pending" className="py-2 text-xs sm:text-sm font-medium">
            <Clock className="h-4 w-4 mr-1.5 shrink-0" />
            <span>Permintaan Pending</span>
            {pendingMembers.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingMembers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups" className="py-2 text-xs sm:text-sm font-medium">
            <Building2 className="h-4 w-4 mr-1.5 shrink-0" />
            <span>Daftar Kelompok</span>
            <span className="ml-2 inline-flex h-5 px-1.5 items-center justify-center rounded-full bg-muted text-foreground text-[10px] font-medium border border-border">
              {groups.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PERMINTAAN KEANGGOTAAN PENDING */}
        <TabsContent value="pending" className="space-y-4 outline-none">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Persetujuan Anggota Baru
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Tinjau dan setujui permohonan pengguna untuk bergabung ke dalam kelompok.
                  </CardDescription>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Cari nama, kelompok, telp..."
                    value={searchPending}
                    onChange={(e) => setSearchPending(e.target.value)}
                    className="pl-8 h-8 text-xs w-full"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-semibold">Tidak Ada Permintaan Pending</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Semua permohonan keanggotaan kelompok telah diproses dan disetujui.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs py-3">Nama Pengguna</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Kontak / Telp</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Nama Kelompok</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Tipe Kelompok</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Tanggal Daftar</TableHead>
                      <TableHead className="font-semibold text-xs py-3 text-right">Aksi Persetujuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        {/* Nama Pengguna */}
                        <TableCell className="py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {item.user_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span>{item.user_name}</span>
                          </div>
                        </TableCell>

                        {/* Kontak */}
                        <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                          {item.user_phone}
                        </TableCell>

                        {/* Nama Kelompok */}
                        <TableCell className="py-3 text-xs font-semibold text-foreground">
                          {item.group_name}
                        </TableCell>

                        {/* Tipe Kelompok */}
                        <TableCell className="py-3">
                          {renderGroupTypeBadge(item.group_type)}
                        </TableCell>

                        {/* Tanggal Daftar */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </TableCell>

                        {/* Aksi Button */}
                        <TableCell className="py-3 text-right">
                          {actionLoadingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleApprove(item.id)}
                                className="h-7 text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleReject(item.id)}
                                className="h-7 text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/30"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DAFTAR KELOMPOK TERDAFTAR */}
        <TabsContent value="groups" className="space-y-4 outline-none">
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Daftar Kelompok & Instansi
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Seluruh kelompok yang terdaftar dan aktif di sistem Jarimas.
                  </CardDescription>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Cari kelompok / tipe..."
                    value={searchGroups}
                    onChange={(e) => setSearchGroups(e.target.value)}
                    className="pl-8 h-8 text-xs w-full"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-semibold">Belum Ada Kelompok</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Buat kelompok atau instansi pertama Anda untuk mulai mengorganisasi data.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setIsAddGroupOpen(true)}
                    className="mt-4 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Kelompok
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs py-3">Nama Kelompok / Instansi</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Tipe Kelompok</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Jumlah Anggota</TableHead>
                      <TableHead className="font-semibold text-xs py-3">Tanggal Dibuat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id} className="hover:bg-muted/40 transition-colors">
                        {/* Nama Kelompok */}
                        <TableCell className="py-3 font-semibold text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                              {group.name?.charAt(0).toUpperCase() || "G"}
                            </div>
                            <span>{group.name}</span>
                          </div>
                        </TableCell>

                        {/* Tipe Kelompok */}
                        <TableCell className="py-3">
                          {renderGroupTypeBadge(group.type)}
                        </TableCell>

                        {/* Jumlah Anggota */}
                        <TableCell className="py-3 text-xs">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {group.member_count} Anggota
                          </span>
                        </TableCell>

                        {/* Tanggal Dibuat */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formatDate(group.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Dialog: Tambah Kelompok Baru */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Tambah Kelompok Baru</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Daftarkan entitas kelompok, posyandu, PAUD, atau instansi wilayah baru.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4 pt-1">
            {groupError && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-2.5 text-xs text-destructive">
                {groupError}
              </div>
            )}

            {/* Nama Kelompok */}
            <div className="space-y-1.5">
              <Label htmlFor="groupName" className="text-xs font-semibold">
                Nama Kelompok / Instansi
              </Label>
              <Input
                id="groupName"
                placeholder="Contoh: Posyandu Dahlia 04 / PAUD Ceria"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                disabled={isSubmittingGroup}
              />
            </div>

            {/* Tipe Kelompok */}
            <div className="space-y-1.5">
              <Label htmlFor="groupType" className="text-xs font-semibold">
                Jenis Kelompok
              </Label>
              <Select
                value={newGroupType}
                onValueChange={(val) => setNewGroupType(val ?? "POSYANDU")}
                disabled={isSubmittingGroup}
              >
                <SelectTrigger id="groupType" className="w-full">
                  <SelectValue placeholder="Pilih jenis kelompok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSYANDU">Posyandu</SelectItem>
                  <SelectItem value="PAUD_PNF">PAUD / PNF</SelectItem>
                  <SelectItem value="RT_RW">RT / RW</SelectItem>
                  <SelectItem value="DINAS_KECAMATAN">Dinas / Kecamatan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddGroupOpen(false)}
                disabled={isSubmittingGroup}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmittingGroup}>
                {isSubmittingGroup ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Buat Kelompok"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
