"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, Edit, Trash2, Eye, Baby, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl';
import { useEffect } from "react"
import { config } from "@/config"

export default function BreedingPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterMethod, setFilterMethod] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 10

  const t = useTranslations('BreedingPage');

  const methodOptions = ["Natural Mating", "Artificial Insemination"]
  const statusOptions = ["Successful", "Failed", "In Progress"]

  useEffect(() => {
    fetchRecords(currentPage, itemsPerPage)
  }, [currentPage])

  const fetchRecords = async (page = 1, limit = itemsPerPage) => {
    setLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const url = new URL(`${config.backendUrl}/breeding`)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      const res = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error('Failed to fetch breeding records')
      const data = await res.json()
      setRecords(Array.isArray(data.breeding) ? data.breeding : data.records || [])
      setTotalPages(data.totalPages || 1)
      setTotalRecords(data.total || (Array.isArray(data.breeding) ? data.breeding.length : 0))
      setCurrentPage(data.page || page)
    } catch (err) {
      setError('Error fetching breeding records')
    } finally {
      setLoading(false)
    }
  }
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.sireTagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.damTagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = filterMethod === "all" || record.breedingMethod === filterMethod
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    return matchesSearch && matchesMethod && matchesStatus
  })

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Sire ID",
        "Dam ID",
        "Breeding Date",
        "Method",
        "Expected Delivery",
        "Actual Delivery",
        "Offspring",
        "Status",
        "Cost",
      ].join(","),
      ...filteredRecords.map((record) =>
        [
          record.sireTagId,
          record.damTagId,
          record.breedingDate ? record.breedingDate.slice(0, 10) : "",
          record.breedingMethod,
          record.expectedDelivery,
          record.actualDelivery,
          record.numberOfOffspring,
          record.status,
          record.cost,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "breeding-records.csv"
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Successful":
        return "default"
      case "Failed":
        return "destructive"
      case "In Progress":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Add delete handler
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this breeding record?')) return;
    setDeleteLoadingId(id);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${config.backendUrl}/breeding/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete breeding record');
      setRecords((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      alert('Error deleting breeding record');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {t('exportCSV')}
          </Button>
          <Button variant="outline" disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            {t('importCSV')}
          </Button>
          <Link href="/breeding/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('add')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list')}</CardTitle>
          <CardDescription>{t('listDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('searchByTagOrBreed')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterBy') + " " + t('method')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allMethods')}</SelectItem>
                {methodOptions.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterBy') + " " + t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sireId')}</TableHead>
                  <TableHead>{t('damId')}</TableHead>
                  <TableHead>{t('breedingDate')}</TableHead>
                  <TableHead>{t('method')}</TableHead>
                  <TableHead>{t('expectedDelivery')}</TableHead>
                  <TableHead>{t('numberOfOffspring')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('cost')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-red-600">{error}</TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">No records found</TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record._id || record.id}>
                      <TableCell className="font-medium">{record.sireTagId}</TableCell>
                      <TableCell className="font-medium">{record.damTagId}</TableCell>
                      <TableCell>{record.breedingDate ? record.breedingDate.slice(0, 10) : ""}</TableCell>
                      <TableCell>{record.breedingMethod}</TableCell>
                      <TableCell>{record.expectedDelivery}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Baby className="h-4 w-4 text-blue-600" />
                          <span>{record.numberOfOffspring}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(record.status) as any}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>${Number(record.cost).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRecord(record._id || record.id)} disabled={deleteLoadingId === (record._id || record.id)}>
                            {deleteLoadingId === (record._id || record.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {`${t('showing')} ${(currentPage - 1) * itemsPerPage + 1} ${t('to')} ${Math.min(currentPage * itemsPerPage, totalRecords)} ${t('of')} ${totalRecords} ${t('results')}`}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
