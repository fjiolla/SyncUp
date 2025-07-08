"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConstellationAnimation } from "@/components/constellation-animation"
import { ArrowRight, Users, Calendar, MapPin, Star, Quote } from "lucide-react"
import Link from "next/link"

export function LandingPage() {
  const testimonials = [
    {
      name: "Leena Shah",
      role: "Software Engineer",
      content: "Found my hackathon team through SyncUp and we won first place! The availability matching is genius.",
      rating: 5,
    },
    {
      name: "Krupal Virani",
      role: "Travel Enthusiast",
      content: "Discovered amazing travel buddies who share my love for adventure. Best decision ever!",
      rating: 5,
    },
    {
      name: "Khushi Sheth",
      role: "Creative Director",
      content: "Perfect for finding collaborators for creative projects. The interest matching is spot-on.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">SyncUp</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  🚀 Now in Beta
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Meet Your Match for{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                    Moments That Matter
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Find people who are free when you are, for what you love. Join Pods for trips, hackathons, parties,
                  and collaborative projects.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  asChild
                >
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Explore Pods</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>10K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>500+ Pods Created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>50+ Cities</span>
                </div>
              </div>
            </div>

            <div className="relative h-96 lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/20 dark:to-orange-900/20 rounded-2xl">
                <ConstellationAnimation />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 z-10">
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Connect • Collaborate • Create
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">How SyncUp Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to find your perfect Pod match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Set Your Availability</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Share when you're free and what activities interest you most
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Find Your Pod</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover Pods that match your schedule, interests, and location
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Make It Happen</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect, plan, and create amazing experiences together
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">What Our Users Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Real stories from real connections</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Find Your Pod?</h2>
          <p className="text-xl text-blue-100">Join thousands of users who've already found their perfect matches</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link href="/dashboard">
              Start Connecting Today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SyncUp</span>
              </div>
              <p className="text-gray-400">Connecting people for moments that matter.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Product</h3>
              <div className="space-y-2 text-gray-400">
                <p>Features</p>
                <p>Pricing</p>
                <p>API</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Company</h3>
              <div className="space-y-2 text-gray-400">
                <p>About</p>
                <p>Blog</p>
                <p>Careers</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Support</h3>
              <div className="space-y-2 text-gray-400">
                <p>Help Center</p>
                <p>Contact</p>
                <p>Privacy</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SyncUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
