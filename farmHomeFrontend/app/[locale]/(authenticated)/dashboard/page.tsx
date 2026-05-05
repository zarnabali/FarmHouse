"use client"

import { useAuth } from "@/app/[locale]/providers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WheatIcon as Sheep, Users, TrendingUp, AlertTriangle, Plus, FileDown } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/app/[locale]/providers"

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user) {
    return <div>Loading...</div>
  }

  const stats = [
    {
      title: t("totalAnimals"),
      value: "247",
      change: "+12 this month",
      icon: Sheep,
      color: "text-green-600",
    },
    {
      title: t("breedingSuccessRate"),
      value: "87%",
      change: "+5% from last quarter",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: t("healthIncidents"),
      value: "3",
      change: "-2 from last month",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: t("activeUsers"),
      value: "12",
      change: "+2 this week",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("dashboard")}</h1>
          <p className="text-gray-600">
            {t("welcomeBack")}, {user.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            {t("exportReport")}
          </Button>
          <Link href="/animals/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("addAnimal")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("populationByBreed")}</CardTitle>
            <CardDescription>{t("distributionOfAnimals")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { breed: "Boer", count: 89, percentage: 36 },
                { breed: "Nubian", count: 67, percentage: 27 },
                { breed: "Kiko", count: 45, percentage: 18 },
                { breed: "Spanish", count: 46, percentage: 19 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">{item.breed}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivities")}</CardTitle>
            <CardDescription>{t("latestFarmActivities")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New animal added", details: "Boer goat #G247", time: "2 hours ago" },
                { action: "Vaccination completed", details: "15 animals vaccinated", time: "1 day ago" },
                { action: "Health incident reported", details: "Animal #G234 - Minor injury", time: "2 days ago" },
                { action: "Breeding record updated", details: "Successful mating recorded", time: "3 days ago" },
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.details}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>{t("aiRecommendations")}</CardTitle>
          <CardDescription>{t("suggestedActions")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600">{t("breedingOpportunity")}</h4>
              <p className="text-sm text-gray-600 mt-1">{t("optimalForBreeding")}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600">{t("healthCheckDue")}</h4>
              <p className="text-sm text-gray-600 mt-1">{t("animalsDueForCheckups")}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-orange-600">{t("cullingSuggestion")}</h4>
              <p className="text-sm text-gray-600 mt-1">{t("considerCulling")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
