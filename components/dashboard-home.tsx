"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin, Clock, Star, Users } from "lucide-react"
import Link from "next/link"

const recommendedPods = [
  {
    id: 1,
    name: "Weekend Hiking Adventure",
    description: "Explore local trails and enjoy nature with fellow hiking enthusiasts",
    tags: ["outdoor", "fitness", "nature"],
    time: "Sat 9:00 AM",
    location: "Matheran Mountains",
    members: 4,
    maxMembers: 8,
    rating: 4.8,
  },
  {
    id: 2,
    name: "AI Hackathon Team",
    description: "Building the next big AI application in 48 hours",
    tags: ["tech", "hackathon", "AI"],
    time: "Fri 6:00 PM",
    location: "Nirma University",
    members: 3,
    maxMembers: 5,
    rating: 4.9,
  },
  {
    id: 3,
    name: "Photography Walk",
    description: "Capture the city's beauty through our lenses",
    tags: ["photography", "art", "urban"],
    time: "Sun 2:00 PM",
    location: "Science City",
    members: 6,
    maxMembers: 10,
    rating: 4.7,
  },
  {
    id: 4,
    name: "Cooking Class & Dinner",
    description: "Learn to cook Italian cuisine and enjoy together",
    tags: ["cooking", "food", "social"],
    time: "Thu 7:00 PM",
    location: "Culinary Studio",
    members: 5,
    maxMembers: 8,
    rating: 4.6,
  },
  {
    id: 5,
    name: "Live Music Concert Night",
    description: "Enjoy an evening filled with live performances and great company",
    tags: ["music", "social", "nightlife"],
    time: "Sat 8:00 PM",
    location: "Novotel Ahmedabad",
    members: 7,
    maxMembers: 20,
    rating: 4.9,
  },
  {
    id: 6,
    name: "Sunset Yoga Session",
    description: "Relax and unwind with guided yoga as the sun sets",
    tags: ["fitness", "outdoor", "wellness"],
    time: "Mon 6:30 PM",
    location: "Riverfront Park",
    members: 7,
    maxMembers: 10,
    rating: 4.75,
  },
]

export function DashboardHome() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const filteredPods = recommendedPods.filter((pod) => {
    const matchesSearch =
      pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || pod.tags.includes(selectedFilter)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by interest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interests</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="outdoor">Outdoor</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Pods</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold">4.9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
                <p className="text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Pods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Pods</h2>
          <Badge variant="secondary">{filteredPods.length} available</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPods.map((pod) => (
            <Card key={pod.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{pod.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{pod.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{pod.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {pod.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{pod.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{pod.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {pod.members}/{pod.maxMembers} members
                    </span>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href={`/pod/${pod.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
