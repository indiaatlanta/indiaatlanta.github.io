"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus, Upload, Download, AlertCircle, CheckCircle, Database, WifiOff } from "lucide-react"
import type { User } from "@/lib/auth"
import Image from "next/image"

interface Skill {
  id: number
  name: string
  category: string
  description: string
  level: number
}

interface AuditLog {
  id: number
  action: string
  table_name: string
  record_id: number
  old_values: any
  new_values: any
  user_email: string
  timestamp: string
}

interface AdminClientProps {
  user: User
}

export default function AdminClient({ user }: AdminClientProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isOnline, setIsOnline] = useState(true)

  // Form states
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    level: 1,
  })

  // Import/Export states
  const [importData, setImportData] = useState("")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  useEffect(() => {
    fetchSkills()
    fetchAuditLogs()

    // Check online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", checkOnlineStatus)
    window.addEventListener("offline", checkOnlineStatus)

    return () => {
      window.removeEventListener("online", checkOnlineStatus)
      window.removeEventListener("offline", checkOnlineStatus)
    }
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/skills")
      if (response.ok) {
        const data = await response.json()
        setSkills(data)
        setIsOnline(true)
      } else {
        throw new Error("Failed to fetch skills")
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
      setError("Failed to load skills. Using demo mode.")
      setIsOnline(false)
      // Load demo skills
      setSkills([
        {
          id: 1,
          name: "JavaScript",
          category: "Programming",
          description: "JavaScript programming language",
          level: 3,
        },
        { id: 2, name: "React", category: "Frontend", description: "React framework", level: 4 },
        { id: 3, name: "Node.js", category: "Backend", description: "Node.js runtime", level: 3 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/audit")
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      // Demo audit logs
      setAuditLogs([
        {
          id: 1,
          action: "CREATE",
          table_name: "skills_master",
          record_id: 1,
          old_values: null,
          new_values: { name: "JavaScript", category: "Programming" },
          user_email: user.email,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const url = editingSkill ? `/api/skills/${editingSkill.id}` : "/api/skills"
      const method = editingSkill ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(editingSkill ? "Skill updated successfully!" : "Skill created successfully!")
        setIsDialogOpen(false)
        resetForm()
        fetchSkills()
        fetchAuditLogs()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save skill")
      }
    } catch (error) {
      console.error("Error saving skill:", error)
      setError("Failed to save skill")
    }
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description,
      level: skill.level,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Skill deleted successfully!")
        fetchSkills()
        fetchAuditLogs()
      } else {
        setError("Failed to delete skill")
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
      setError("Failed to delete skill")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      level: 1,
    })
    setEditingSkill(null)
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/skills/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `skills.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess(`Skills exported as ${format.toUpperCase()}!`)
      } else {
        setError("Failed to export skills")
      }
    } catch (error) {
      console.error("Error exporting skills:", error)
      setError("Failed to export skills")
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      setError("Please enter data to import")
      return
    }

    try {
      let parsedData
      try {
        parsedData = JSON.parse(importData)
      } catch {
        setError("Invalid JSON format")
        return
      }

      const response = await fetch("/api/skills/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: parsedData }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Successfully imported ${result.imported} skills!`)
        setIsImportDialogOpen(false)
        setImportData("")
        fetchSkills()
        fetchAuditLogs()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to import skills")
      }
    } catch (error) {
      console.error("Error importing skills:", error)
      setError("Failed to import skills")
    }
  }

  const categories = [...new Set(skills.map((skill) => skill.category))]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/henry-schein-one-logo.png"
            alt="Henry Schein One"
            width={200}
            height={60}
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-600">Manage skills and system data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Database Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Demo Mode
            </Badge>
          )}
          <Badge variant="outline">
            {user.name} ({user.role})
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList>
          <TabsTrigger value="skills">Skills Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          {/* Skills Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills Management</CardTitle>
                  <CardDescription>Create, edit, and manage skills in the system</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Skills</DialogTitle>
                        <DialogDescription>Import skills from JSON data</DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Paste JSON data here..."
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        rows={10}
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleImport}>Import</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
                        <DialogDescription>
                          {editingSkill ? "Update the skill information" : "Create a new skill in the system"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Skill name"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="Programming">Programming</SelectItem>
                              <SelectItem value="Frontend">Frontend</SelectItem>
                              <SelectItem value="Backend">Backend</SelectItem>
                              <SelectItem value="Database">Database</SelectItem>
                              <SelectItem value="DevOps">DevOps</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                              <SelectItem value="Management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Skill description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Level (1-5)</label>
                          <Select
                            value={formData.level.toString()}
                            onValueChange={(value) => setFormData({ ...formData, level: Number.parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Beginner</SelectItem>
                              <SelectItem value="2">2 - Basic</SelectItem>
                              <SelectItem value="3">3 - Intermediate</SelectItem>
                              <SelectItem value="4">4 - Advanced</SelectItem>
                              <SelectItem value="5">5 - Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">{editingSkill ? "Update" : "Create"}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading skills...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{skill.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{skill.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {skill.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(skill.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all changes made to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant={
                            log.action === "CREATE" ? "default" : log.action === "UPDATE" ? "secondary" : "destructive"
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.table_name}</TableCell>
                      <TableCell>{log.record_id}</TableCell>
                      <TableCell>{log.user_email}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
