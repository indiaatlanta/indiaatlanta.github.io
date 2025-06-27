"use client"

import Link from "next/link"
import { ExternalLink, Rocket, Settings } from "lucide-react"

const departments = [
  {
    name: "Engineering",
    positions: 5,
    teamSkills: 12,
    icons: ["📊", "🔗", "🔧", "📋", "📈"],
    emoji: "",
  },
  {
    name: "Customer Success",
    positions: 5,
    teamSkills: 7,
    icons: ["💎", "☕", "📋", "⭐", "👥"],
    emoji: "💙",
  },
  {
    name: "Support",
    positions: 5,
    teamSkills: 14,
    icons: ["🔍", "🧠", "📊", "❌", "🔍"],
    emoji: "📊",
  },
  {
    name: "Design",
    positions: 24,
    teamSkills: 12,
    icons: ["🎨", "✨", "📱", "📋", "⚙️"],
    emoji: "🎨",
  },
  {
    name: "Engineering",
    positions: 9,
    teamSkills: 21,
    icons: ["💻", "🔧", "📋", "⚙️", "🏠"],
    emoji: "👨‍💻",
  },
  {
    name: "Finance",
    positions: 5,
    teamSkills: 8,
    icons: ["💰", "⚙️", "📊", "💳", "💰"],
    emoji: "💰",
  },
  {
    name: "Marketing/Growth",
    positions: 35,
    teamSkills: 97,
    icons: ["📧", "⭐", "📧", "🔄", "📈"],
    emoji: "🚀",
  },
  {
    name: "Operations",
    positions: 10,
    teamSkills: 15,
    icons: ["🔧", "🏭", "📋", "📊", "⚙️"],
    emoji: "⚙️",
  },
  {
    name: "People",
    positions: 15,
    teamSkills: 50,
    icons: ["👥", "📋", "⚙️", "📊", "💙"],
    emoji: "👥",
  },
  {
    name: "Product",
    positions: 0,
    teamSkills: 0,
    icons: ["📋", "🔗", "📊", "📈", "📋"],
    emoji: "⚠️",
  },
  {
    name: "Product Analytics",
    positions: 0,
    teamSkills: 0,
    icons: ["⚙️", "🔧", "🔧", "❌", "📋"],
    emoji: "📊",
  },
  {
    name: "Strategic Finance",
    positions: 0,
    teamSkills: 0,
    icons: ["⚙️", "⚖️", "📊", "📋", "⚙️"],
    emoji: "🧠",
  },
]

export default function Home() {
  // For demo purposes, show admin button in development mode
  const isDemoMode = process.env.NODE_ENV === "development"
  const showAdminButton = isDemoMode

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-900 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-xs">HS1</span>
              </div>
            </div>
            {/* Admin Button - show in demo mode */}
            {showAdminButton && (
              <Link
                href="/admin"
                className="bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel (Demo)
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{"Henry Schein One Career Development"}</h1>
            <Rocket className="w-6 h-6 text-gray-600" />
          </div>
          <Link
            href="https://careers.henryscheinone.co.uk/"
            className="text-amber-700 hover:text-amber-800 flex items-center gap-1 text-sm"
          >
            https://careers.henryscheinone.co.uk/
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Database Status Banner */}
        {!process.env.DATABASE_URL && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Running in preview mode. Database features are simulated for demonstration purposes.
            </p>
          </div>
        )}

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <Link key={index} href={`/department/${dept.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
              <div className="bg-amber-900 text-white rounded-lg overflow-hidden hover:bg-amber-800 transition-colors cursor-pointer">
                {/* Header */}
                <div className="p-4 pb-3">
                  <input
                    type="text"
                    value={dept.name}
                    onChange={(e) => {
                      // Handle the change - you'll need to add state management
                      console.log("Department name changed to:", e.target.value)
                    }}
                    className="text-lg font-semibold mb-3 bg-transparent border-none text-white placeholder-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-200 rounded px-1"
                    placeholder="Department name"
                  />

                  {/* Icons */}
                  <div className="flex gap-3 mb-4">
                    {dept.icons.map((icon, iconIndex) => (
                      <span key={iconIndex} className="text-amber-200 text-lg">
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-white text-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dept.name}</span>
                      {dept.emoji && <span className="text-lg">{dept.emoji}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>
                      Positions <span className="font-medium">{dept.positions}</span>
                    </span>
                    <span>
                      Team Skills <span className="font-medium">{dept.teamSkills}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
