"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Wrench, Briefcase } from "lucide-react"
import UsersAdminClient from "./users-admin-client"
import SkillsAdminClient from "./skills-admin-client"
import JobRolesAdminClient from "./job-roles-admin-client"

export default function AdminClient() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage users, skills, demonstrations, and job roles</p>
      </div>

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
            Job Roles & Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersAdminClient />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsAdminClient />
        </TabsContent>

        <TabsContent value="roles">
          <JobRolesAdminClient />
        </TabsContent>
      </Tabs>
    </div>
  )
}
