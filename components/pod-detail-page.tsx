"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Send,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  Share,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

interface PodDetailPageProps {
  podId: string
}

const podData = {
  id: 1,
  name: "Weekend Hiking Adventure",
  description:
    "Join us for an amazing hiking experience in Matheran! We'll explore scenic trails, enjoy breathtaking views, and connect with nature. Perfect for both beginners and experienced hikers. Bring your camera for some incredible photo opportunities!",
  tags: ["outdoor", "fitness", "nature", "photography"],
  time: "Saturday 9:00 AM - 4:00 PM",
  location: "Loiusa Point, Matheran",
  members: 6,
  maxMembers: 8,
  rating: 4.8,
  organizer: {
    name: "Leena Shah",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4.9,
    badges: ["Verified", "Super Host"],
  },
  membersList: [
    { name: "Luv Patel", avatar: "/placeholder.svg?height=32&width=32", status: "going" },
    { name: "Khushi Sheth", avatar: "/placeholder.svg?height=32&width=32", status: "going" },
    { name: "Krupal Virani", avatar: "/placeholder.svg?height=32&width=32", status: "maybe" },
    { name: "Diya Patel", avatar: "/placeholder.svg?height=32&width=32", status: "going" },
    { name: "Vedant Shah", avatar: "/placeholder.svg?height=32&width=32", status: "going" },
    { name: "Paridhi Maheshawari", avatar: "/placeholder.svg?height=32&width=32", status: "maybe" },
  ],
  timeOptions: [
    { time: "Saturday 9:00 AM", votes: 5 },
    { time: "Saturday 10:00 AM", votes: 3 },
    { time: "Sunday 9:00 AM", votes: 2 },
  ],
}

const chatMessages = [
  {
    id: 1,
    user: "Leena Shah",
    avatar: "/placeholder.svg?height=32&width=32",
    message: "Hey everyone! Looking forward to our hike this weekend. The weather looks perfect!",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Luv Patel",
    avatar: "/placeholder.svg?height=32&width=32",
    message: "Should we bring lunch or are there places to eat along the trail?",
    time: "1 hour ago",
  },
  {
    id: 3,
    user: "Khushi Sheth",
    avatar: "/placeholder.svg?height=32&width=32",
    message: "I'd suggest bringing packed lunch. There's a great spot halfway up with amazing views!",
    time: "45 minutes ago",
  },
]

export function PodDetailPage({ podId }: PodDetailPageProps) {
  const [rsvpStatus, setRsvpStatus] = useState<"yes" | "maybe" | "no" | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(chatMessages)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        message: newMessage,
        time: "Just now",
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleRSVP = (status: "yes" | "maybe" | "no") => {
    setRsvpStatus(status)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{podData.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{podData.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {podData.members}/{podData.maxMembers} members
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pod Banner */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {podData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{podData.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                        <p className="font-medium">{podData.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="font-medium">{podData.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                        <p className="font-medium">
                          {podData.members}/{podData.maxMembers} joined
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Section */}
            <Card>
              <CardHeader>
                <CardTitle>Will you be joining us?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant={rsvpStatus === "yes" ? "default" : "outline"}
                    onClick={() => handleRSVP("yes")}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes, I'm in!
                  </Button>
                  <Button
                    variant={rsvpStatus === "maybe" ? "default" : "outline"}
                    onClick={() => handleRSVP("maybe")}
                    className="flex-1"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Maybe
                  </Button>
                  <Button
                    variant={rsvpStatus === "no" ? "destructive" : "outline"}
                    onClick={() => handleRSVP("no")}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Can't make it
                  </Button>
                </div>
                {rsvpStatus && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {rsvpStatus === "yes" && "Great! You're all set. We'll send you updates about the Pod."}
                      {rsvpStatus === "maybe" && "Thanks for letting us know. We'll keep you posted!"}
                      {rsvpStatus === "no" && "No worries! Maybe next time."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Poll */}
            <Card>
              <CardHeader>
                <CardTitle>Vote on the best time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {podData.timeOptions.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.time}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{option.votes} votes</span>
                    </div>
                    <Progress value={(option.votes / podData.members) * 100} className="h-2" />
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Vote for your preferred time
                </Button>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pod Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{message.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.user}</span>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={podData.organizer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{podData.organizer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{podData.organizer.name}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{podData.organizer.rating}</span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      {podData.organizer.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Message Organizer
                </Button>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Members ({podData.members}/{podData.maxMembers})
                  </span>
                  <Progress value={(podData.members / podData.maxMembers) * 100} className="w-16 h-2" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {podData.membersList.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      <Badge variant={member.status === "going" ? "default" : "secondary"} className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {podData.members < podData.maxMembers && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {podData.maxMembers - podData.members} spots remaining
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Pods */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Pods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Photography Walk</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sun 2:00 PM • Science City</p>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">6/10 members</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Hiking</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sat 8:00 AM • Pavagadh</p>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">4/6 members</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Similar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
