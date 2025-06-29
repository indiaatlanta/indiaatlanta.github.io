import Link from "next/link"
import { ArrowRight, Users, Target, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminButton from "@/components/admin-button"
import LoginButton from "@/components/login-button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      {/* Header */}
      <header className="bg-brand-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">HS1 Careers Matrix</h1>
                <p className="text-brand-200 text-sm">Engineering Career Development Framework</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AdminButton />
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Navigate Your Engineering Career at <span className="text-brand-600">Henry Schein One</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your path from Junior Engineer to Principal Engineer with our comprehensive skills framework.
            Understand expectations, identify growth opportunities, and accelerate your career development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/self-review">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3">
                Start Self-Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                size="lg"
                variant="outline"
                className="border-brand-600 text-brand-600 hover:bg-brand-50 px-8 py-3 bg-transparent"
              >
                Compare Roles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Grow</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive framework provides clear guidance for every stage of your engineering career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-brand-600 mb-2" />
                <CardTitle className="text-lg">Clear Expectations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Understand exactly what's expected at each level, from technical skills to leadership capabilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-brand-600 mb-2" />
                <CardTitle className="text-lg">Growth Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your progress and identify specific areas for improvement with detailed skill assessments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-brand-600 mb-2" />
                <CardTitle className="text-lg">Role Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compare different engineering levels to understand your next career step and required skills.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-brand-600 mb-2" />
                <CardTitle className="text-lg">Structured Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built on industry best practices with clear skill categories and measurable competencies.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Levels Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Engineering Career Levels</h3>
            <p className="text-lg text-gray-600">
              Explore each level to understand the skills and responsibilities that define career progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                level: "E1",
                title: "Junior Engineer",
                description: "Foundation building with mentorship and learning core engineering practices.",
                href: "/department/junior-engineer",
              },
              {
                level: "E2",
                title: "Software Engineer",
                description: "Independent contributor developing technical expertise and delivery skills.",
                href: "/department/software-engineer",
              },
              {
                level: "E3",
                title: "Senior Engineer",
                description: "Technical leadership, mentoring others, and driving complex projects.",
                href: "/department/senior-engineer",
              },
              {
                level: "E4",
                title: "Lead Engineer",
                description: "Cross-team collaboration, technical strategy, and organizational impact.",
                href: "/department/lead-engineer",
              },
              {
                level: "E5",
                title: "Principal Engineer",
                description: "Company-wide technical leadership and strategic technology decisions.",
                href: "/department/principal-engineer",
              },
            ].map((role) => (
              <Link key={role.level} href={role.href}>
                <Card className="border-brand-200 hover:shadow-lg transition-all hover:border-brand-400 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {role.level}
                      </div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{role.description}</CardDescription>
                    <div className="mt-4 flex items-center text-brand-600 text-sm font-medium">
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-brand-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Accelerate Your Career?</h3>
          <p className="text-xl text-brand-100 mb-8">
            Take the first step towards your next promotion with a comprehensive self-assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/self-review">
              <Button size="lg" variant="secondary" className="bg-white text-brand-600 hover:bg-gray-100 px-8 py-3">
                Start Your Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-brand-700 px-8 py-3 bg-transparent"
              >
                Explore Career Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
              <div>
                <div className="font-semibold">Henry Schein One</div>
                <div className="text-gray-400 text-sm">Engineering Career Development</div>
              </div>
            </div>
            <div className="text-gray-400 text-sm">© 2024 Henry Schein One. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
