"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2, Wrench, Target } from "lucide-react"

interface SkillCategory {
  id: number
  name: string
  color: string
  sort_order: number
}

interface SkillMaster {
  id: number
  name: string
  description: string
  category_id: number
  category_name: string
  category_color: string
  demonstration_count: number
  sort_order: number
}

interface SkillDemonstration {
  id: number
  skill_master_id: number
  job_role_id: number
  level: string
  demonstration_description: string
  skill_name: string
  job_role_name: string
  category_name: string
  sort_order: number
}

interface JobRole {
  id: number
  name: string
  code: string
  level: number
  department_name: string
}

export default function SkillsAdminClient() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [skillsMaster, setSkillsMaster] = useState<SkillMaster[]>([])
  const [skillDemonstrations, setSkillDemonstrations] = useState<SkillDemonstration[]>([])
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Dialog states
  const [isCreateSkillDialogOpen, setIsCreateSkillDialogOpen] = useState(false)
  const [isCreateDemoDialogOpen, setIsCreateDemoDialogOpen] = useState(false)

  // Form states
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    categoryId: "",
    sortOrder: 0,
  })

  const [newDemo, setNewDemo] = useState({
    skillMasterId: "",
    jobRoleId: "",
    level: "",
    demonstrationDescription: "",
    sortOrder: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadSkillCategories(), loadSkillsMaster(), loadSkillDemonstrations(), loadJobRoles()])
    } catch (error) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const loadSkillCategories = async () => {
    try {
      const response = await fetch("/api/skill-categories")
      if (response.ok) {
        const data = await response.json()
        setSkillCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to load skill categories:", error)
    }
  }

  const loadSkillsMaster = async () => {
    try {
      const response = await fetch("/api/skills-master")
      if (response.ok) {
        const skills = await response.json()
        setSkillsMaster(Array.isArray(skills) ? skills : [])
      }
    } catch (error) {
      console.error("Failed to load master skills:", error)
    }
  }

  const loadSkillDemonstrations = async () => {
    try {
      const response = await fetch("/api/skill-demonstrations")
      if (response.ok) {
        const demos = await response.json()
        setSkillDemonstrations(Array.isArray(demos) ? demos : [])
      }
    } catch (error) {
      console.error("Failed to load skill demonstrations:", error)
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

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/skills-master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill.name,
          description: newSkill.description,
          categoryId: Number.parseInt(newSkill.categoryId),
          sortOrder: newSkill.sortOrder,
        }),
      })

      if (response.ok) {
        setSuccess("Skill created successfully")
        setNewSkill({ name: "", description: "", categoryId: "", sortOrder: 0 })
        setIsCreateSkillDialogOpen(false)
        loadSkillsMaster()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create skill")
      }
    } catch (error) {
      setError("Failed to create skill")
    }
  }

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/skill-demonstrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillMasterId: Number.parseInt(newDemo.skillMasterId),
          jobRoleId: Number.parseInt(newDemo.jobRoleId),
          level: newDemo.level,
          demonstrationDescription: newDemo.demonstrationDescription,
          sortOrder: newDemo.sortOrder,
        }),
      })

      if (response.ok) {
        setSuccess("Skill demonstration created successfully")
        setNewDemo({ skillMasterId: "", jobRoleId: "", level: "", demonstrationDescription: "", sortOrder: 0 })
        setIsCreateDemoDialogOpen(false)
        loadSkillDemonstrations()
        loadSkillsMaster() // Refresh to update demonstration counts
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create skill demonstration")
      }
    } catch (error) {
      setError("Failed to create skill demonstration")
    }
  }

  const handleDeleteSkill = async (skillId: number, skillName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${skillName}"? This will also delete all associated demonstrations.`)
    ) {
      return
    }

    try {
      const response = await fetch(`/api/skills-master/${skillId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Skill deleted successfully")
        loadSkillsMaster()
        loadSkillDemonstrations()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete skill")
      }
    } catch (error) {
      setError("Failed to delete skill")
    }
  }

  const handleDeleteDemo = async (demoId: number, skillName: string) => {
    if (!confirm(`Are you sure you want to delete the demonstration for "${skillName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/skill-demonstrations/${demoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Skill demonstration deleted successfully")
        loadSkillDemonstrations()
        loadSkillsMaster() // Refresh to update demonstration counts
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete skill demonstration")
      }
    } catch (error) {
      setError("Failed to delete skill demonstration")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading skills data...</span>
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

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Master Skills ({skillsMaster.length})
          </TabsTrigger>
          <TabsTrigger value="demonstrations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Demonstrations ({skillDemonstrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          {/* Create Skill Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Master Skills</h3>
            <Dialog open={isCreateSkillDialogOpen} onOpenChange={setIsCreateSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Master Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Master Skill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSkill} className="space-y-4">
                  <div>
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      required
                      placeholder="e.g., JavaScript Programming"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-category">Category</Label>
                    <Select
                      value={newSkill.categoryId}
                      onValueChange={(value) => setNewSkill({ ...newSkill, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                  <div>
                    <Label htmlFor="skill-description">Description</Label>
                    <Textarea
                      id="skill-description"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                      required
                      placeholder="Detailed description of the skill..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-sort-order">Sort Order</Label>
                    <Input
                      id="skill-sort-order"
                      type="number"
                      value={newSkill.sortOrder}
                      onChange={(e) => setNewSkill({ ...newSkill, sortOrder: Number.parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">Create Skill</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateSkillDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Skills Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skillsMaster.map((skill) => (
              <Card key={skill.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{skill.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: `${skill.category_color}20`, color: skill.category_color }}
                        >
                          {skill.category_name}
                        </Badge>
                        <Badge variant="outline">{skill.demonstration_count} demos</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSkill(skill.id, skill.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demonstrations" className="space-y-4">
          {/* Create Demo Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Skill Demonstrations</h3>
            <Dialog open={isCreateDemoDialogOpen} onOpenChange={setIsCreateDemoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Demonstration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Skill Demonstration</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDemo} className="space-y-4">
                  <div>
                    <Label htmlFor="demo-skill">Master Skill</Label>
                    <Select
                      value={newDemo.skillMasterId}
                      onValueChange={(value) => setNewDemo({ ...newDemo, skillMasterId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillsMaster.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id.toString()}>
                            {skill.name} ({skill.category_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="demo-role">Job Role</Label>
                    <Select
                      value={newDemo.jobRoleId}
                      onValueChange={(value) => setNewDemo({ ...newDemo, jobRoleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job role" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name} ({role.department_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="demo-level">Level</Label>
                    <Input
                      id="demo-level"
                      value={newDemo.level}
                      onChange={(e) => setNewDemo({ ...newDemo, level: e.target.value })}
                      required
                      placeholder="e.g., L1, L2, M1, M2, S1, S2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo-description">Demonstration Description</Label>
                    <Textarea
                      id="demo-description"
                      value={newDemo.demonstrationDescription}
                      onChange={(e) => setNewDemo({ ...newDemo, demonstrationDescription: e.target.value })}
                      required
                      placeholder="How this skill is demonstrated at this level..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo-sort-order">Sort Order</Label>
                    <Input
                      id="demo-sort-order"
                      type="number"
                      value={newDemo.sortOrder}
                      onChange={(e) => setNewDemo({ ...newDemo, sortOrder: Number.parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">Create Demonstration</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDemoDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Demonstrations Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Skill</th>
                  <th className="text-left p-4 font-medium">Job Role</th>
                  <th className="text-left p-4 font-medium">Level</th>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skillDemonstrations.map((demo) => (
                  <tr key={demo.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{demo.skill_name}</div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {demo.category_name}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{demo.job_role_name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{demo.level}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{demo.demonstration_description}</div>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDemo(demo.id, demo.skill_name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
