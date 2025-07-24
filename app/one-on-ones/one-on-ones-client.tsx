"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Calendar, MessageSquare, CheckSquare, ArrowLeft, Edit2, Trash2, Save, X, Users } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface OneOnOne {
  id: number
  user_id: number
  manager_id: number
  meeting_date: string
  notes: string
  created_at: string
  updated_at: string
  user_name?: string
  manager_name?: string
  action_items?: ActionItem[]
  discussions?: Discussion[]
}

interface ActionItem {
  id: number
  one_on_one_id: number
  description: string
  status: "not-started" | "in-progress" | "completed" | "cancelled"
  due_date?: string
  created_at: string
  updated_at: string
}

interface Discussion {
  id: number
  one_on_one_id: number
  user_id: number
  message: string
  created_at: string
  user_name?: string
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
  const [currentView, setCurrentView] = useState<"list" | "detail">("list")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [managers, setManagers] = useState<User[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingActionItem, setEditingActionItem] = useState<number | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)

  // Form states
  const [newMeeting, setNewMeeting] = useState({
    manager_id: "",
    meeting_date: "",
    notes: "",
  })
  const [newActionItem, setNewActionItem] = useState({
    description: "",
    due_date: "",
    status: "not-started" as const,
  })
  const [newDiscussion, setNewDiscussion] = useState("")
  const [editedNotes, setEditedNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load user session
      const sessionResponse = await fetch("/api/auth/session")
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setUser(sessionData.user)
      }

      // Load one-on-ones
      const oneOnOnesResponse = await fetch("/api/one-on-ones")
      if (oneOnOnesResponse.ok) {
        const data = await oneOnOnesResponse.json()
        setOneOnOnes(data.oneOnOnes || [])
      }

      // Load managers (demo data)
      setManagers([
        { id: 10, name: "Sarah Johnson", email: "sarah.johnson@henryscheinone.com", role: "manager" },
        { id: 11, name: "Mike Chen", email: "mike.chen@henryscheinone.com", role: "manager" },
        { id: 12, name: "Lisa Rodriguez", email: "lisa.rodriguez@henryscheinone.com", role: "manager" },
      ])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createOneOnOne = async () => {
    try {
      const response = await fetch("/api/one-on-ones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: Number.parseInt(newMeeting.manager_id),
          meetingDate: newMeeting.meeting_date,
          notes: newMeeting.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      setOneOnOnes([result.oneOnOne, ...oneOnOnes])
      setNewMeeting({ manager_id: "", meeting_date: "", notes: "" })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create one-on-one:", error)
      alert("Failed to create one-on-one meeting")
    }
  }

  const viewOneOnOneDetails = async (oneOnOne: OneOnOne) => {
    try {
      // Load full details including action items and discussions
      const response = await fetch(`/api/one-on-ones/${oneOnOne.id}`)
      if (response.ok) {
        const fullDetails = await response.json()
        setSelectedOneOnOne(fullDetails.oneOnOne)
        setEditedNotes(fullDetails.oneOnOne.notes || "")
        setCurrentView("detail")
      }
    } catch (error) {
      console.error("Failed to load one-on-one details:", error)
    }
  }

  const backToList = () => {
    setCurrentView("list")
    setSelectedOneOnOne(null)
    setEditingNotes(false)
    setEditingActionItem(null)
  }

  const updateNotes = async () => {
    if (!selectedOneOnOne) return

    try {
      const response = await fetch(`/api/one-on-ones/${selectedOneOnOne.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editedNotes }),
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedOneOnOne(result.oneOnOne)
        setEditingNotes(false)
        // Update the list as well
        setOneOnOnes(oneOnOnes.map((o) => (o.id === result.oneOnOne.id ? result.oneOnOne : o)))
      }
    } catch (error) {
      console.error("Failed to update notes:", error)
    }
  }

  const addActionItem = async () => {
    if (!selectedOneOnOne || !newActionItem.description.trim()) return

    try {
      const response = await fetch(`/api/one-on-ones/${selectedOneOnOne.id}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newActionItem.description,
          description: newActionItem.description,
          dueDate: newActionItem.due_date || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedOneOnOne({
          ...selectedOneOnOne,
          action_items: [...(selectedOneOnOne.action_items || []), result.actionItem],
        })
        setNewActionItem({ description: "", due_date: "", status: "not-started" })
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
        body: JSON.stringify({
          title: updates.description,
          description: updates.description,
          status: updates.status,
          dueDate: updates.due_date,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (selectedOneOnOne) {
          setSelectedOneOnOne({
            ...selectedOneOnOne,
            action_items:
              selectedOneOnOne.action_items?.map((item) => (item.id === actionItemId ? result.actionItem : item)) || [],
          })
        }
        setEditingActionItem(null)
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

      if (response.ok && selectedOneOnOne) {
        setSelectedOneOnOne({
          ...selectedOneOnOne,
          action_items: selectedOneOnOne.action_items?.filter((item) => item.id !== actionItemId) || [],
        })
      }
    } catch (error) {
      console.error("Failed to delete action item:", error)
    }
  }

  const addDiscussion = async () => {
    if (!selectedOneOnOne || !newDiscussion.trim()) return

    try {
      const response = await fetch(`/api/one-on-ones/${selectedOneOnOne.id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newDiscussion }),
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedOneOnOne({
          ...selectedOneOnOne,
          discussions: [...(selectedOneOnOne.discussions || []), result.discussion],
        })
        setNewDiscussion("")
      }
    } catch (error) {
      console.error("Failed to add discussion:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (currentView === "detail" && selectedOneOnOne) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button onClick={backToList} variant="outline" className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All One-on-Ones
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">One-on-One Meeting</h1>
              <p className="text-gray-600">
                {new Date(selectedOneOnOne.meeting_date).toLocaleDateString()} with {selectedOneOnOne.manager_name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Meeting Notes
              </CardTitle>
              {!editingNotes ? (
                <Button variant="outline" size="sm" onClick={() => setEditingNotes(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={updateNotes}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingNotes(false)
                      setEditedNotes(selectedOneOnOne.notes || "")
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add meeting notes..."
                  className="min-h-[200px]"
                />
              ) : (
                <div className="min-h-[200px] p-3 bg-gray-50 rounded-md">
                  {selectedOneOnOne.notes || "No notes added yet."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Action Item */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                <Input
                  placeholder="Add new action item..."
                  value={newActionItem.description}
                  onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newActionItem.due_date}
                    onChange={(e) => setNewActionItem({ ...newActionItem, due_date: e.target.value })}
                  />
                  <Button onClick={addActionItem} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Action Items List */}
              <div className="space-y-2">
                {selectedOneOnOne.action_items?.map((item) => (
                  <div key={item.id} className="p-3 border rounded-md">
                    {editingActionItem === item.id ? (
                      <div className="space-y-2">
                        <Input
                          defaultValue={item.description}
                          onBlur={(e) => updateActionItem(item.id, { description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Select
                            defaultValue={item.status}
                            onValueChange={(value) => updateActionItem(item.id, { status: value as any })}
                          >
                            <SelectTrigger className="w-32">
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
                            defaultValue={item.due_date}
                            onBlur={(e) => updateActionItem(item.id, { due_date: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                            {item.due_date && (
                              <span className="text-sm text-gray-500">
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingActionItem(item.id)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteActionItem(item.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discussion Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Discussion */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add to discussion..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addDiscussion}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Discussion History */}
            <div className="space-y-3">
              {selectedOneOnOne.discussions?.map((discussion) => (
                <div key={discussion.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{discussion.user_name || user?.name}</span>
                    <span className="text-sm text-gray-500">{new Date(discussion.created_at).toLocaleString()}</span>
                  </div>
                  <p>{discussion.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // List View
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">One-on-One Meetings</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule One-on-One Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select
                  value={newMeeting.manager_id}
                  onValueChange={(value) => setNewMeeting({ ...newMeeting, manager_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
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
                <Label htmlFor="date">Meeting Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeeting.meeting_date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Initial Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any initial notes..."
                  value={newMeeting.notes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                />
              </div>
              <Button onClick={createOneOnOne} className="w-full">
                Create Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {oneOnOnes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No one-on-one meetings yet</h3>
            <p className="text-gray-600 mb-4">Schedule your first meeting to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {oneOnOnes.map((oneOnOne) => (
            <Card key={oneOnOne.id} onClick={() => viewOneOnOneDetails(oneOnOne)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(oneOnOne.meeting_date).toLocaleDateString()} with {oneOnOne.manager_name}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
