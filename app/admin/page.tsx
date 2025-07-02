import Link from "next/link"
import { ArrowLeft, Users, Settings, Database, Wrench, Briefcase } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isDatabaseConfigured } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import AdminClient from "./admin-client"
import SkillsAdminClient from "./skills-admin-client"
import JobRolesAdminClient from "./job-roles-admin-client"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const dbConfigured = isDatabaseConfigured()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
            <Settings className="w-4 h-4 text-white" />
            <span className="text-white text-sm">/ Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!dbConfigured && (
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Database is not configured. All operations are simulated for demonstration
              purposes. To enable full functionality, configure the DATABASE_URL environment variable.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Skills & Demonstrations
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminClient />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Skills & Demonstrations Management
                </CardTitle>
                <CardDescription>Manage master skills, skill demonstrations, and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillsAdminClient />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Job Roles Management
                </CardTitle>
                <CardDescription>Manage job roles, departments, and skill assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <JobRolesAdminClient />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
