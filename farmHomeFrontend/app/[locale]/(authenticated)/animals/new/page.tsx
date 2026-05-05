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
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { X } from "lucide-react"
import { config } from "@/config"
import { useEffect } from "react"

export default function NewAnimalPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    tagId: "",
    breed: "",
    gender: "",
    dob: "",
    photos: [] as string[],
    origin: "",
    weight: "",
    condition: "",
    acquisitionType: "",
    acquisitionDate: "",
    sireId: "",
    damId: "",
    farmhouse: "",
    status: "Active",
    notes: "",
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [farmhouses, setFarmhouses] = useState<{ _id?: string, f_id: string, Name: string }[]>([])
  const [farmhouseLoading, setFarmhouseLoading] = useState(true)

  useEffect(() => {
    const fetchFarmhouses = async () => {
      setFarmhouseLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${config.backendUrl}/farmhouse`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        const data = await res.json()
        setFarmhouses(Array.isArray(data.farmhouses) ? data.farmhouses : data)
      } catch (err) {
        setFarmhouses([])
      } finally {
        setFarmhouseLoading(false)
      }
    }
    fetchFarmhouses()
  }, [])

  const conditions = ["Excellent", "Good", "Fair", "Poor"]
  const acquisitionTypes = ["Birth", "Purchase", "Gift", "Trade"]
  const statusOptions = ["Alive", "Dead"]

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)
    const token = localStorage.getItem("token")
    for (const file of files) {
      const formDataImg = new FormData()
      formDataImg.append("image", file)
      try {
        const res = await fetch(`${config.backendUrl}/auth/upload-image`, {
          method: "POST",
          body: formDataImg,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          console.log(data)
          if (data?.image_url) {
            setFormData((prev) => ({ ...prev, photos: [...prev.photos, data.image_url] }))
            console.log(formData.photos)
          }
        } else {
          // Optionally handle error
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    setUploading(false)
    // Reset file input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${config.backendUrl}/animals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        console.log("Animal created successfully")
        router.push("/animals")
      } else {
        const error = await res.json().catch(() => ({}))
        console.error("Failed to create animal:", error)
        // Optionally show error message to user
      }
    } catch (err) {
      console.error("Network error:", err)
      // Optionally show error message to user
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
        <Link href="/animals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Animals
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Animal</h1>
          <p className="text-gray-600">Create a new animal record</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Animal Information</CardTitle>
          <CardDescription>Fill in all the required information for the new animal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="tagId">Tag ID *</Label>
                  <Input
                    id="tagId"
                    value={formData.tagId}
                    onChange={(e) => handleChange("tagId", e.target.value)}
                    placeholder="G001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => handleChange("breed", e.target.value)}
                    placeholder="Breed"
                  />
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="45.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => handleChange("origin", e.target.value)}
                    placeholder="Farm name or location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acquisitionType">Acquisition Type *</Label>
                  <Select
                    value={formData.acquisitionType}
                    onValueChange={(value) => handleChange("acquisitionType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select acquisition type" />
                    </SelectTrigger>
                    <SelectContent>
                      {acquisitionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
                  <Input
                    id="acquisitionDate"
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sireId">Sire ID</Label>
                  <Input
                    id="sireId"
                    value={formData.sireId}
                    onChange={(e) => handleChange("sireId", e.target.value)}
                    placeholder="Father's Tag ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damId">Dam ID</Label>
                  <Input
                    id="damId"
                    value={formData.damId}
                    onChange={(e) => handleChange("damId", e.target.value)}
                    placeholder="Mother's Tag ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmhouse">Farmhouse *</Label>
                  <Select
                    value={formData.farmhouse || ""}
                    onValueChange={(value) => handleChange("farmhouse", value)}
                    disabled={farmhouseLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select farmhouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmhouses.map((fh) => (
                        <SelectItem key={fh._id || fh.f_id} value={fh._id || fh.f_id}>
                          {fh.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photos">Photos</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB. You can add multiple images.</p>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>
              {uploading && <div className="text-sm text-blue-600 mt-2">Uploading...</div>}
              {formData.photos.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium text-sm mb-2">Uploaded Images:</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.photos.map((url, idx) => (
                      <div key={idx} className="relative">
                        <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`Uploaded image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='40' y='45' text-anchor='middle' fill='%236b7280' font-size='12'%3EImage%3C/text%3E%3C/svg%3E"
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about the animal..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/animals">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Animal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
