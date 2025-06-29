import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Target,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Building2,
  Briefcase,
  GraduationCap,
  BarChart3,
  FileText,
  Search,
} from "lucide-react"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { isDatabaseConfigured, DEMO_DEPARTMENTS } from "@/lib/db"

export default function HomePage() {
  const isDemo = !isDatabaseConfigured()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
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
              <Suspense fallback={<div className="h-9 w-20 bg-brand-700 rounded animate-pulse" />}>
                <AdminButton />
              </Suspense>
              <Suspense fallback={<div className="h-9 w-20 bg-brand-700 rounded animate-pulse" />}>
                <LoginButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {isDemo && (
        <Alert className="mx-4 mt-4 border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            <strong>Demo Mode:</strong> This is a preview version with sample data. Database integration is not
            configured.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Navigate Your
            <span className="text-brand-600 block">Career Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover career paths, assess your skills, and plan your professional development with Henry Schein One's
            comprehensive careers matrix platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-brand-600 hover:bg-brand-700" asChild>
              <Link href="/self-review">
                <FileText className="w-5 h-5 mr-2" />
                Start Self Assessment
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/compare">
                <BarChart3 className="w-5 h-5 mr-2" />
                Compare Roles
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Self Assessment</CardTitle>
                <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/self-review">
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Compare Roles</CardTitle>
                <CardDescription>Compare different positions to understand skill requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/compare">
                    Compare Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Explore Departments</CardTitle>
                <CardDescription>Browse roles and skills across different departments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="#departments">
                    Explore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Departments</h2>
            <p className="text-xl text-gray-600">Discover career opportunities across our organization</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_DEPARTMENTS.map((dept) => (
              <Card key={dept.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${dept.color}20` }}
                  >
                    <Building2 className="w-6 h-6" style={{ color: dept.color }} />
                  </div>
                  <CardTitle className="group-hover:text-brand-600 transition-colors">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-brand-50 group-hover:border-brand-200 bg-transparent"
                    asChild
                  >
                    <Link href={`/department/${dept.slug}`}>
                      View Roles
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600">Everything you need for career development</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Assessment</h3>
              <p className="text-gray-600">Comprehensive skill evaluation with detailed feedback and recommendations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Progression</h3>
              <p className="text-gray-600">Clear pathways and requirements for advancing in your career</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learning Resources</h3>
              <p className="text-gray-600">Curated learning materials and development opportunities</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Manager tools for team development and skill gap analysis</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Role Matching</h3>
              <p className="text-gray-600">Find roles that match your skills and career aspirations</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Development Plans</h3>
              <p className="text-gray-600">Personalized development plans based on your goals and assessments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Image
                src="/images/hs1-logo.png"
                alt="Henry Schein One"
                width={150}
                height={40}
                className="brightness-0 invert mb-4"
              />
              <p className="text-gray-400 mb-4">
                Empowering dental professionals with innovative technology solutions and comprehensive career
                development opportunities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
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
                  <Link href="#departments" className="hover:text-white">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white">
                    Profile
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
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
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
