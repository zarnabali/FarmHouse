"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Baby, AlertTriangle } from "lucide-react"
import { config } from "@/config"
import { useTranslations } from 'next-intl';

const animalTypes = [
  { value: "Cow", label: "Cow" },
  { value: "Goat", label: "Goat" },
  { value: "Sheep", label: "Sheep" },
  { value: "Chicken", label: "Chicken" },
  { value: "Duck", label: "Duck" },
  { value: "Turkey", label: "Turkey" },
  { value: "Rabbit", label: "Rabbit" },
  { value: "Pig", label: "Pig" },
  { value: "Horse", label: "Horse" },
]

export default function BreedingRecommendationPage() {
  const t = useTranslations('BreedingRecommendationPage');
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedSire, setSelectedSire] = useState<string>("")
  const [selectedDam, setSelectedDam] = useState<string>("")

  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${config.backendUrl}/animals?page=1&limit=1000`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        if (!res.ok) throw new Error('Failed to fetch animals')
        const data = await res.json()
        setAnimals(Array.isArray(data.animals) ? data.animals : data.records || [])
      } catch (err) {
        setError('Error fetching animals')
      } finally {
        setLoading(false)
      }
    }
    fetchAnimals()
  }, [])

  // Filter animals by selected type
  const eligibleSires = animals.filter(a => a.gender === "Male" && a.breed === selectedType)
  const eligibleDams = animals.filter(a => a.gender === "Female" && a.breed === selectedType)

  const selectedSireObj = eligibleSires.find(a => a.tagId === selectedSire)
  const selectedDamObj = eligibleDams.find(a => a.tagId === selectedDam)

  // Calculate estimated delivery (example: 150 days for goats, 280 for cows, etc.)
  function getEstimatedDeliveryDays(type: string) {
    switch (type) {
      case "Goat": return 150
      case "Sheep": return 150
      case "Cow": return 280
      case "Pig": return 115
      case "Horse": return 340
      case "Rabbit": return 31
      case "Chicken": return 21
      case "Duck": return 28
      case "Turkey": return 28
      default: return 150
    }
  }

  const today = new Date()
  const estimatedDelivery = selectedType && selectedSire && selectedDam
    ? new Date(today.getTime() + getEstimatedDeliveryDays(selectedType) * 24 * 60 * 60 * 1000)
    : null

  const geneticWarning = selectedSireObj && selectedDamObj && (
    selectedSireObj.sireId === selectedDamObj.sireId ||
    selectedSireObj.damId === selectedDamObj.damId
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Baby className="h-7 w-7 text-blue-600" />
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('step1Title')}</CardTitle>
          <CardDescription>{t('step1Desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder={t('selectAnimalType')} />
            </SelectTrigger>
            <SelectContent>
              {animalTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('step2Title')}</CardTitle>
              <CardDescription>{t('step2Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleSires.length === 0 ? (
                <div className="text-gray-400">{t('noEligibleSires')}</div>
              ) : (
                <Select value={selectedSire} onValueChange={setSelectedSire}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectSire')} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleSires.map(sire => (
                      <SelectItem key={sire.tagId} value={sire.tagId}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{sire.tagId}</span>
                          <span className="text-xs text-gray-500">{t('dob')}: {sire.dob?.slice(0,10)} | {t('weight')}: {sire.weight}kg</span>
                          <span className="text-xs text-gray-500">{t('condition')}: <Badge variant={sire.condition === "Excellent" ? "default" : "secondary"}>{sire.condition}</Badge></span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('step3Title')}</CardTitle>
              <CardDescription>{t('step3Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleDams.length === 0 ? (
                <div className="text-gray-400">{t('noEligibleDams')}</div>
              ) : (
                <Select value={selectedDam} onValueChange={setSelectedDam}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectDam')} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleDams.map(dam => (
                      <SelectItem key={dam.tagId} value={dam.tagId}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{dam.tagId}</span>
                          <span className="text-xs text-gray-500">{t('dob')}: {dam.dob?.slice(0,10)} | {t('weight')}: {dam.weight}kg</span>
                          <span className="text-xs text-gray-500">{t('condition')}: <Badge variant={dam.condition === "Excellent" ? "default" : "secondary"}>{dam.condition}</Badge></span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedType && selectedSire && selectedDam && (
        <Card>
          <CardHeader>
            <CardTitle>{t('summaryTitle')}</CardTitle>
            <CardDescription>{t('summaryDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSire === selectedDam ? (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <AlertTriangle className="h-5 w-5" />
                {t('sameAnimalError')}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="font-semibold">{t('sire')}</div>
                    <div className="flex items-center gap-2">
                      <Badge>{selectedSireObj?.tagId}</Badge>
                      <span className="text-xs text-gray-500">{t('breed')}: {selectedSireObj?.breed}</span>
                      <span className="text-xs text-gray-500">{t('dob')}: {selectedSireObj?.dob?.slice(0,10)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{t('dam')}</div>
                    <div className="flex items-center gap-2">
                      <Badge>{selectedDamObj?.tagId}</Badge>
                      <span className="text-xs text-gray-500">{t('breed')}: {selectedDamObj?.breed}</span>
                      <span className="text-xs text-gray-500">{t('dob')}: {selectedDamObj?.dob?.slice(0,10)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-blue-600" />
                  <span>{t('estimatedDelivery')}: <span className="font-semibold">{estimatedDelivery?.toISOString().slice(0,10)}</span></span>
                </div>
                {geneticWarning && (
                  <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                    <AlertTriangle className="h-5 w-5" />
                    {t('geneticWarning')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 