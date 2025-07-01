"use client"

import Link from "next/link"
import { ArrowLeft, Users, Settings, Database, UserPlus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isDatabaseConfigured } from "@/lib/db"
import Image from "next/image"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

async function loadUsers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error("Error loading users:", error)
    return []
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  const users = await loadUsers()
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
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                  </div>
                  <UserCreateForm />
                </div>
              </CardHeader>
              <CardContent>
                <UserTable users={users} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function UserCreateForm() {
  return (
    <div className="space-y-4">
      <Button
        className="flex items-center gap-2"
        onClick={() => {
          const dialog = document.getElementById("create-user-dialog") as HTMLDialogElement
          dialog?.showModal()
        }}
      >
        <UserPlus className="w-4 h-4" />
        Add User
      </Button>

      <dialog id="create-user-dialog" className="p-6 rounded-lg shadow-lg max-w-md w-full">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const data = {
              name: formData.get("name"),
              email: formData.get("email"),
              role: formData.get("role"),
              password: formData.get("password"),
            }

            try {
              const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              })

              if (response.ok) {
                window.location.reload()
              } else {
                const error = await response.json()
                alert(error.error || "Failed to create user")
              }
            } catch (error) {
              alert("Failed to create user")
            }
          }}
        >
          <h3 className="text-lg font-semibold">Create New User</h3>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" name="password" type="password" required minLength={6} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  const icon = e.currentTarget.querySelector("svg")
                  if (input.type === "password") {
                    input.type = "text"
                    icon?.classList.add("hidden")
                    e.currentTarget.querySelector(".eye-off")?.classList.remove("hidden")
                  } else {
                    input.type = "password"
                    icon?.classList.remove("hidden")
                    e.currentTarget.querySelector(".eye-off")?.classList.add("hidden")
                  }
                }}
              >
                <Eye className="w-4 h-4" />
                <EyeOff className="w-4 h-4 hidden eye-off" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Create User</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const dialog = document.getElementById("create-user-dialog") as HTMLDialogElement
                dialog?.close()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

function UserTable({ users }: { users: any[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-left p-4 font-medium">Last Login</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </td>
                <td className="p-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td>
                <td className="p-4">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Populate edit form
                        const dialog = document.getElementById("edit-user-dialog") as HTMLDialogElement
                        const form = dialog?.querySelector("form") as HTMLFormElement
                        if (form) {
                          ;(form.querySelector('[name="userId"]') as HTMLInputElement).value = user.id.toString()
                          ;(form.querySelector('[name="name"]') as HTMLInputElement).value = user.name
                          ;(form.querySelector('[name="email"]') as HTMLInputElement).value = user.email
                          ;(form.querySelector('[name="role"]') as HTMLSelectElement).value = user.role
                        }
                        dialog?.showModal()
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this user?")) {
                          try {
                            const response = await fetch(`/api/users/${user.id}`, {
                              method: "DELETE",
                            })

                            if (response.ok) {
                              window.location.reload()
                            } else {
                              const error = await response.json()
                              alert(error.error || "Failed to delete user")
                            }
                          } catch (error) {
                            alert("Failed to delete user")
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Dialog */}
      <dialog id="edit-user-dialog" className="p-6 rounded-lg shadow-lg max-w-md w-full">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const userId = formData.get("userId")
            const data = {
              name: formData.get("name"),
              email: formData.get("email"),
              role: formData.get("role"),
              password: formData.get("password") || undefined,
            }

            try {
              const response = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              })

              if (response.ok) {
                window.location.reload()
              } else {
                const error = await response.json()
                alert(error.error || "Failed to update user")
              }
            } catch (error) {
              alert("Failed to update user")
            }
          }}
        >
          <input type="hidden" name="userId" />
          <h3 className="text-lg font-semibold">Edit User</h3>

          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" name="name" required />
          </div>

          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" name="email" type="email" required />
          </div>

          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
            <Input id="edit-password" name="password" type="password" minLength={6} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Update User</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const dialog = document.getElementById("edit-user-dialog") as HTMLDialogElement
                dialog?.close()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
