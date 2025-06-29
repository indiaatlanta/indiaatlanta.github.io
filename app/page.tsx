import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, FileText, Target, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"

export default function HomePage() {
  const departments = [
    {
      name: "Engineering",
      slug: "engineering",
      description: "Software development, DevOps, and technical architecture roles",
      roleCount: 12,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Product",
      slug: "product",
      description: "Product management, design, and user experience roles",
      roleCount: 8,
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Sales",
      slug: "sales",
      description: "Sales, business development, and customer success roles",
      roleCount: 10,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Digital marketing, content, and brand management roles",
      roleCount: 6,
      color: "bg-orange-100 text-orange-800",
    },
    {
      name: "Operations",
      slug: "operations",
      description: "Operations, finance, and administrative roles",
      roleCount: 9,
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Customer Success",
      slug: "customer-success",
      description: "Customer support, success, and relationship management",
      roleCount: 7,
      color: "bg-teal-100 text-teal-800",
    },
  ]

  const quickActions = [
    {
      title: "Self Assessment",
      description: "Evaluate your current skills against role requirements",
      href: "/self-review",
      icon: FileText,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      title: "Compare Roles",
      description: "Compare skills between different career positions",
      href: "/compare",
      icon: BarChart3,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      title: "Career Path",
      description: "Explore potential career progression opportunities",
      href: "/career-path",
      icon: Target,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
  ]

  const features = [
    {
      title: "Comprehensive Skills Matrix",
      description: "Detailed breakdown of skills required for each role across all departments",
      icon: BarChart3,
    },
    {
      title: "Self-Assessment Tools",
      description: "Evaluate your current skill level and identify areas for improvement",
      icon: FileText,
    },
    {
      title: "Career Progression",
      description: "Visualize potential career paths and required skill development",
      icon: Target,
    },
    {
      title: "Team Management",
      description: "Managers can track team skills and identify training opportunities",
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/hs1-logo.png"
                alt="Henry Schein One"
                width={150}
                height={40}
                className="brightness-0 invert"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold">Careers Matrix</h1>
                <p className="text-brand-100 text-sm">Professional Development Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AdminButton />
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center text-yellow-800 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Demo Mode: Sample data is being used for preview purposes
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Navigate Your
            <span className="text-brand-600"> Career Journey</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Discover skills, compare roles, and chart your path to success with our comprehensive career development
            platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-600 hover:bg-brand-700">
              <Link href="/self-review">
                Start Self Assessment
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/compare">Compare Roles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
            <p className="mt-4 text-lg text-gray-600">Get started with these essential career development tools</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action) => (
              <Card key={action.title} className={`${action.color} transition-colors cursor-pointer`}>
                <Link href={action.href}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <action.icon className="w-8 h-8 text-gray-700" />
                      <CardTitle className="text-gray-900">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700">{action.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Explore Departments</h2>
            <p className="mt-4 text-lg text-gray-600">Browse career opportunities across different departments</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <Card key={dept.slug} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/department/${dept.slug}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{dept.name}</CardTitle>
                      <Badge className={dept.color}>{dept.roleCount} roles</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">{dept.description}</CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need for professional development</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-brand-100 rounded-lg">
                    <feature.icon className="w-8 h-8 text-brand-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Image
                src="/images/hs1-logo.png"
                alt="Henry Schein One"
                width={150}
                height={40}
                className="brightness-0 invert mb-4"
              />
              <p className="text-gray-400 max-w-md">
                Empowering career growth through comprehensive skills assessment and development planning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/self-review" className="hover:text-white">
                    Self Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-white">
                    Compare Roles
                  </Link>
                </li>
                <li>
                  <Link href="/career-path" className="hover:text-white">
                    Career Path
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Henry Schein One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
