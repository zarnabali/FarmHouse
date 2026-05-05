"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, Edit, Trash2, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl';
import { config } from "@/config"
import EditAnimalModal from "@/components/edit-animal-modal"

// Animal type definition
interface Animal {
  id: string
  tagId: string
  breed: string
  gender: string
  dob: string
  weight: number
  condition: string
  status: string
  location: string
  sireId?: string
  damId?: string
  acquisitionType?: string
  acquisitionDate?: string
  farmhouse?: string
}

// API response type
interface AnimalsResponse {
  animals: Animal[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBreed, setFilterBreed] = useState("all")
  const [filterGender, setFilterGender] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAnimals, setTotalAnimals] = useState(0)
  const itemsPerPage = 10
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [farmhouses, setFarmhouses] = useState<{ _id?: string, f_id: string, Name: string }[]>([])

  const breeds = ["Boer", "Nubian", "Kiko", "Spanish", "Angus"]

  const t = useTranslations('AnimalsPage');

  // Fetch animals from API
  const fetchAnimals = async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setLoading(true)
      setError(null)
      
      const url = new URL(`${config.backendUrl}/animals`)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      const response = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: AnimalsResponse = await response.json()
      
      setAnimals(data.animals)
      setTotalPages(data.totalPages)
      setTotalAnimals(data.total)
      setCurrentPage(data.page)
    } catch (err) {
      console.error("Error fetching animals:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch animals")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAnimals()
  }, [])

  // Fetch when page changes
  useEffect(() => {
    fetchAnimals(currentPage, itemsPerPage)
  }, [currentPage])

  useEffect(() => {
    const fetchFarmhouses = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${config.backendUrl}/farmhouse`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        const data = await res.json()
        setFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data)
      } catch (err) {
        setFarmhouses([])
      }
    }
    fetchFarmhouses()
  }, [])

  // Client-side filtering for search and filters
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBreed = filterBreed === "all" || animal.breed === filterBreed
    const matchesGender = filterGender === "all" || animal.gender === filterGender

    return matchesSearch && matchesBreed && matchesGender
  })

  const handleExportCSV = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`${config.backendUrl}/animals/export-csv`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) throw new Error('Failed to export CSV')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'animals.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error exporting CSV')
    }
  }

  const handleImportCSVClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // reset so same file can be picked again
      fileInputRef.current.click()
    }
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`${config.backendUrl}/animals/import-csv`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      })
      if (!response.ok) throw new Error('Failed to import CSV')
      alert('CSV imported successfully!')
      // Optionally, refresh animal list
      fetchAnimals(currentPage, itemsPerPage)
    } catch (err) {
      alert('Error importing CSV')
    } finally {
      setImportLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // PATCH animal
  const handleEditSave = async (updated: Partial<Animal>) => {
    if (!editAnimal) return
    setEditLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`${config.backendUrl}/animals/${(editAnimal as any)._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updated)
      })
      if (!response.ok) throw new Error('Failed to update animal')
      // Update animal in UI
      setAnimals((prev) => prev.map(a => (a as any)._id === (editAnimal as any)._id ? { ...a, ...updated } : a))
      setEditModalOpen(false)
      setEditAnimal(null)
    } catch (err) {
      alert('Error updating animal')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteAnimal = async (animalId: string) => {
    if (!window.confirm('Are you sure you want to delete this animal?')) return
    setDeleteLoadingId(animalId)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`${config.backendUrl}/animals/${animalId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) throw new Error('Failed to delete animal')
      setAnimals((prev) => prev.filter(a => (a as any)._id !== animalId))
    } catch (err) {
      alert('Error deleting animal')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600">{t('description')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button onClick={() => fetchAnimals()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <Button variant="outline" onClick={handleImportCSVClick} disabled={loading || importLoading}>
            <Upload className="h-4 w-4 mr-2" />
            {importLoading ? t('importing') : t('importCSV')}
          </Button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportCSV}
          />
          <Link href="/animals/new">
            <Button disabled={loading}>
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
            <Select value={filterBreed} onValueChange={setFilterBreed} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByBreed')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allBreeds')}</SelectItem>
                {breeds.map((breed) => (
                  <SelectItem key={breed} value={breed}>
                    {breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByGender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allGenders')}</SelectItem>
                <SelectItem value="Male">{t('male')}</SelectItem>
                <SelectItem value="Female">{t('female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('id')}</TableHead>
                  <TableHead>{t('tagId')}</TableHead>
                  <TableHead>{t('breed')}</TableHead>
                  <TableHead>{t('gender')}</TableHead>
                  <TableHead>{t('dob')}</TableHead>
                  <TableHead>{t('weight')}</TableHead>
                  <TableHead>{t('condition')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('location')}</TableHead>
                  <TableHead>{t('sireId')}</TableHead>
                  <TableHead>{t('damId')}</TableHead>
                  <TableHead>{t('acquisitionType')}</TableHead>
                  <TableHead>{t('acquisitionDate')}</TableHead>
                  <TableHead>{t('farmhouse')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading animals...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAnimals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No animals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnimals.map((animal) => (
                    <TableRow key={animal.id || (animal as any)._id}>
                      <TableCell>{animal.id || (animal as any)._id}</TableCell>
                      <TableCell className="font-medium">{animal.tagId}</TableCell>
                      <TableCell>{animal.breed}</TableCell>
                      <TableCell>{animal.gender}</TableCell>
                      <TableCell>{animal.dob}</TableCell>
                      <TableCell>{animal.weight}</TableCell>
                      <TableCell>
                        <Badge variant={animal.condition === "Excellent" ? "default" : "secondary"}>
                          {animal.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={animal.status === "Active" ? "default" : "destructive"}>{animal.status}</Badge>
                      </TableCell>
                      <TableCell>{animal.location || "-"}</TableCell>
                      <TableCell>{animal.sireId || "-"}</TableCell>
                      <TableCell>{animal.damId || "-"}</TableCell>
                      <TableCell>{animal.acquisitionType || "-"}</TableCell>
                      <TableCell>{animal.acquisitionDate || "-"}</TableCell>
                      <TableCell>{
                        farmhouses.find(fh => (fh._id || fh.f_id) === animal.farmhouse)?.Name || "-"
                      }</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditAnimal(animal); setEditModalOpen(true) }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAnimal((animal as any)._id)}
                            disabled={deleteLoadingId === (animal as any)._id}
                          >
                            {deleteLoadingId === (animal as any)._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
              {`${t('showing')} ${(currentPage - 1) * itemsPerPage + 1} ${t('to')} ${Math.min(currentPage * itemsPerPage, totalAnimals)} ${t('of')} ${totalAnimals} ${t('results')}`}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditAnimalModal
        animal={editAnimal}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditAnimal(null) }}
        onSave={handleEditSave}
        loading={editLoading}
      />
    </div>
  )
}