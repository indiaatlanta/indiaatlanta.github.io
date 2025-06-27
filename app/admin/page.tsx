"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2, Download, Upload, History, LogOut, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Skill {
  id: number
  name: string
  level: string
  description: string
  full_description: string
  category_id: number
  category_name: string
  category_color: string
  job_role_id: number
  sort_order: number
}

interface AuditLog {
  id: number
  user_name: string
  user_email: string
  action: string
  table_name: string
  record_id: number
  old_values: any
  new_values: any
  created_at: string
}

const skillCategories = [
  { id: 1, name: "Technical Skills", color: "blue" },
  { id: 2, name: "Delivery", color: "green" },
  { id: 3, name: "Feedback, Communication & Collaboration", color: "purple" },
  { id: 4, name: "Leadership", color: "indigo" },
  { id: 5, name: "Strategic Impact", color: "orange" },
]

const skillLevels = ["L1", "L2", "L3", "L4", "L5", "N/A"]

// Mock data for demo mode
const mockSkills: Skill[] = [
  {
    id: 1,
    name: "Security",
    level: "L1",
    description: "Understands the importance of security.",
    full_description:
      "Security is a fundamental aspect of software engineering that encompasses understanding and implementing measures to protect systems, data, and users from various threats and vulnerabilities.\n\nAt the L1 level, engineers should understand basic security principles, common vulnerabilities, and secure coding practices.",
    category_id: 1,
    category_name: "Technical Skills",
    category_color: "blue",
    job_role_id: 1,
    sort_order: 0,
  },
  {
    id: 2,
    name: "Work Breakdown",
    level: "L1",
    description: "Understands value of rightsizing pieces of work to enable continuous deployment.",
    full_description:
      "Work Breakdown is the practice of decomposing large, complex work items into smaller, manageable pieces that can be delivered incrementally and continuously deployed.\n\nAt the L1 level, engineers should understand the value of small, independent work items for faster feedback cycles.",
    category_id: 2,
    category_name: "Delivery",
    category_color: "green",
    job_role_id: 1,
    sort_order: 0,
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    user_name: "Demo Admin",
    user_email: "admin@henryscheinone.com",
    action: "CREATE",
    table_name: "skills",
    record_id: 1,
    old_values: null,
    new_values: { name: "Security", level: "L1" },
    created_at: new Date().toISOString(),
  },
]

export default function AdminPage() {
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<number | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "L1",
    description: "",
    fullDescription: "",
    category_id: 1,
    sort_order: 0,
  })

  useEffect(() => {
    // Check if we're in demo mode (no database configured)
    const checkDemoMode = async () => {
      try {
        const response = await fetch("/api/skills?jobRoleId=1")
        if (response.status === 500) {
          setIsDemoMode(true)
          setSkills(mockSkills)
          setAuditLogs(mockAuditLogs)
        }
      } catch (error) {
        setIsDemoMode(true)
        setSkills(mockSkills)
        setAuditLogs(mockAuditLogs)
      }
    }

    checkDemoMode()
  }, [])

  useEffect(() => {
    if (selectedJobRoleId && !isDemoMode) {
      loadSkills()
      loadAuditLogs()
    } else if (selectedJobRoleId && isDemoMode) {
      setSkills(mockSkills)
      setAuditLogs(mockAuditLogs)
    }
  }, [selectedJobRoleId, isDemoMode])

  const loadSkills = async () => {
    if (!selectedJobRoleId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/skills?jobRoleId=${selectedJobRoleId}`)
      if (response.ok) {
        const data = await response.json()
        setSkills(data)
      } else {
        setError("Failed to load skills")
      }
    } catch (error) {
      setError("Failed to load skills")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(`/api/audit?tableName=skills&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error)
    }
  }

  const handleSaveSkill = async (skill: Partial<Skill>) => {
    if (isDemoMode) {
      // Simulate saving in demo mode
      setSuccess("Skill saved successfully (Demo Mode)")
      setEditingSkill(null)
      setIsAddingSkill(false)
      setNewSkill({ name: "", level: "L1", description: "", fullDescription: "", category_id: 1, sort_order: 0 })
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const skillData = {
        ...skill,
        jobRoleId: selectedJobRoleId,
        categoryId: skill.category_id,
      }

      let response
      if (editingSkill) {
        response = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(skillData),
        })
      } else {
        response = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(skillData),
        })
      }

      if (response.ok) {
        setSuccess(editingSkill ? "Skill updated successfully" : "Skill created successfully")
        setEditingSkill(null)
        setIsAddingSkill(false)
        setNewSkill({ name: "", level: "L1", description: "", fullDescription: "", category_id: 1, sort_order: 0 })
        loadSkills()
        loadAuditLogs()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save skill")
      }
    } catch (error) {
      setError("Failed to save skill")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    if (isDemoMode) {
      setSuccess("Skill deleted successfully (Demo Mode)")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Skill deleted successfully")
        loadSkills()
        loadAuditLogs()
      } else {
        setError("Failed to delete skill")
      }
    } catch (error) {
      setError("Failed to delete skill")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "json" | "csv") => {
    if (isDemoMode) {
      // Create mock export data
      const mockData =
        format === "json"
          ? JSON.stringify(mockSkills, null, 2)
          : "name,level,description,full_description\nSecurity,L1,Understands the importance of security.,Security is a fundamental aspect..."
      const blob = new Blob([mockData], { type: format === "json" ? "application/json" : "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `skills-export-demo.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return
    }

    try {
      const url = selectedJobRoleId
        ? `/api/skills/export?jobRoleId=${selectedJobRoleId}&format=${format}`
        : `/api/skills/export?format=${format}`

      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `skills-export-${new Date().toISOString().split("T")[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      setError("Failed to export skills")
    }
  }

  const handleBulkImport = async () => {
    if (!bulkFile || !selectedJobRoleId) return

    if (isDemoMode) {
      setSuccess("Bulk import completed successfully (Demo Mode)")
      setBulkFile(null)
      return
    }

    setIsLoading(true)
    try {
      const text = await bulkFile.text()
      let skillsData

      if (bulkFile.name.endsWith(".json")) {
        skillsData = JSON.parse(text)
      } else if (bulkFile.name.endsWith(".csv")) {
        // Simple CSV parsing (in production, use a proper CSV parser)
        const lines = text.split("\n")
        const headers = lines[0].split(",")
        skillsData = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",")
            return {
              name: values[4]?.replace(/"/g, ""),
              level: values[5]?.replace(/"/g, ""),
              description: values[6]?.replace(/"/g, ""),
              fullDescription: values[7]?.replace(/"/g, "") || values[6]?.replace(/"/g, ""),
              categoryId: skillCategories.find((c) => c.name === values[3]?.replace(/"/g, ""))?.id || 1,
              jobRoleId: selectedJobRoleId,
              sortOrder: Number.parseInt(values[8]) || 0,
            }
          })
          .filter((skill) => skill.name)
      }

      const response = await fetch("/api/skills/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsData }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Successfully imported ${result.count} skills`)
        setBulkFile(null)
        loadSkills()
        loadAuditLogs()
      } else {
        setError("Failed to import skills")
      }
    } catch (error) {
      setError("Failed to import skills")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isDemoMode) {
      router.push("/")
      return
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getCategoryColor = (categoryId: number) => {
    const category = skillCategories.find((c) => c.id === categoryId)
    return category?.color || "gray"
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 text-blue-900 border-blue-200",
      green: "bg-green-50 text-green-900 border-green-200",
      purple: "bg-purple-50 text-purple-900 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-900 border-indigo-200",
      orange: "bg-orange-50 text-orange-900 border-orange-200",
    }
    return colorMap[color] || "bg-gray-50 text-gray-900 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-900 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-xs">HS1</span>
              </div>
              <span className="text-white text-sm">Admin Panel</span>
              {isDemoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                Admin
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-amber-800">
                <LogOut className="w-4 h-4 mr-2" />
                {isDemoMode ? "Exit Demo" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Skills Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Demo Mode Alert */}
        {isDemoMode && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> Database is not configured. All operations are simulated for demonstration
              purposes. To enable full functionality, configure the DATABASE_URL environment variable.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList>
            <TabsTrigger value="skills">Skills Management</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Job Role</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedJobRoleId?.toString() || ""}
                  onValueChange={(value) => setSelectedJobRoleId(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a job role to manage skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">E1 - Junior Engineer</SelectItem>
                    <SelectItem value="2">E2 - Software Engineer</SelectItem>
                    <SelectItem value="3">E3 - Senior Engineer</SelectItem>
                    <SelectItem value="4">E4 - Lead Engineer</SelectItem>
                    <SelectItem value="5">E5 - Principal Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Skills Management */}
            {selectedJobRoleId && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Skills Management</h2>
                  <Button onClick={() => setIsAddingSkill(true)} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {skillCategories.map((category) => {
                      const categorySkills = skills.filter((skill) => skill.category_id === category.id)
                      if (categorySkills.length === 0) return null

                      return (
                        <Card key={category.id}>
                          <CardHeader>
                            <CardTitle className={`text-${category.color}-700`}>{category.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {categorySkills.map((skill) => (
                                <div
                                  key={skill.id}
                                  className={`p-4 rounded-lg border ${getColorClasses(category.color)}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="font-medium">{skill.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {skill.level}
                                        </Badge>
                                      </div>
                                      <p className="text-sm">{skill.description}</p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      <Button variant="outline" size="sm" onClick={() => setEditingSkill(skill)}>
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Export skills data for backup or analysis</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport("json")} variant="outline">
                      Export JSON
                    </Button>
                    <Button onClick={() => handleExport("csv")} variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Import skills from JSON or CSV file</p>
                  <Input type="file" accept=".json,.csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />
                  <Button onClick={handleBulkImport} disabled={!bulkFile || !selectedJobRoleId} className="w-full">
                    Import Skills
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              log.action === "DELETE"
                                ? "destructive"
                                : log.action === "CREATE"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {log.action}
                          </Badge>
                          <span className="text-sm font-medium">{log.user_name}</span>
                          <span className="text-sm text-gray-500">({log.user_email})</span>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.action} {log.table_name} record #{log.record_id}
                      </div>
                      {log.new_values && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          <strong>Changes:</strong> {JSON.stringify(log.new_values, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Skill Dialogs */}
        <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Enter skill name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <Select value={newSkill.level} onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select
                    value={newSkill.category_id.toString()}
                    onValueChange={(value) => setNewSkill({ ...newSkill, category_id: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary Description</label>
                <Textarea
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  placeholder="Enter brief skill summary (shown in skill list)"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <Textarea
                  value={newSkill.fullDescription}
                  onChange={(e) => setNewSkill({ ...newSkill, fullDescription: e.target.value })}
                  placeholder="Enter detailed skill description (shown in skill details)"
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingSkill(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveSkill(newSkill)}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Skill"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Skill</DialogTitle>
            </DialogHeader>
            {editingSkill && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                  <Input
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <Select
                      value={editingSkill.level}
                      onValueChange={(value) => setEditingSkill({ ...editingSkill, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select
                      value={editingSkill.category_id.toString()}
                      onValueChange={(value) =>
                        setEditingSkill({ ...editingSkill, category_id: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary Description</label>
                  <Textarea
                    value={editingSkill.description}
                    onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <Textarea
                    value={editingSkill.full_description}
                    onChange={(e) => setEditingSkill({ ...editingSkill, full_description: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditingSkill(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSaveSkill(editingSkill)}
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
