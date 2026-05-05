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

export default function NewHealthRecordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    animalTagId: "",
    healthIssue: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    veterinarian: "",
    treatmentDate: "",
    followUpDate: "",
    severity: "",
    cost: "",
    status: "Pending",
    notes: "",
  })

  const severityOptions = ["Critical", "Moderate", "Mild"]
  const statusOptions = ["Resolved", "Pending", "In Progress"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${config.backendUrl}/health-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success(t('recordAdded'))
        router.push('/health')
      } else {
        const error = await res.json().catch(() => ({}))
        toast.error(error?.message || 'Failed to create health record')
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
        <Link href="/health">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backTo")} {t("healthRecords")}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("addHealthRecord")}</h1>
          <p className="text-gray-600">{t("healthRecordInformation")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("healthRecordInformation")}</CardTitle>
          <CardDescription>Fill in all the required information for the health record</CardDescription>
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
                  <Label htmlFor="healthIssue">{t("healthIssue")} *</Label>
                  <Input
                    id="healthIssue"
                    value={formData.healthIssue}
                    onChange={(e) => handleChange("healthIssue", e.target.value)}
                    placeholder="Respiratory infection"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">{t("symptoms")}</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => handleChange("symptoms", e.target.value)}
                    placeholder="Describe observed symptoms..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">{t("diagnosis")}</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => handleChange("diagnosis", e.target.value)}
                    placeholder="Professional diagnosis..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">{t("severity")} *</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleChange("severity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {severity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Treatment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Treatment Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="treatment">{t("treatment")} *</Label>
                  <Textarea
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) => handleChange("treatment", e.target.value)}
                    placeholder="Treatment administered..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="veterinarian">{t("veterinarian")}</Label>
                  <Input
                    id="veterinarian"
                    value={formData.veterinarian}
                    onChange={(e) => handleChange("veterinarian", e.target.value)}
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
                  <Label htmlFor="followUpDate">{t("followUpDate")}</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleChange("followUpDate", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")} *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <Link href="/health">
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
