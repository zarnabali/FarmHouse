"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { config } from "@/config"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

export default function FarmhouseUsersPage() {
  const t = useTranslations('FarmhouseUsersPage')
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [managers, setManagers] = useState<any[]>([])
  const [assistants, setAssistants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Pagination helpers for separate lists
  const itemsPerPage = 5
  const [managerPage, setManagerPage] = useState(1)
  const [assistantPage, setAssistantPage] = useState(1)
  const paginatedManagers = managers.slice((managerPage-1)*itemsPerPage, managerPage*itemsPerPage)
  const paginatedAssistants = assistants.slice((assistantPage-1)*itemsPerPage, assistantPage*itemsPerPage)
  const managerTotalPages = Math.ceil(managers.length / itemsPerPage)
  const assistantTotalPages = Math.ceil(assistants.length / itemsPerPage)
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // Only allow admin
    const roleVal = typeof window !== 'undefined' ? localStorage.getItem('role') : null
    setRole(roleVal)
    if (roleVal !== 'admin') {
      setError(t('adminOnlyError'))
      return
    }
    const adminIdRaw = typeof window !== 'undefined' ? localStorage.getItem('id') : null
    if (!adminIdRaw) return
    // Clean adminId (same as farmhouse/page.tsx)
    let cleanId = adminIdRaw
    try { cleanId = JSON.parse(adminIdRaw) } catch { cleanId = adminIdRaw }
    if (typeof cleanId === "string") cleanId = cleanId.replace(/^"+|"+$/g, "")
    // Debug logs
    console.log('FarmhouseUsersPage adminId:', cleanId)
    const token = localStorage.getItem('token')
    console.log('FarmhouseUsersPage token:', token)
    // Fetch admin info
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // Admin info
        const resAdmin = await fetch(`${config.backendUrl}/auth/user/${cleanId}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!resAdmin.ok) throw new Error('Failed to fetch admin info')
        const admin = await resAdmin.json()
        setAdminInfo(admin)
        // FarmhouseUsers doc
        const resFH = await fetch(`${config.backendUrl}/farmhouse-users/${cleanId}`, { headers: { Authorization: `Bearer ${token}` } })
        if (resFH.status === 404) {
          setManagers([])
          setAssistants([])
          setError(t('noFarmhouseUsersError'))
        } else if (!resFH.ok) {
          throw new Error('Failed to fetch farmhouse users')
        } else {
          const fhDoc = await resFH.json()
          // Fetch manager/assistant user info
          const fetchUsers = async (ids: string[]) => {
            const users = []
            for (const id of ids) {
              const res = await fetch(`${config.backendUrl}/auth/user/${id}`, { headers: { Authorization: `Bearer ${token}` } })
              if (res.ok) users.push(await res.json())
            }
            return users
          }
          setManagers(await fetchUsers((fhDoc.managers || []).map((u: any) => typeof u === 'string' ? u : u._id)))
          setAssistants(await fetchUsers((fhDoc.assistants || []).map((u: any) => typeof u === 'string' ? u : u._id)))
        }
      } catch (err: any) {
        setError(err.message || 'Error loading data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [t])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        {(() => {
          const adminIdRaw = typeof window !== 'undefined' ? (localStorage.getItem('id') || '') : ''
          let cleanId = adminIdRaw
          try { cleanId = JSON.parse(adminIdRaw) } catch { cleanId = adminIdRaw }
          if (typeof cleanId === "string") cleanId = cleanId.replace(/^"+|"+$/g, "")
          if (cleanId && role === 'admin') {
            return (
              <Link href={`/farmhouse-users/new?adminId=${cleanId}`}>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t('addUser')}</Button>
              </Link>
            )
          }
          return null
        })()}
      </div>
      {/* Show error if not admin */}
      {role !== 'admin' && (
        <div className="text-red-500 font-semibold text-center">{t('adminOnlyError')}</div>
      )}
      {/* Always show admin info if loaded */}
      {adminInfo && (
        <Card>
          <CardHeader>
            <CardTitle>{t('adminInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><b>{t('name')}:</b> {adminInfo.name}</div>
              <div><b>{t('id')}:</b> {adminInfo._id}</div>
              <div><b>{t('email')}:</b> {adminInfo.email}</div>
              <div><b>{t('role')}:</b> {adminInfo.role}</div>
              <div><b>{t('location')}:</b> {adminInfo.location}</div>
              <div><b>{t('phone')}:</b> {adminInfo.phone}</div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Show error if no FarmhouseUsers found, but only if admin */}
      {role === 'admin' && error === t('noFarmhouseUsersError') && (
        <div className="text-yellow-600 font-semibold text-center">{t('noFarmhouseUsersError')}</div>
      )}
      {/* Managers and Assistants lists only if admin and not 404 error */}
      {role === 'admin' && error !== t('noFarmhouseUsersError') && (
        <>
          {/* Managers List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('managers')}</CardTitle>
              <CardDescription>{t('managersDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('location')}</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            {t('loadingManagers')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedManagers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('noManagersFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedManagers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">{t('manager')}</Badge>
                          </TableCell>
                          <TableCell>{user.location}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination below table, match incidents page style */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {`${t('showing')} ${(managerPage - 1) * itemsPerPage + 1} ${t('to')} ${Math.min(managerPage * itemsPerPage, managers.length)} ${t('of')} ${managers.length} ${t('results')}`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManagerPage((prev) => Math.max(prev - 1, 1))}
                    disabled={managerPage === 1 || loading}
                  >
                    {t('previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManagerPage((prev) => Math.min(prev + 1, managerTotalPages))}
                    disabled={managerPage === managerTotalPages || loading}
                  >
                    {t('next')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Assistants List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assistants')}</CardTitle>
              <CardDescription>{t('assistantsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('location')}</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            {t('loadingAssistants')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedAssistants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('noAssistantsFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAssistants.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t('assistant')}</Badge>
                          </TableCell>
                          <TableCell>{user.location}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination below table, match incidents page style */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {`${t('showing')} ${(assistantPage - 1) * itemsPerPage + 1} ${t('to')} ${Math.min(assistantPage * itemsPerPage, assistants.length)} ${t('of')} ${assistants.length} ${t('results')}`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssistantPage((prev) => Math.max(prev - 1, 1))}
                    disabled={assistantPage === 1 || loading}
                  >
                    {t('previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssistantPage((prev) => Math.min(prev + 1, assistantTotalPages))}
                    disabled={assistantPage === assistantTotalPages || loading}
                  >
                    {t('next')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 