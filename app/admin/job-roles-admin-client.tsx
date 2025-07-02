"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit, Loader2, Briefcase, Building } from "lucide-react"

interface Department {
  id: number
  name: string
  slug: string
  description?: string
}

interface JobRole {
  id: number
  name: string
  code: string
  level: number
  department_id: number
  department_name: string
  salary_min?: number
  salary_max?: number
  location_type?: string
  skill_count: number
}

export default function JobRolesAdminClient() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Dialog states
  const [isCreateDeptDialogOpen, setIsCreateDeptDialogOpen] = useState(false)
  const [isEditDeptDialogOpen, setIsEditDeptDialogOpen] = useState(false)
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [editingJobRole, setEditingJobRole] = useState<JobRole | null>(null)

  // Form states
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const [editDepartment, setEditDepartment] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const [newJobRole, setNewJobRole] = useState({
    name: "",
    code: "",
    departmentId: "",
    level: 1,
    salaryMin: "",
    salaryMax: "",
    locationType: "",
  })

  const [editJobRole, setEditJobRole] = useState({
    name: "",
    code: "",
    departmentId: "",
    level: 1,
    salaryMin: "",
    salaryMax: "",
    locationType: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadDepartments(), loadJobRoles()])
    } catch (error) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error("Failed to load departments:", error)
    }
  }

  const loadJobRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setJobRoles(data.roles || [])
      }
    } catch (error) {
      console.error("Failed to load job roles:", error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDepartment.name,
          slug: newDepartment.slug || generateSlug(newDepartment.name),
          description: newDepartment.description,
        }),
      })

      if (response.ok) {
        setSuccess("Department created successfully")
        setNewDepartment({ name: "", slug: "", description: "" })
        setIsCreateDeptDialogOpen(false)
        loadDepartments()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create department")
      }
    } catch (error) {
      setError("Failed to create department")
    }
  }

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDepartment.name,
          slug: editDepartment.slug,
          description: editDepartment.description,
        }),
      })

      if (response.ok) {
        setSuccess("Department updated successfully")
        setEditDepartment({ name: "", slug: "", description: "" })
        setIsEditDeptDialogOpen(false)
        setEditingDepartment(null)
        loadDepartments()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update department")
      }
    } catch (error) {
      setError("Failed to update department")
    }
  }

  const handleCreateJobRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/job-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newJobRole.name,
          code: newJobRole.code,
          departmentId: Number.parseInt(newJobRole.departmentId),
          level: newJobRole.level,
          salaryMin: newJobRole.salaryMin ? Number.parseInt(newJobRole.salaryMin) : undefined,
          salaryMax: newJobRole.salaryMax ? Number.parseInt(newJobRole.salaryMax) : undefined,
          locationType: newJobRole.locationType || undefined,
        }),
      })

      if (response.ok) {
        setSuccess("Job role created successfully")
        setNewJobRole({
          name: "",
          code: "",
          departmentId: "",
          level: 1,
          salaryMin: "",
          salaryMax: "",
          locationType: "",
        })
        setIsCreateRoleDialogOpen(false)
        loadJobRoles()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create job role")
      }
    } catch (error) {
      setError("Failed to create job role")
    }
  }

  const handleEditJobRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJobRole) return

    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/job-roles/${editingJobRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editJobRole.name,
          code: editJobRole.code,
          departmentId: Number.parseInt(editJobRole.departmentId),
          level: editJobRole.level,
          salaryMin: editJobRole.salaryMin ? Number.parseInt(editJobRole.salaryMin) : undefined,
          salaryMax: editJobRole.salaryMax ? Number.parseInt(editJobRole.salaryMax) : undefined,
          locationType: editJobRole.locationType || undefined,
        }),
      })

      if (response.ok) {
        setSuccess("Job role updated successfully")
        setEditJobRole({
          name: "",
          code: "",
          departmentId: "",
          level: 1,
          salaryMin: "",
          salaryMax: "",
          locationType: "",
        })
        setIsEditRoleDialogOpen(false)
        setEditingJobRole(null)
        loadJobRoles()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update job role")
      }
    } catch (error) {
      setError("Failed to update job role")
    }
  }

  const handleDeleteDepartment = async (deptId: number, deptName: string) => {
    if (!confirm(`Are you sure you want to delete "${deptName}"? This will also delete all associated job roles.`)) {
      return
    }

    try {
      const response = await fetch(`/api/departments/${deptId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Department deleted successfully")
        loadDepartments()
        loadJobRoles()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete department")
      }
    } catch (error) {
      setError("Failed to delete department")
    }
  }

  const handleDeleteJobRole = async (roleId: number, roleName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${roleName}"? This will also delete all associated skill demonstrations.`,
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/job-roles/${roleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Job role deleted successfully")
        loadJobRoles()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete job role")
      }
    } catch (error) {
      setError("Failed to delete job role")
    }
  }

  const openEditDepartmentDialog = (dept: Department) => {
    setEditingDepartment(dept)
    setEditDepartment({
      name: dept.name,
      slug: dept.slug,
      description: dept.description || "",
    })
    setIsEditDeptDialogOpen(true)
  }

  const openEditJobRoleDialog = (role: JobRole) => {
    setEditingJobRole(role)
    setEditJobRole({
      name: role.name,
      code: role.code,
      departmentId: role.department_id.toString(),
      level: role.level,
      salaryMin: role.salary_min?.toString() || "",
      salaryMax: role.salary_max?.toString() || "",
      locationType: role.location_type || "",
    })
    setIsEditRoleDialogOpen(true)
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified"
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    return `Up to $${max?.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading job roles data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Departments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Departments ({departments.length})
              </CardTitle>
              <CardDescription>Manage organizational departments</CardDescription>
            </div>
            <Dialog open={isCreateDeptDialogOpen} onOpenChange={setIsCreateDeptDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                  <div>
                    <Label htmlFor="dept-name">Department Name</Label>
                    <Input
                      id="dept-name"
                      value={newDepartment.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setNewDepartment({
                          ...newDepartment,
                          name,
                          slug: generateSlug(name),
                        })
                      }}
                      required
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dept-slug">URL Slug</Label>
                    <Input
                      id="dept-slug"
                      value={newDepartment.slug}
                      onChange={(e) => setNewDepartment({ ...newDepartment, slug: e.target.value })}
                      required
                      placeholder="e.g., engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dept-description">Description (Optional)</Label>
                    <Input
                      id="dept-description"
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      placeholder="Brief description of the department"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">Create Department</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDeptDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <p className="text-sm text-gray-500">/{dept.slug}</p>
                      {dept.description && <p className="text-sm text-gray-600 mt-1">{dept.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditDepartmentDialog(dept)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Roles ({jobRoles.length})
              </CardTitle>
              <CardDescription>Manage job roles and their assignments</CardDescription>
            </div>
            <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Job Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Job Role</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateJobRole} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role-name">Role Name</Label>
                      <Input
                        id="role-name"
                        value={newJobRole.name}
                        onChange={(e) => setNewJobRole({ ...newJobRole, name: e.target.value })}
                        required
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-code">Role Code</Label>
                      <Input
                        id="role-code"
                        value={newJobRole.code}
                        onChange={(e) => setNewJobRole({ ...newJobRole, code: e.target.value })}
                        required
                        placeholder="e.g., SSE"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role-department">Department</Label>
                      <Select
                        value={newJobRole.departmentId}
                        onValueChange={(value) => setNewJobRole({ ...newJobRole, departmentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role-level">Level</Label>
                      <Input
                        id="role-level"
                        type="number"
                        value={newJobRole.level}
                        onChange={(e) => setNewJobRole({ ...newJobRole, level: Number.parseInt(e.target.value) || 1 })}
                        min="1"
                        max="10"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role-salary-min">Min Salary (Optional)</Label>
                      <Input
                        id="role-salary-min"
                        type="number"
                        value={newJobRole.salaryMin}
                        onChange={(e) => setNewJobRole({ ...newJobRole, salaryMin: e.target.value })}
                        placeholder="e.g., 80000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-salary-max">Max Salary (Optional)</Label>
                      <Input
                        id="role-salary-max"
                        type="number"
                        value={newJobRole.salaryMax}
                        onChange={(e) => setNewJobRole({ ...newJobRole, salaryMax: e.target.value })}
                        placeholder="e.g., 120000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role-location">Location Type (Optional)</Label>
                    <Select
                      value={newJobRole.locationType}
                      onValueChange={(value) => setNewJobRole({ ...newJobRole, locationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">Create Job Role</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Level</th>
                  <th className="text-left p-4 font-medium">Salary Range</th>
                  <th className="text-left p-4 font-medium">Skills</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRoles.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.code}</div>
                        {role.location_type && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {role.location_type}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{role.department_name}</td>
                    <td className="p-4">
                      <Badge variant="secondary">Level {role.level}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatSalary(role.salary_min, role.salary_max)}</td>
                    <td className="p-4">
                      <Badge variant="outline">{role.skill_count} skills</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditJobRoleDialog(role)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteJobRole(role.id, role.name)}
                          className="text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDeptDialogOpen} onOpenChange={setIsEditDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDepartment} className="space-y-4">
            <div>
              <Label htmlFor="edit-dept-name">Department Name</Label>
              <Input
                id="edit-dept-name"
                value={editDepartment.name}
                onChange={(e) => {
                  const name = e.target.value
                  setEditDepartment({
                    ...editDepartment,
                    name,
                    slug: generateSlug(name),
                  })
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-slug">URL Slug</Label>
              <Input
                id="edit-dept-slug"
                value={editDepartment.slug}
                onChange={(e) => setEditDepartment({ ...editDepartment, slug: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-description">Description (Optional)</Label>
              <Input
                id="edit-dept-description"
                value={editDepartment.description}
                onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">Update Department</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDeptDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Job Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditJobRole} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={editJobRole.name}
                  onChange={(e) => setEditJobRole({ ...editJobRole, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-role-code">Role Code</Label>
                <Input
                  id="edit-role-code"
                  value={editJobRole.code}
                  onChange={(e) => setEditJobRole({ ...editJobRole, code: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-department">Department</Label>
                <Select
                  value={editJobRole.departmentId}
                  onValueChange={(value) => setEditJobRole({ ...editJobRole, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-role-level">Level</Label>
                <Input
                  id="edit-role-level"
                  type="number"
                  value={editJobRole.level}
                  onChange={(e) => setEditJobRole({ ...editJobRole, level: Number.parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-salary-min">Min Salary (Optional)</Label>
                <Input
                  id="edit-role-salary-min"
                  type="number"
                  value={editJobRole.salaryMin}
                  onChange={(e) => setEditJobRole({ ...editJobRole, salaryMin: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-salary-max">Max Salary (Optional)</Label>
                <Input
                  id="edit-role-salary-max"
                  type="number"
                  value={editJobRole.salaryMax}
                  onChange={(e) => setEditJobRole({ ...editJobRole, salaryMax: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-role-location">Location Type (Optional)</Label>
              <Select
                value={editJobRole.locationType}
                onValueChange={(value) => setEditJobRole({ ...editJobRole, locationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">Update Job Role</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
