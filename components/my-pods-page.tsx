"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MapPin, Star, MessageCircle, Calendar, Plus } from "lucide-react"
import Link from "next/link"

const myPods = {
  active: [
    {
      id: 1,
      name: "Weekend Hiking Adventure",
      status: "confirmed",
      date: "2024-01-15",
      time: "9:00 AM",
      location: "Matheran Mountains",
      members: 6,
      maxMembers: 8,
      role: "member",
      lastActivity: "2 hours ago",
    },
    {
      id: 2,
      name: "AI Hackathon Team",
      status: "planning",
      date: "2024-01-20",
      time: "6:00 PM",
      location: "Nirma University",
      members: 4,
      maxMembers: 5,
      role: "organizer",
      lastActivity: "30 minutes ago",
    },
  ],
  past: [
    {
      id: 3,
      name: "Photography Walk",
      status: "completed",
      date: "2024-01-05",
      time: "2:00 PM",
      location: "Science City",
      members: 8,
      maxMembers: 10,
      role: "member",
      rating: 4.8,
    },
    {
      id: 4,
      name: "Cooking Class",
      status: "completed",
      date: "2023-12-28",
      time: "7:00 PM",
      location: "Culinary Studio",
      members: 6,
      maxMembers: 8,
      role: "organizer",
      rating: 4.9,
    },
  ],
  created: [
    {
      id: 5,
      name: "Beach Volleyball Tournament",
      status: "recruiting",
      date: "2024-01-25",
      time: "3:00 PM",
      location: "Chowpathy",
      members: 3,
      maxMembers: 12,
      role: "organizer",
      lastActivity: "1 day ago",
    },
  ],
}

export function MyPodsPage() {
  const [activeTab, setActiveTab] = useState("active")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "planning":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "recruiting":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const PodCard = ({ pod, showActions = true }: { pod: any; showActions?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{pod.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
              <Badge variant="outline" className="text-xs">
                {pod.role}
              </Badge>
            </div>
          </div>
          {pod.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{pod.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>
              {pod.date} at {pod.time}
            </span>
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
          {pod.lastActivity && (
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Last activity: {pod.lastActivity}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <Button className="flex-1" asChild>
              <Link href={`/pod/${pod.id}`}>View Details</Link>
            </Button>
            {pod.role === "organizer" && <Button variant="outline">Manage</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{myPods.active.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Pods</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{myPods.past.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{myPods.created.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Pods Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active ({myPods.active.length})</TabsTrigger>
            <TabsTrigger value="created">Created ({myPods.created.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({myPods.past.length})</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link href="/create-pod">
              <Plus className="h-4 w-4 mr-2" />
              Create New Pod
            </Link>
          </Button>
        </div>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPods.active.map((pod) => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="created" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPods.created.map((pod) => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPods.past.map((pod) => (
              <PodCard key={pod.id} pod={pod} showActions={false} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
