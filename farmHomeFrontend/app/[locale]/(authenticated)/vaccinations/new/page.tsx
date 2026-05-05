"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/app/[locale]/providers"
import { toast } from "sonner"
import { config } from "@/config"

export default function NewVaccinationPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    animalTagId: "",
    vaccineName: "",
    manufacturer: "",
    batchNumber: "",
    vaccinationType: "",
    dosage: "",
    administrationRoute: "",
    administeredBy: "",
    treatmentDate: "",
    expiryDate: "",
    nextDueDate: "",
    cost: "",
    status: "Completed",
    sideEffects: "",
    notes: "",
  })

  const typeOptions = ["Core", "Non-Core", "Risk-Based"]
  const routeOptions = ["Subcutaneous", "Intramuscular", "Intranasal", "Oral"]
  const statusOptions = ["Completed", "Scheduled", "Cancelled"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${config.backendUrl}/vaccinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success(t('recordAdded'))
        router.push('/vaccinations')
      } else {
        const error = await res.json().catch(() => ({}))
        toast.error(error?.message || 'Failed to create vaccination record')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/vaccinations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backTo")} {t("vaccinations")}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("addVaccination")}</h1>
          <p className="text-gray-600">{t("vaccinationInformation")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("vaccinationInformation")}</CardTitle>
          <CardDescription>Fill in all the required information for the vaccination record</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="animalTagId">{t("animalTagId")} *</Label>
                  <Input
                    id="animalTagId"
                    value={formData.animalTagId}
                    onChange={(e) => handleChange("animalTagId", e.target.value)}
                    placeholder="G001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccineName">{t("vaccineName")} *</Label>
                  <Input
                    id="vaccineName"
                    value={formData.vaccineName}
                    onChange={(e) => handleChange("vaccineName", e.target.value)}
                    placeholder="CDT Vaccine"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">{t("manufacturer")}</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange("manufacturer", e.target.value)}
                    placeholder="Zoetis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">{t("batchNumber")}</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleChange("batchNumber", e.target.value)}
                    placeholder="ZT2024001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccinationType">{t("vaccinationType")} *</Label>
                  <Select
                    value={formData.vaccinationType}
                    onValueChange={(value) => handleChange("vaccinationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">{t("dosage")} *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => handleChange("dosage", e.target.value)}
                    placeholder="2ml"
                    required
                  />
                </div>
              </div>

              {/* Administration Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Administration Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="administrationRoute">{t("administrationRoute")} *</Label>
                  <Select
                    value={formData.administrationRoute}
                    onValueChange={(value) => handleChange("administrationRoute", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {routeOptions.map((route) => (
                        <SelectItem key={route} value={route}>
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="administeredBy">{t("administeredBy")}</Label>
                  <Input
                    id="administeredBy"
                    value={formData.administeredBy}
                    onChange={(e) => handleChange("administeredBy", e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentDate">{t("treatmentDate")} *</Label>
                  <Input
                    id="treatmentDate"
                    type="date"
                    value={formData.treatmentDate}
                    onChange={(e) => handleChange("treatmentDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{t("expiryDate")}</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange("expiryDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">{t("nextDueDate")}</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => handleChange("nextDueDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">{t("cost")}</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Side Effects */}
            <div className="space-y-2">
              <Label htmlFor="sideEffects">{t("sideEffects")}</Label>
              <Textarea
                id="sideEffects"
                value={formData.sideEffects}
                onChange={(e) => handleChange("sideEffects", e.target.value)}
                placeholder="Any observed side effects..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/vaccinations">
                <Button variant="outline">{t("cancel")}</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
