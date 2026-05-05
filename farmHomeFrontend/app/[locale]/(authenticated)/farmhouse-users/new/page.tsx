"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { config } from "@/config"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

export default function AddFarmhouseUserPage() {
  const t = useTranslations('FarmhouseUsersNewPage')
  const router = useRouter()
  const searchParams = useSearchParams()
  // Get adminId from query or localStorage
  let adminId = searchParams.get("adminId") || ""
  if (!adminId && typeof window !== 'undefined') {
    const idRaw = localStorage.getItem("id") || ""
    try { adminId = JSON.parse(idRaw) } catch { adminId = idRaw }
    if (typeof adminId === "string") adminId = adminId.replace(/^"+|"+$/g, "")
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    role: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (role: string) => {
    setForm({ ...form, role })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.location || !form.role) {
      setError(t('allFieldsRequiredError'))
      return
    }
    if (form.password !== form.confirmPassword) {
      setError(t('passwordsNoMatchError'))
      return
    }
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      // Create user
      const createUrl = form.role === "manager"
        ? `${config.backendUrl}/auth/create-manager`
        : `${config.backendUrl}/auth/create-assistant`
      const res = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          location: form.location
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user")
      // Link user to FarmhouseUsers
      const userId = data.user?._id
      if (!userId) throw new Error("User ID not returned from create user API")
      const linkUrl = form.role === "manager"
        ? `${config.backendUrl}/farmhouse-users/${adminId}/manager`
        : `${config.backendUrl}/farmhouse-users/${adminId}/assistant`
      const linkRes = await fetch(linkUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          managerId: form.role === "manager" ? userId : undefined,
          assistantId: form.role === "assistant" ? userId : undefined
        })
      })
      const linkData = await linkRes.json()
      if (!linkRes.ok) throw new Error(linkData.error || "Failed to link user to FarmhouseUsers")
      setSuccess(t('userCreatedSuccess'))
      setTimeout(() => router.push("/farmhouse-users"), 1200)
    } catch (err: any) {
      setError(err.message || t('errorCreatingUser'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/farmhouse-users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToFarmhouseUsers')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('userInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block font-medium">{t('name')}</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
                <label className="block font-medium">{t('email')}</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required />
                <label className="block font-medium">{t('password')}</label>
                <Input name="password" type="password" value={form.password} onChange={handleChange} required />
                <label className="block font-medium">{t('confirmPassword')}</label>
                <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
              <div className="space-y-4">
                <label className="block font-medium">{t('phone')}</label>
                <Input name="phone" value={form.phone} onChange={handleChange} required />
                <label className="block font-medium">{t('location')}</label>
                <Input name="location" value={form.location} onChange={handleChange} required />
                <label className="block font-medium">{t('role')}</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="role" value="manager" checked={form.role === "manager"} onChange={() => handleRoleChange("manager")} required />
                    <span>{t('manager')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="role" value="assistant" checked={form.role === "assistant"} onChange={() => handleRoleChange("assistant")} required />
                    <span>{t('assistant')}</span>
                  </label>
                </div>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <div className="flex justify-end gap-4 mt-4">
              <Link href="/farmhouse-users"><Button variant="outline" type="button">{t('cancel')}</Button></Link>
              <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('addUser')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 