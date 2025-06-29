import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, BookOpen, ArrowRight } from "lucide-react"
import { LoginButton } from "@/components/login-button"

export default function HomePage() {
  const departments = [
    {
      name: "Engineering",
      slug: "engineering",
      description: "Software development, DevOps, and technical architecture roles",
      roleCount: 12,
      color: "bg-blue-50 border-blue-200",
      icon: "💻",
    },
    {
      name: "Product",
      slug: "product",
      description: "Product management, design, and user experience roles",
      roleCount: 8,
      color: "bg-purple-50 border-purple-200",
      icon: "🎯",
    },
    {
      name: "Sales",
      slug: "sales",
      description: "Sales, business development, and customer success roles",
      roleCount: 10,
      color: "bg-green-50 border-green-200",
      icon: "📈",
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Digital marketing, content, and brand management roles",
      roleCount: 6,
      color: "bg-orange-50 border-orange-200",
      icon: "📢",
    },
  ]

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Role Comparison",
      description: "Compare skills and requirements between different career paths",
      href: "/compare",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Self Assessment",
      description: "Evaluate your current skills against role requirements",
      href: "/self-review",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Skills Matrix",
      description: "Explore detailed skill requirements for each department",
      href: "#departments",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Henry Schein One</h1>
                  <p className="text-sm text-gray-600">Career Development Matrix</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Navigate Your Career Journey with <span className="text-blue-600">Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover career paths, compare roles, and assess your skills with our comprehensive career development
              matrix. Built specifically for Henry Schein One team members.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/compare">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Compare Roles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/self-review">
                <Button size="lg" variant="outline">
                  Start Self Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Career Growth</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools to help you understand, compare, and plan your career
              development within Henry Schein One.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">{feature.description}</CardDescription>
                  <Link href={feature.href}>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Career Paths</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive skills matrices organized by department. Each department contains detailed role
              requirements and career progression paths.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link key={dept.slug} href={`/department/${dept.slug}`}>
                <Card className={`${dept.color} hover:shadow-lg transition-all duration-200 cursor-pointer h-full`}>
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{dept.icon}</div>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit mx-auto">
                      {dept.roleCount} roles
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-sm">{dept.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Advance Your Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start exploring opportunities and planning your professional development today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/compare">
              <Button size="lg" variant="secondary">
                Compare Roles
              </Button>
            </Link>
            <Link href="/self-review">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Self Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="font-bold">Henry Schein One</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering dental professionals with innovative technology solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Career Tools</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/compare" className="hover:text-white">
                    Role Comparison
                  </Link>
                </li>
                <li>
                  <Link href="/self-review" className="hover:text-white">
                    Self Assessment
                  </Link>
                </li>
                <li>
                  <Link href="#departments" className="hover:text-white">
                    Skills Matrix
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Departments</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {departments.map((dept) => (
                  <li key={dept.slug}>
                    <Link href={`/department/${dept.slug}`} className="hover:text-white">
                      {dept.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact HR
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
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Henry Schein One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
