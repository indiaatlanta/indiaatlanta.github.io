"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Plus,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Users,
  Target,
  MessageCircle,
} from "lucide-react"
import { format } from "date-fns"

interface OneOnOne {
  id: number
  meeting_date: string
  notes: string
  manager_name: string
  action_items: ActionItem[]
  discussions: Discussion[]
}

interface ActionItem {
  id: number
  description: string
  status: "not-started" | "in-progress" | "completed" | "cancelled"
  due_date?: string
  created_at: string
}

interface Discussion {
  id: number
  message: string
  user_name: string
  created_at: string
}

const STATUS_COLORS = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_ICONS = {
  "not-started": Clock,
  "in-progress": Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function OneOnOnesClient() {
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([])
  const [selectedOneOnOne, setSelectedOneOnOne] = useState<OneOnOne | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "detail">("list")

  // Form states
  const [newMeetingDate, setNewMeetingDate] = useState("")
  const [newManagerName, setNewManagerName] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState("")

  // Action item form
  const [newActionItem, setNewActionItem] = useState("")
  const [newActionDueDate, setNewActionDueDate] = useState("")

  // Discussion form
  const [newDiscussion, setNewDiscussion] = useState("")

  useEffect(() => {
    loadOneOnOnes()
  }, [])

  const loadOneOnOnes = async () => {
    try {
      const response = await fetch("/api/one-on-ones")
      if (response.ok) {
        const data = await response.json()
        setOneOnOnes(data)
      }
    } catch (error) {
      console.error("Failed to load one-on-ones:", error)
      // Demo data fallback
      setOneOnOnes([
        {
          id: 1,
          meeting_date: "2024-01-15",
          notes: "Discussed Q1 goals and performance review process.",
          manager_name: "Sarah Johnson",
          action_items: [
            {
              id: 1,
              description: "Complete project documentation",
              status: "in-progress",
              due_date: "2024-01-30",
              created_at: "2024-01-15T10:00:00Z",
            },
          ],
          discussions: [
            {
              id: 1,
              message: "Great progress on the new feature implementation!",
              user_name: "Sarah Johnson",
              created_at: "2024-01-15T10:30:00Z",
            },
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const createOneOnOne = async () => {
    if (!newMeetingDate || !newManagerName) return

    try {
      const response = await fetch("/api/one-on-ones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_date: newMeetingDate,
          manager_name: newManagerName,
          notes: newNotes,
        }),
      })

      if (response.ok) {
        const newOneOnOne = await response.json()
        setOneOnOnes([newOneOnOne, ...oneOnOnes])
        setNewMeetingDate("")
        setNewManagerName("")
        setNewNotes("")
      }
    } catch (error) {
      console.error("Failed to create one-on-one:", error)
    }
  }

  const updateNotes = async (id: number, notes: string) => {
    try {
      const response = await fetch(`/api/one-on-ones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOneOnOnes(oneOnOnes.map((o) => (o.id === id ? updated : o)))
        if (selectedOneOnOne?.id === id) {
          setSelectedOneOnOne(updated)
        }
      }
    } catch (error) {
      console.error("Failed to update notes:", error)
    }
  }

  const addActionItem = async (oneOnOneId: number) => {
    if (!newActionItem) return

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newActionItem,
          due_date: newActionDueDate || null,
        }),
      })

      if (response.ok) {
        const actionItem = await response.json()
        const updated = {
          ...selectedOneOnOne!,
          action_items: [...(selectedOneOnOne?.action_items || []), actionItem],
        }
        setSelectedOneOnOne(updated)
        setOneOnOnes(oneOnOnes.map((o) => (o.id === oneOnOneId ? updated : o)))
        setNewActionItem("")
        setNewActionDueDate("")
      }
    } catch (error) {
      console.error("Failed to add action item:", error)
    }
  }

  const updateActionItemStatus = async (actionItemId: number, status: string) => {
    try {
      const response = await fetch(`/api/one-on-ones/action-items/${actionItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedActionItem = await response.json()
        const updated = {
          ...selectedOneOnOne!,
          action_items: selectedOneOnOne!.action_items.map((item) =>
            item.id === actionItemId ? updatedActionItem : item,
          ),
        }
        setSelectedOneOnOne(updated)
        setOneOnOnes(oneOnOnes.map((o) => (o.id === selectedOneOnOne!.id ? updated : o)))
      }
    } catch (error) {
      console.error("Failed to update action item:", error)
    }
  }

  const addDiscussion = async (oneOnOneId: number) => {
    if (!newDiscussion) return

    try {
      const response = await fetch(`/api/one-on-ones/${oneOnOneId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newDiscussion }),
      })

      if (response.ok) {
        const discussion = await response.json()
        const updated = {
          ...selectedOneOnOne!,
          discussions: [...(selectedOneOnOne?.discussions || []), discussion],
        }
        setSelectedOneOnOne(updated)
        setOneOnOnes(oneOnOnes.map((o) => (o.id === oneOnOneId ? updated : o)))
        setNewDiscussion("")
      }
    } catch (error) {
      console.error("Failed to add discussion:", error)
    }
  }

  const handleNotesEdit = () => {
    setTempNotes(selectedOneOnOne?.notes || "")
    setEditingNotes(true)
  }

  const saveNotes = () => {
    if (selectedOneOnOne) {
      updateNotes(selectedOneOnOne.id, tempNotes)
      setEditingNotes(false)
    }
  }

  const cancelNotesEdit = () => {
    setEditingNotes(false)
    setTempNotes("")
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (view === "detail" && selectedOneOnOne) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setView("list")
              setSelectedOneOnOne(null)
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All One-on-Ones
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              One-on-One Meeting - {format(new Date(selectedOneOnOne.meeting_date), "MMMM d, yyyy")}
            </h1>
            <p className="text-gray-600">with {selectedOneOnOne.manager_name}</p>
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
              {!editingNotes && (
                <Button variant="outline" size="sm" onClick={handleNotesEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add meeting notes..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNotes}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelNotesEdit}>
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
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new action item */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Add new action item..."
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => addActionItem(selectedOneOnOne.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action items list */}
              <div className="space-y-3">
                {selectedOneOnOne.action_items?.map((item) => {
                  const StatusIcon = STATUS_ICONS[item.status]
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <StatusIcon className="w-4 h-4 mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        {item.due_date && (
                          <p className="text-sm text-gray-500">Due: {format(new Date(item.due_date), "MMM d, yyyy")}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
                        <Select value={item.status} onValueChange={(value) => updateActionItemStatus(item.id, value)}>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discussions Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new discussion */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add to discussion..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={() => addDiscussion(selectedOneOnOne.id)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Discussion history */}
            <div className="space-y-3">
              {selectedOneOnOne.discussions?.map((discussion) => (
                <div key={discussion.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{discussion.user_name}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(discussion.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-gray-700">{discussion.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">One-on-One Meetings</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New One-on-One</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meeting-date">Meeting Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select value={newManagerName} onValueChange={setNewManagerName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                    <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                    <SelectItem value="David Wilson">David Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Initial Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any initial notes or agenda items..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={createOneOnOne} className="w-full">
                Create Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* One-on-ones list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oneOnOnes.map((oneOnOne) => (
          <Card key={oneOnOne.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{format(new Date(oneOnOne.meeting_date), "MMM d, yyyy")}</CardTitle>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">with {oneOnOne.manager_name}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Notes preview */}
              <div>
                <p className="text-sm font-medium text-gray-700">Notes:</p>
                <p className="text-sm text-gray-600 line-clamp-2">{oneOnOne.notes || "No notes added yet."}</p>
              </div>

              {/* Action items summary */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{oneOnOne.action_items?.length || 0} action items</span>
              </div>

              {/* Discussions summary */}
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{oneOnOne.discussions?.length || 0} discussions</span>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 bg-transparent"
                onClick={() => {
                  setSelectedOneOnOne(oneOnOne)
                  setView("detail")
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {oneOnOnes.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No one-on-ones yet</h3>
          <p className="text-gray-600 mb-4">Get started by scheduling your first one-on-one meeting.</p>
        </div>
      )}
    </div>
  )
}
