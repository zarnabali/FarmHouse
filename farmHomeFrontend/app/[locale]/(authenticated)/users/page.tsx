"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Settings,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  AlertTriangle,
} from "lucide-react"
import { useLanguage } from "@/app/[locale]/providers"

// Mock user data
const users = [
  {
    id: "U001",
    name: "John Smith",
    email: "john.smith@farm.com",
    phone: "+1 (555) 123-4567",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-25 15:30",
    createdDate: "2023-06-15",
    permissions: ["all"],
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Management",
    location: "Main Office",
    devices: 2,
    sessions: 1,
  },
  {
    id: "U002",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@farm.com",
    phone: "+1 (555) 234-5678",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-25 14:20",
    createdDate: "2023-08-22",
    permissions: ["health", "animals", "reports"],
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Veterinary",
    location: "Clinic",
    devices: 1,
    sessions: 1,
  },
  {
    id: "U003",
    name: "Mike Wilson",
    email: "mike.wilson@farm.com",
    phone: "+1 (555) 345-6789",
    role: "assistant",
    status: "inactive",
    lastLogin: "2024-01-20 09:15",
    createdDate: "2023-11-10",
    permissions: ["animals", "maintenance"],
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Operations",
    location: "Field",
    devices: 1,
    sessions: 0,
  },
]

const roles = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access and user management",
    permissions: ["all"],
    userCount: 1,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access to most features",
    permissions: ["users", "animals", "health", "breeding", "maintenance", "reports"],
    userCount: 3,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Management access to operational features",
    permissions: ["animals", "health", "breeding", "reports"],
    userCount: 5,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "assistant",
    name: "Assistant",
    description: "Limited access to basic features",
    permissions: ["animals", "maintenance"],
    userCount: 8,
    color: "bg-gray-100 text-gray-800",
  },
]

const permissions = [
  { id: "animals", name: "Animal Management", description: "Manage animal records and data" },
  { id: "health", name: "Health Records", description: "Access health and medical records" },
  { id: "breeding", name: "Breeding Management", description: "Manage breeding activities" },
  { id: "maintenance", name: "Maintenance", description: "Equipment and facility maintenance" },
  { id: "reports", name: "Reports & Analytics", description: "Generate and view reports" },
  { id: "users", name: "User Management", description: "Manage users and permissions" },
  { id: "settings", name: "System Settings", description: "Configure system settings" },
]

const activityLogs = [
  {
    id: "A001",
    user: "John Smith",
    action: "Created new animal record",
    resource: "Animal G001",
    timestamp: "2024-01-25 15:45",
    ip: "192.168.1.100",
    device: "Desktop",
  },
  {
    id: "A002",
    user: "Dr. Sarah Johnson",
    action: "Updated health record",
    resource: "Health Record H045",
    timestamp: "2024-01-25 14:30",
    ip: "192.168.1.101",
    device: "Mobile",
  },
  {
    id: "A003",
    user: "Mike Wilson",
    action: "Logged in",
    resource: "System",
    timestamp: "2024-01-25 09:15",
    ip: "192.168.1.102",
    device: "Tablet",
  },
]

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { t } = useLanguage()

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    const roleConfig = roles.find((r) => r.id === role)
    return roleConfig?.color || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("users")}</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Link href="/users/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "active").length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.sessions > 0).length}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Users</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.devices > 0).length}</p>
              </div>
              <Smartphone className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.lastLogin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{user.sessions}</span>
                          {user.sessions > 0 && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            {user.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage user roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                      <Badge variant="outline">{role.userCount} users</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Available system permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>User activity and system access logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.device}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure system security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-gray-500">Enforce strong passwords</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-500">Auto-logout inactive users</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Restrictions</Label>
                    <p className="text-sm text-gray-500">Restrict access by IP address</p>
                  </div>
                  <Switch />
                </div>

                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Input id="max-attempts" type="number" defaultValue="5" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Recent security events and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: "warning",
                    message: "Multiple failed login attempts from IP 192.168.1.200",
                    time: "2 hours ago",
                  },
                  {
                    type: "info",
                    message: "New device registered for user John Smith",
                    time: "1 day ago",
                  },
                  {
                    type: "success",
                    message: "Security audit completed successfully",
                    time: "3 days ago",
                  },
                ].map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 ${
                        alert.type === "warning"
                          ? "text-yellow-500"
                          : alert.type === "info"
                            ? "text-blue-500"
                            : "text-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
