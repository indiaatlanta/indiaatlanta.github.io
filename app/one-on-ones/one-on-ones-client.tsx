"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, User, Plus, Edit2, Trash2, MessageSquare } from "lucide-react"

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
  manager_name: string
  user_name: string
  action_items: ActionItem[]
  discussions: Discussion[]
}

const statusColors = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export default function OneOnOnesClient() {
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([])
  const [selectedOneOnOne, setSelectedOneOnOne] = useState<OneOnOne | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingActionItem, setEditingActionItem] = useState<number | null>(null)
  const [newActionItem, setNewActionItem] = useState({ title: "", description: "", status: "not-started", dueDate: "" })
  const [newDiscussion, setNewDiscussion] = useState("")
  const [newOneOnOne, setNewOneOnOne] = useState({
    managerId: "",
    meetingDate: "",
    notes: "",
  })

  const managers = [
    { id: 10, name: "Sarah Johnson" },
    { id: 11, name: "Mike Chen" },
    { id: 12, name: "Emily Davis" },
  ]

  useEffect(() => {
    loadOneOnOnes()
  }, [])

  const loadOneOnOnes = async () => {
    try {
      const response = await fetch("/api/one-on-ones")
      const data = await response.json()

      if (response.ok) {
        setOneOnOnes(data.oneOnOnes || [])
      } else {
        console.error("Failed to load one-on-ones:", data.error)
      }
    } catch (error) {
      console.error("Failed to load one-on-ones:", error)
    } finally {
      setLoading(false)
    }
  }

  const createOneOnOne = async () => {
    try {
      const response = await fetch("/api/one-on-ones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOneOnOne),
      })

      const data = await response.json()

      if (response.ok) {
        await loadOneOnOnes()
        setShowCreateForm(false)
        setNewOneOnOne({ managerId: "", meetingDate: "", notes: "" })
      } else {
        console.error("Failed to create one-on-one:", data.error)
      }
    } catch (error) {
      console.error("Failed to create one-on-one:", error)
    }
  }

  const updateNotes = async (oneOnOneId: number, notes: string) => {
    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        await loadOneOnOnes()
        if (selectedOneOnOne && selectedOneOnOne.id === oneOnOneId) {
          setSelectedOneOnOne({ ...selectedOneOnOne, notes })
        }
      }
    } catch (error) {
      console.error("Failed to update notes:", error)
    }
  }

  const addActionItem = async (oneOnOneId: number) => {
    if (!newActionItem.title) return

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newActionItem.title,
          description: newActionItem.description,
          status: newActionItem.status,
          dueDate: newActionItem.dueDate || null,
        }),
      })

      if (response.ok) {
        await loadOneOnOnes()
        setNewActionItem({ title: "", description: "", status: "not-started", dueDate: "" })

        // Update selected one-on-one if it's the current one
        if (selectedOneOnOne && selectedOneOnOne.id === oneOnOneId) {
          const updatedOneOnOne = oneOnOnes.find((o) => o.id === oneOnOneId)
          if (updatedOneOnOne) {
            setSelectedOneOnOne(updatedOneOnOne)
          }
        }
      }
    } catch (error) {
      console.error("Failed to add action item:", error)
    }
  }

  const updateActionItem = async (actionItemId: number, updates: Partial<ActionItem>) => {
    try {
      const response = await fetch(`/api/one-on-ones/action-items/${actionItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await loadOneOnOnes()
        setEditingActionItem(null)

        // Update selected one-on-one
        if (selectedOneOnOne) {
          const updatedOneOnOne = oneOnOnes.find((o) => o.id === selectedOneOnOne.id)
          if (updatedOneOnOne) {
            setSelectedOneOnOne(updatedOneOnOne)
          }
        }
      }
    } catch (error) {
      console.error("Failed to update action item:", error)
    }
  }

  const deleteActionItem = async (actionItemId: number) => {
    try {
      const response = await fetch(`/api/one-on-ones/action-items/${actionItemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadOneOnOnes()

        // Update selected one-on-one
        if (selectedOneOnOne) {
          const updatedOneOnOne = oneOnOnes.find((o) => o.id === selectedOneOnOne.id)
          if (updatedOneOnOne) {
            setSelectedOneOnOne(updatedOneOnOne)
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete action item:", error)
    }
  }

  const addDiscussion = async (oneOnOneId: number) => {
    if (!newDiscussion.trim()) return

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newDiscussion }),
      })

      if (response.ok) {
        await loadOneOnOnes()
        setNewDiscussion("")

        // Update selected one-on-one
        if (selectedOneOnOne && selectedOneOnOne.id === oneOnOneId) {
          const updatedOneOnOne = oneOnOnes.find((o) => o.id === oneOnOneId)
          if (updatedOneOnOne) {
            setSelectedOneOnOne(updatedOneOnOne)
          }
        }
      }
    } catch (error) {
      console.error("Failed to add discussion:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading one-on-ones...</div>
      </div>
    )
  }

  // Detail view for a specific one-on-one
  if (selectedOneOnOne) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedOneOnOne(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All One-on-Ones
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-semibold">
              {new Date(selectedOneOnOne.meeting_date).toLocaleDateString()}
            </span>
            <User className="w-5 h-5 text-gray-500 ml-4" />
            <span className="text-lg">{selectedOneOnOne.manager_name}</span>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Meeting Notes
                <Button variant="outline" size="sm" onClick={() => setEditingNotes(!editingNotes)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={selectedOneOnOne.notes}
                    onChange={(e) => setSelectedOneOnOne({ ...selectedOneOnOne, notes: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        updateNotes(selectedOneOnOne.id, selectedOneOnOne.notes)
                        setEditingNotes(false)
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingNotes(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{selectedOneOnOne.notes || "No notes added yet."}</p>
              )}
            </CardContent>
          </Card>

          {/* Action Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Track tasks and follow-ups from this meeting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOneOnOne.action_items?.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    {editingActionItem === item.id ? (
                      <div className="space-y-4">
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const updatedItems = selectedOneOnOne.action_items.map((ai) =>
                              ai.id === item.id ? { ...ai, title: e.target.value } : ai,
                            )
                            setSelectedOneOnOne({ ...selectedOneOnOne, action_items: updatedItems })
                          }}
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => {
                            const updatedItems = selectedOneOnOne.action_items.map((ai) =>
                              ai.id === item.id ? { ...ai, description: e.target.value } : ai,
                            )
                            setSelectedOneOnOne({ ...selectedOneOnOne, action_items: updatedItems })
                          }}
                          rows={2}
                        />
                        <div className="flex gap-4">
                          <Select
                            value={item.status}
                            onValueChange={(value) => {
                              const updatedItems = selectedOneOnOne.action_items.map((ai) =>
                                ai.id === item.id ? { ...ai, status: value as ActionItem["status"] } : ai,
                              )
                              setSelectedOneOnOne({ ...selectedOneOnOne, action_items: updatedItems })
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={item.due_date || ""}
                            onChange={(e) => {
                              const updatedItems = selectedOneOnOne.action_items.map((ai) =>
                                ai.id === item.id ? { ...ai, due_date: e.target.value } : ai,
                              )
                              setSelectedOneOnOne({ ...selectedOneOnOne, action_items: updatedItems })
                            }}
                            className="w-40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              updateActionItem(item.id, {
                                title: item.title,
                                description: item.description,
                                status: item.status,
                                dueDate: item.due_date,
                              })
                            }
                          >
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditingActionItem(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                          </div>
                          {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                          {item.due_date && (
                            <p className="text-sm text-gray-500">Due: {new Date(item.due_date).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingActionItem(item.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteActionItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new action item */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="space-y-4">
                    <Input
                      placeholder="Action item title"
                      value={newActionItem.title}
                      onChange={(e) => setNewActionItem({ ...newActionItem, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newActionItem.description}
                      onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                      rows={2}
                    />
                    <div className="flex gap-4">
                      <Select
                        value={newActionItem.status}
                        onValueChange={(value) => setNewActionItem({ ...newActionItem, status: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={newActionItem.dueDate}
                        onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                        className="w-40"
                      />
                    </div>
                    <Button onClick={() => addActionItem(selectedOneOnOne.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action Item
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discussions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>Conversation history and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOneOnOne.discussions?.map((discussion) => (
                  <div key={discussion.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{discussion.user_name}</span>
                      <span className="text-xs text-gray-500">{new Date(discussion.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700">{discussion.content}</p>
                  </div>
                ))}

                {/* Add new discussion */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add to the discussion..."
                      value={newDiscussion}
                      onChange={(e) => setNewDiscussion(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={() => addDiscussion(selectedOneOnOne.id)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Discussion
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">One-on-One Meetings</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New One-on-One</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Manager</label>
                <Select
                  value={newOneOnOne.managerId}
                  onValueChange={(value) => setNewOneOnOne({ ...newOneOnOne, managerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Date</label>
                <Input
                  type="date"
                  value={newOneOnOne.meetingDate}
                  onChange={(e) => setNewOneOnOne({ ...newOneOnOne, meetingDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  value={newOneOnOne.notes}
                  onChange={(e) => setNewOneOnOne({ ...newOneOnOne, notes: e.target.value })}
                  rows={4}
                  placeholder="Meeting notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createOneOnOne}>Create Meeting</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {oneOnOnes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No one-on-one meetings yet.</p>
              <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                Create Your First Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          oneOnOnes.map((oneOnOne) => (
            <Card key={oneOnOne.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{new Date(oneOnOne.meeting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{oneOnOne.manager_name}</span>
                      </div>
                    </div>

                    {oneOnOne.notes && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {oneOnOne.notes.length > 150 ? `${oneOnOne.notes.substring(0, 150)}...` : oneOnOne.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{oneOnOne.action_items?.length || 0} action items</span>
                      <span>{oneOnOne.discussions?.length || 0} discussions</span>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => setSelectedOneOnOne(oneOnOne)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
