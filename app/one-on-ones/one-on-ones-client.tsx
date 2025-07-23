"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Calendar, Plus, MessageSquare, CheckSquare, Edit, Trash2, Send } from "lucide-react"
import { toast } from "sonner"

interface OneOnOneUser {
  id: number
  name: string
  email: string
  role: string
}

interface ActionItem {
  id: number
  one_on_one_id: number
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed" | "cancelled"
  due_date: string | null
  created_at: string
  updated_at: string
}

interface Discussion {
  id: number
  one_on_one_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user_name: string
}

interface OneOnOne {
  id: number
  user_id: number
  manager_id: number
  meeting_date: string
  notes: string
  created_at: string
  updated_at: string
  user_name: string
  manager_name: string
  action_items: ActionItem[]
  discussions: Discussion[]
}

interface OneOnOnesClientProps {
  user: OneOnOneUser
}

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started", color: "bg-gray-100 text-gray-800" },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
]

// Demo managers for the dropdown
const DEMO_MANAGERS = [
  { id: 10, name: "Sarah Manager" },
  { id: 11, name: "Mike Director" },
  { id: 12, name: "Lisa VP" },
]

export default function OneOnOnesClient({ user }: OneOnOnesClientProps) {
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedOneOnOne, setSelectedOneOnOne] = useState<OneOnOne | null>(null)
  const [newOneOnOne, setNewOneOnOne] = useState({
    managerId: "",
    meetingDate: "",
    notes: "",
  })
  const [newActionItem, setNewActionItem] = useState({
    title: "",
    description: "",
    dueDate: "",
  })
  const [newDiscussion, setNewDiscussion] = useState("")
  const [editingActionItem, setEditingActionItem] = useState<ActionItem | null>(null)

  useEffect(() => {
    loadOneOnOnes()
  }, [])

  const loadOneOnOnes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/one-on-ones")
      if (!response.ok) {
        throw new Error("Failed to fetch one-on-ones")
      }
      const data = await response.json()
      setOneOnOnes(data.oneOnOnes || [])
    } catch (error) {
      console.error("Failed to load one-on-ones:", error)
      toast.error("Failed to load one-on-ones")
    } finally {
      setLoading(false)
    }
  }

  const createOneOnOne = async () => {
    try {
      if (!newOneOnOne.managerId || !newOneOnOne.meetingDate) {
        toast.error("Please fill in all required fields")
        return
      }

      const response = await fetch("/api/one-on-ones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerId: Number.parseInt(newOneOnOne.managerId),
          meetingDate: newOneOnOne.meetingDate,
          notes: newOneOnOne.notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create one-on-one")
      }

      toast.success("One-on-one created successfully")
      setIsCreateDialogOpen(false)
      setNewOneOnOne({ managerId: "", meetingDate: "", notes: "" })
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to create one-on-one:", error)
      toast.error("Failed to create one-on-one")
    }
  }

  const updateOneOnOneNotes = async (id: number, notes: string) => {
    try {
      const response = await fetch(`/api/one-on-ones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error("Failed to update notes")
      }

      toast.success("Notes updated successfully")
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to update notes:", error)
      toast.error("Failed to update notes")
    }
  }

  const createActionItem = async (oneOnOneId: number) => {
    try {
      if (!newActionItem.title) {
        toast.error("Please enter a title for the action item")
        return
      }

      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/action-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newActionItem.title,
          description: newActionItem.description,
          dueDate: newActionItem.dueDate || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create action item")
      }

      toast.success("Action item created successfully")
      setNewActionItem({ title: "", description: "", dueDate: "" })
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to create action item:", error)
      toast.error("Failed to create action item")
    }
  }

  const updateActionItem = async (actionItem: ActionItem) => {
    try {
      const response = await fetch(`/api/one-on-ones/action-items/${actionItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: actionItem.title,
          description: actionItem.description,
          status: actionItem.status,
          dueDate: actionItem.due_date,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update action item")
      }

      toast.success("Action item updated successfully")
      setEditingActionItem(null)
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to update action item:", error)
      toast.error("Failed to update action item")
    }
  }

  const deleteActionItem = async (id: number) => {
    try {
      const response = await fetch(`/api/one-on-ones/action-items/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete action item")
      }

      toast.success("Action item deleted successfully")
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to delete action item:", error)
      toast.error("Failed to delete action item")
    }
  }

  const createDiscussion = async (oneOnOneId: number) => {
    try {
      if (!newDiscussion.trim()) {
        toast.error("Please enter discussion content")
        return
      }

      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newDiscussion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create discussion")
      }

      toast.success("Discussion added successfully")
      setNewDiscussion("")
      loadOneOnOnes()
    } catch (error) {
      console.error("Failed to create discussion:", error)
      toast.error("Failed to create discussion")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((option) => option.value === status)
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading one-on-ones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">One-on-One Meetings</h1>
          <p className="text-gray-600 mt-2">Track your one-on-one meetings, action items, and discussions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New One-on-One
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New One-on-One</DialogTitle>
              <DialogDescription>Schedule a new one-on-one meeting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="managerId">Manager</Label>
                <Select
                  value={newOneOnOne.managerId}
                  onValueChange={(value) => setNewOneOnOne({ ...newOneOnOne, managerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_MANAGERS.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meetingDate">Meeting Date</Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={newOneOnOne.meetingDate}
                  onChange={(e) => setNewOneOnOne({ ...newOneOnOne, meetingDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Meeting notes..."
                  value={newOneOnOne.notes}
                  onChange={(e) => setNewOneOnOne({ ...newOneOnOne, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOneOnOne}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* One-on-Ones List */}
      {oneOnOnes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No one-on-ones yet</h3>
            <p className="text-gray-500 mb-4">Create your first one-on-one meeting to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create One-on-One
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {oneOnOnes.map((oneOnOne) => (
            <Card key={oneOnOne.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(oneOnOne.meeting_date).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      {oneOnOne.user_name} • {oneOnOne.manager_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{oneOnOne.action_items.length} action items</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notes Section */}
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <Textarea
                    placeholder="Meeting notes..."
                    value={oneOnOne.notes}
                    onChange={(e) => {
                      const updatedOneOnOnes = oneOnOnes.map((o) =>
                        o.id === oneOnOne.id ? { ...o, notes: e.target.value } : o,
                      )
                      setOneOnOnes(updatedOneOnOnes)
                    }}
                    onBlur={(e) => updateOneOnOneNotes(oneOnOne.id, e.target.value)}
                  />
                </div>

                {/* Action Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Action Items
                    </h4>
                  </div>

                  {/* Add New Action Item */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Action item title..."
                        value={newActionItem.title}
                        onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description (optional)..."
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Due date (optional)"
                          value={newActionItem.dueDate}
                          onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                        />
                        <Button onClick={() => createActionItem(oneOnOne.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Items List */}
                  <div className="space-y-3">
                    {oneOnOne.action_items.map((actionItem) => (
                      <div key={actionItem.id} className="border rounded-lg p-4">
                        {editingActionItem?.id === actionItem.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingActionItem.title}
                              onChange={(e) => setEditingActionItem({ ...editingActionItem, title: e.target.value })}
                            />
                            <Textarea
                              value={editingActionItem.description}
                              onChange={(e) =>
                                setEditingActionItem({ ...editingActionItem, description: e.target.value })
                              }
                            />
                            <div className="flex gap-2">
                              <Select
                                value={editingActionItem.status}
                                onValueChange={(value) =>
                                  setEditingActionItem({ ...editingActionItem, status: value as any })
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="date"
                                value={editingActionItem.due_date || ""}
                                onChange={(e) =>
                                  setEditingActionItem({ ...editingActionItem, due_date: e.target.value })
                                }
                              />
                              <Button onClick={() => updateActionItem(editingActionItem)}>Save</Button>
                              <Button variant="outline" onClick={() => setEditingActionItem(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{actionItem.title}</h5>
                                {getStatusBadge(actionItem.status)}
                              </div>
                              {actionItem.description && (
                                <p className="text-sm text-gray-600 mb-2">{actionItem.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {new Date(actionItem.created_at).toLocaleDateString()}</span>
                                {actionItem.due_date && (
                                  <span>Due: {new Date(actionItem.due_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingActionItem(actionItem)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteActionItem(actionItem.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussions Section */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4" />
                    Discussion
                  </h4>

                  {/* Add New Discussion */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add to discussion..."
                        value={newDiscussion}
                        onChange={(e) => setNewDiscussion(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => createDiscussion(oneOnOne.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Discussions List */}
                  <div className="space-y-3">
                    {oneOnOne.discussions.map((discussion) => (
                      <div key={discussion.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{discussion.user_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(discussion.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{discussion.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
