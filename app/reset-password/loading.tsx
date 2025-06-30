import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg">Loading...</span>
      </div>
    </div>
  )
}
