"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Activity, Download, RefreshCw, Heart } from "lucide-react"
import { useLanguage } from "@/app/[locale]/providers"

// Mock analytics data
const healthTrendData = [
  { month: "Jan", incidents: 12, treatments: 45, vaccinations: 89 },
  { month: "Feb", incidents: 8, treatments: 38, vaccinations: 76 },
  { month: "Mar", incidents: 15, treatments: 52, vaccinations: 92 },
  { month: "Apr", incidents: 6, treatments: 29, vaccinations: 68 },
  { month: "May", incidents: 10, treatments: 41, vaccinations: 85 },
  { month: "Jun", incidents: 4, treatments: 22, vaccinations: 71 },
]

const breedingPerformanceData = [
  { quarter: "Q1", successful: 85, failed: 15, inProgress: 25 },
  { quarter: "Q2", successful: 92, failed: 8, inProgress: 30 },
  { quarter: "Q3", successful: 78, failed: 22, inProgress: 18 },
  { quarter: "Q4", successful: 88, failed: 12, inProgress: 22 },
]

const costAnalysisData = [
  { category: "Feed", amount: 15420, percentage: 45 },
  { category: "Healthcare", amount: 8960, percentage: 26 },
  { category: "Maintenance", amount: 4580, percentage: 13 },
  { category: "Labor", amount: 3890, percentage: 11 },
  { category: "Other", amount: 1650, percentage: 5 },
]

const productivityMetrics = [
  { metric: "Milk Production", value: "2,450L", change: "+12%", trend: "up" },
  { metric: "Weight Gain", value: "1.2kg/day", change: "+8%", trend: "up" },
  { metric: "Feed Conversion", value: "3.2:1", change: "-5%", trend: "down" },
  { metric: "Mortality Rate", value: "2.1%", change: "-15%", trend: "down" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedMetric, setSelectedMetric] = useState("all")
  const { t } = useLanguage()

  const kpiCards = [
    {
      title: "Total Revenue",
      value: "$124,580",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Animals",
      value: "1,247",
      change: "+3.2%",
      trend: "up",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Health Score",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "Efficiency Rate",
      value: "87.5%",
      change: "-1.2%",
      trend: "down",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("analytics")}</h1>
          <p className="text-gray-600">{t("dashboardAnalytics")}</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>{kpi.change}</span>
                <span className="ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Analytics</TabsTrigger>
          <TabsTrigger value="breeding">Breeding Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
                <CardDescription>Monthly health incidents and treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={healthTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="treatments" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="vaccinations" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Operational cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costAnalysisData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {costAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Current productivity metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {productivityMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-600">{metric.metric}</h4>
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className={`text-sm ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {metric.change} from last period
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Incident Trends</CardTitle>
                <CardDescription>Monthly health incidents by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={healthTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="incidents" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Effectiveness</CardTitle>
                <CardDescription>Success rates by treatment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { treatment: "Antibiotics", success: 94, total: 156 },
                    { treatment: "Vaccinations", success: 98, total: 234 },
                    { treatment: "Surgery", success: 87, total: 23 },
                    { treatment: "Preventive Care", success: 96, total: 189 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.treatment}</div>
                        <div className="text-sm text-gray-500">{item.total} treatments</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.success}%</div>
                        <div className="text-sm text-gray-500">success rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breeding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Breeding Performance</CardTitle>
              <CardDescription>Quarterly breeding success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={breedingPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successful" fill="#10b981" />
                  <Bar dataKey="failed" fill="#ef4444" />
                  <Bar dataKey="inProgress" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { month: "Jan", revenue: 45000, expenses: 32000 },
                      { month: "Feb", revenue: 52000, expenses: 35000 },
                      { month: "Mar", revenue: 48000, expenses: 33000 },
                      { month: "Apr", revenue: 61000, expenses: 38000 },
                      { month: "May", revenue: 55000, expenses: 36000 },
                      { month: "Jun", revenue: 67000, expenses: 41000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margins</CardTitle>
                <CardDescription>Monthly profit margin trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: "Jan", margin: 28.9 },
                      { month: "Feb", margin: 32.7 },
                      { month: "Mar", margin: 31.3 },
                      { month: "Apr", margin: 37.7 },
                      { month: "May", margin: 34.5 },
                      { month: "Jun", margin: 38.8 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Margin"]} />
                    <Line type="monotone" dataKey="margin" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feed Efficiency</CardTitle>
                <CardDescription>Feed conversion ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3.2:1</div>
                <div className="text-sm text-green-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  5% improvement
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
                <CardDescription>Average daily weight gain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2kg</div>
                <div className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  8% increase
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mortality Rate</CardTitle>
                <CardDescription>Current mortality percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.1%</div>
                <div className="text-sm text-green-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  15% reduction
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
