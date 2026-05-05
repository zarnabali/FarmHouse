"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { config } from "@/config"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl';
import UserAutocomplete, { UserOption } from "@/components/UserAutocomplete";

export default function NewFarmhousePage() {
  const t = useTranslations('FarmhouseNewPage');
  const [form, setForm] = useState({ name: "", manager: null as UserOption | null, assistants: [] as UserOption[], location: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [managerOptions, setManagerOptions] = useState<UserOption[]>([])
  const [assistantOptions, setAssistantOptions] = useState<UserOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch all managers and assistants for this admin
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const adminIdRaw = typeof window !== 'undefined' ? localStorage.getItem('id') : null
        let cleanId = adminIdRaw
        try { cleanId = JSON.parse(adminIdRaw!) } catch { cleanId = adminIdRaw }
        if (typeof cleanId === "string") cleanId = cleanId.replace(/^"+|"+$/g, "")
        // Get farmhouse users for this admin only (admin route)
        const res = await fetch(`${config.backendUrl}/farmhouse-users/${cleanId}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch users')
        const doc = await res.json()
        const managerIds = (doc?.managers || []).map((u: any) => typeof u === 'string' ? u : u._id)
        const assistantIds = (doc?.assistants || []).map((u: any) => typeof u === 'string' ? u : u._id)
        // Fetch user details for each
        const fetchUser = async (id: string) => {
          const res = await fetch(`${config.backendUrl}/auth/user/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          if (!res.ok) return null
          const user = await res.json()
          return { _id: user._id, name: user.name, email: user.email }
        }
        const managerOpts = (await Promise.all(managerIds.map(fetchUser))).filter(Boolean) as UserOption[]
        const assistantOpts = (await Promise.all(assistantIds.map(fetchUser))).filter(Boolean) as UserOption[]
        setManagerOptions(managerOpts)
        setAssistantOptions(assistantOpts)
      } catch {
        setManagerOptions([])
        setAssistantOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${config.backendUrl}/farmhouse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          Name: form.name,
          manager_id: form.manager?._id || "",
          assistants: form.assistants.map(a => a._id),
          location: form.location
        })
      })
      if (!res.ok) throw new Error(t('errorFailedCreate'))
      router.push("/farmhouse")
    } catch (err) {
      alert(t('errorCreatingFarmhouse'))
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/farmhouse">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToFarmhouses')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('addNewFarmhouse')}</h1>
          <p className="text-gray-600">{t('createNewFarmhouseRecord')}</p>
        </div>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('farmhouseInformation')}</CardTitle>
          <CardDescription>{t('fillRequiredInfo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('farmhouseNamePlaceholder')} required />
                <Label htmlFor="manager">{t('managerId')}</Label>
                <UserAutocomplete
                  options={managerOptions}
                  value={form.manager}
                  onChange={v => setForm(f => ({ ...f, manager: v as UserOption }))}
                  multi={false}
                  required
                  placeholder="Search manager by name, email, or ID..."
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="assistants">{t('assistants')}</Label>
                <UserAutocomplete
                  options={assistantOptions}
                  value={form.assistants}
                  onChange={v => setForm(f => ({ ...f, assistants: v as UserOption[] }))}
                  multi
                  required={false}
                  placeholder="Search assistants by name, email, or ID..."
                />
                <Label htmlFor="location">{t('location')}</Label>
                <Input id="location" name="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder={t('locationPlaceholder')} />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Link href="/farmhouse">
                <Button variant="outline">{t('cancel')}</Button>
              </Link>
              <Button type="submit" disabled={formLoading || loadingOptions}>
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('addFarmhouse')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 