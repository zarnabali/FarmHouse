"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { languages, type LanguageCode, type TranslationKey } from "@/lib/languages"
import { usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "manager" | "assistant"
  language: LanguageCode
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateLanguage: (language: LanguageCode) => void
  isLoading: boolean
}

interface LanguageContextType {
  currentLanguage: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: TranslationKey) => string
  availableLanguages: Array<{ code: LanguageCode; name: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

function LanguageProvider({
  children,
  initialLanguage = "en",
}: { children: React.ReactNode; initialLanguage?: LanguageCode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(initialLanguage)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Extract locale from the URL
    const segments = pathname.split("/")
    const urlLocale = segments[1]
    const isValidLocale = (code: string): code is LanguageCode => Object.keys(languages).includes(code)
    if (urlLocale && isValidLocale(urlLocale)) {
      setCurrentLanguage(urlLocale)
      localStorage.setItem("farm-home-language", urlLocale)
    } else {
      // fallback to saved or initial
      const savedLanguage = localStorage.getItem("farm-home-language") as LanguageCode
      if (savedLanguage && languages[savedLanguage]) {
        setCurrentLanguage(savedLanguage)
      } else {
        setCurrentLanguage(initialLanguage)
      }
    }
  }, [pathname, initialLanguage])

  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language)
    localStorage.setItem("farm-home-language", language)
  }

  const t = (key: TranslationKey): string => {
    return languages[currentLanguage]?.translations[key] || languages.en.translations[key] || key
  }

  const availableLanguages = Object.values(languages).map((lang) => ({
    code: lang.code as LanguageCode,
    name: lang.name,
  }))

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("farm-home-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get saved language or default to English
    const savedLanguage = (localStorage.getItem("farm-home-language") as LanguageCode) || "en"

    // Mock user data based on email
    const mockUser: User = {
      id: "1",
      name: email.includes("admin") ? "Admin User" : "Farm Manager",
      email,
      role: email.includes("super")
        ? "super_admin"
        : email.includes("admin")
          ? "admin"
          : email.includes("manager")
            ? "manager"
            : "assistant",
      language: savedLanguage,
    }

    setUser(mockUser)
    localStorage.setItem("farm-home-user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("farm-home-user")
  }

  const updateLanguage = (language: LanguageCode) => {
    if (user) {
      const updatedUser = { ...user, language }
      setUser(updatedUser)
      localStorage.setItem("farm-home-user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateLanguage, isLoading }}>
      <LanguageProvider initialLanguage={user?.language || "en"}>{children}</LanguageProvider>
    </AuthContext.Provider>
  )
}
