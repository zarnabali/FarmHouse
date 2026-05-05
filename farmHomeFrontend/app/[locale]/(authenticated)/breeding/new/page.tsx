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


export default function NewBreedingRecordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sireTagId: "",
    damTagId: "",
    breedingDate: "",
    breedingMethod: "",
    expectedDelivery: "",
    actualDelivery: "",
    numberOfOffspring: "",
    status: "In Progress",
    cost: "",
    performedBy: "",
    notes: "",
  })

  const methodOptions = ["Natural Mating", "Artificial Insemination"]
  const statusOptions = ["Successful", "Failed", "In Progress"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${config.backendUrl}/breeding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success(t('recordAdded'))
        router.push('/breeding')
      } else {
        const error = await res.json().catch(() => ({}))
        toast.error(error?.message || 'Failed to create breeding record')
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

  // Calculate expected delivery date (150 days from breeding date for goats)
  const calculateExpectedDelivery = (breedingDate: string) => {
    if (breedingDate) {
      const breeding = new Date(breedingDate)
      const expected = new Date(breeding.getTime() + 150 * 24 * 60 * 60 * 1000)
      return expected.toISOString().split("T")[0]
    }
    return ""
  }

  const handleBreedingDateChange = (date: string) => {
    handleChange("breedingDate", date)
    const expectedDate = calculateExpectedDelivery(date)
    handleChange("expectedDelivery", expectedDate)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/breeding">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backTo")} {t("breeding")}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("addBreedingRecord")}</h1>
          <p className="text-gray-600">{t("breedingInformation")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("breedingInformation")}</CardTitle>
          <CardDescription>Fill in all the required information for the breeding record</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="sireTagId">{t("sireTagId")} *</Label>
                  <Input
                    id="sireTagId"
                    value={formData.sireTagId}
                    onChange={(e) => handleChange("sireTagId", e.target.value)}
                    placeholder="G001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damTagId">{t("damTagId")} *</Label>
                  <Input
                    id="damTagId"
                    value={formData.damTagId}
                    onChange={(e) => handleChange("damTagId", e.target.value)}
                    placeholder="G002"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breedingDate">{t("breedingDate")} *</Label>
                  <Input
                    id="breedingDate"
                    type="date"
                    value={formData.breedingDate}
                    onChange={(e) => handleBreedingDateChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breedingMethod">{t("breedingMethod")} *</Label>
                  <Select
                    value={formData.breedingMethod}
                    onValueChange={(value) => handleChange("breedingMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {methodOptions.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="performedBy">Performed By</Label>
                  <Input
                    id="performedBy"
                    value={formData.performedBy}
                    onChange={(e) => handleChange("performedBy", e.target.value)}
                    placeholder="Farm Manager"
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

              {/* Delivery Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">{t("expectedDelivery")}</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => handleChange("expectedDelivery", e.target.value)}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Automatically calculated (150 days from breeding date)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDelivery">{t("actualDelivery")}</Label>
                  <Input
                    id="actualDelivery"
                    type="date"
                    value={formData.actualDelivery}
                    onChange={(e) => handleChange("actualDelivery", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfOffspring">{t("numberOfOffspring")}</Label>
                  <Input
                    id="numberOfOffspring"
                    type="number"
                    min="0"
                    value={formData.numberOfOffspring}
                    onChange={(e) => handleChange("numberOfOffspring", e.target.value)}
                    placeholder="0"
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
              <Label htmlFor="notes">{t("breedingNotes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional breeding notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/breeding">
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
