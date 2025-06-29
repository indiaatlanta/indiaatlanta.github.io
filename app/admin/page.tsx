import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Building2, Target, Activity, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                <Image
                  src="/images/hs1-logo.png"
                  alt="Henry Schein One"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Career Matrix Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">← Back to Site</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Skill definitions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Changes this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="roles">Job Roles</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Engineering", slug: "engineering", color: "#3B82F6", roles: 8 },
                { name: "Product", slug: "product", color: "#10B981", roles: 5 },
                { name: "Design", slug: "design", color: "#8B5CF6", roles: 4 },
                { name: "Marketing", slug: "marketing", color: "#F59E0B", roles: 6 },
                { name: "Sales", slug: "sales", color: "#EF4444", roles: 7 },
                { name: "Operations", slug: "operations", color: "#6B7280", roles: 5 },
              ].map((dept) => (
                <Card key={dept.slug}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{dept.name}</CardTitle>
                    <CardDescription>{dept.roles} roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/department/${dept.slug}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        View Department
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Job Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Job Roles</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Roles</CardTitle>
                <CardDescription>Manage job roles across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Senior Software Engineer", department: "Engineering", level: "Senior", skills: 18 },
                    { title: "Product Manager II", department: "Product", level: "Mid", skills: 15 },
                    { title: "UX Designer", department: "Design", level: "Mid", skills: 12 },
                    { title: "Marketing Manager", department: "Marketing", level: "Mid", skills: 14 },
                  ].map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{role.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{role.department}</span>
                          <Badge variant="outline">{role.level}</Badge>
                          <span>{role.skills} skills</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Skills Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Skills by Category</CardTitle>
                <CardDescription>Manage skills and their categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { category: "Technical Skills", color: "blue", count: 15 },
                    { category: "Delivery", color: "green", count: 8 },
                    { category: "Communication & Collaboration", color: "purple", count: 10 },
                    { category: "Leadership", color: "indigo", count: 7 },
                    { category: "Strategic Impact", color: "orange", count: 5 },
                  ].map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full bg-${cat.color}-500`} />
                        <div>
                          <h3 className="font-medium">{cat.category}</h3>
                          <p className="text-sm text-gray-500">{cat.count} skills</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track changes and system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "CREATE", table: "job_roles", user: "admin@henryschein.com", time: "2 hours ago" },
                    { action: "UPDATE", table: "skills_master", user: "admin@henryschein.com", time: "4 hours ago" },
                    {
                      action: "DELETE",
                      table: "demonstration_templates",
                      user: "admin@henryschein.com",
                      time: "1 day ago",
                    },
                    { action: "CREATE", table: "departments", user: "admin@henryschein.com", time: "2 days ago" },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={log.action === "DELETE" ? "destructive" : "default"}>{log.action}</Badge>
                        <div>
                          <h3 className="font-medium">{log.table}</h3>
                          <p className="text-sm text-gray-500">by {log.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Building2 className="w-6 h-6" />
                <span>Bulk Import Roles</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Target className="w-6 h-6" />
                <span>Export Skills Matrix</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Users className="w-6 h-6" />
                <span>User Management</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Status:</strong> All services are operational. Last backup completed 2 hours ago.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
