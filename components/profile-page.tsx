"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowLeft,
  Camera,
  Star,
  MapPin,
  Calendar,
  Settings,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
} from "lucide-react"
import Link from "next/link"

const userProfile = {
  name: "Leena shah",
  email: "leena123@gmail.com",
  avatar: "/placeholder.svg?height=120&width=120",
  bio: "Adventure seeker and tech enthusiast. Love connecting with like-minded people for outdoor activities and hackathons!",
  location: "Ahmedabad, Gujarat",
  age: 28,
  gender: "Female",
  joinDate: "March 2024",
  trustScore: 4.9,
  badges: ["Verified", "Super Connector", "Event Organizer"],
  interests: ["hiking", "tech", "photography", "travel", "food", "music"],
  stats: {
    podsJoined: 23,
    podsCreated: 8,
    connections: 47,
    rating: 4.9,
  },
  preferences: {
    locationRadius: "25",
    ageRange: "20-23",
    notifications: {
      podInvites: true,
      messages: true,
      reminders: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showLocation: true,
      showAge: false,
      showStats: true,
    },
  },
}

const availableInterests = [
  "hiking",
  "tech",
  "photography",
  "travel",
  "food",
  "music",
  "art",
  "fitness",
  "gaming",
  "reading",
  "cooking",
  "dancing",
  "sports",
  "movies",
  "volunteering",
]

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(userProfile)
  const [newInterest, setNewInterest] = useState("")

  const handleSave = () => {
    setIsEditing(false)
    // Save profile changes
  }

  const addInterest = (interest: string) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }))
    }
    setNewInterest("")
  }

  const removeInterest = (interestToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((interest) => interest !== interestToRemove),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your SyncUp profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        {isEditing ? (
                          <Input
                            value={profile.name}
                            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                            className="text-2xl font-bold mb-2"
                          />
                        ) : (
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {profile.joinDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-lg">{profile.trustScore}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Trust Score</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile.badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.stats.podsJoined}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pods Joined</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{profile.stats.podsCreated}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pods Created</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{profile.stats.connections}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">{profile.stats.rating}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="Tell people about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                      <span>{interest}</span>
                      {isEditing && (
                        <button onClick={() => removeInterest(interest)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex space-x-2">
                    <Select value={newInterest} onValueChange={setNewInterest}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add an interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInterests
                          .filter((interest) => !profile.interests.includes(interest))
                          .map((interest) => (
                            <SelectItem key={interest} value={interest}>
                              {interest}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => addInterest(newInterest)} disabled={!newInterest}>
                      Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matching Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="locationRadius">Location Radius (km)</Label>
                  <Select
                    value={profile.preferences.locationRadius}
                    onValueChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, locationRadius: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="100">100 km</SelectItem>
                      <SelectItem value="500">500 km</SelectItem>
                      <SelectItem value="1000">1000 km</SelectItem>
                      <SelectItem value="10000">Anywhere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ageRange">Preferred Age Range</Label>
                  <Select
                    value={profile.preferences.ageRange}
                    onValueChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        preferences: { ...prev.preferences, ageRange: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                      <SelectItem value="any">Any age</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profile.preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === "podInvites" && "Get notified when someone invites you to a Pod"}
                        {key === "messages" && "Receive notifications for new messages"}
                        {key === "reminders" && "Get reminders about upcoming Pod activities"}
                        {key === "marketing" && "Receive updates about new features and tips"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setProfile((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: { ...prev.preferences.notifications, [key]: checked },
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profile.preferences.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === "profileVisible" && "Allow others to find and view your profile"}
                        {key === "showLocation" && "Display your location on your profile"}
                        {key === "showAge" && "Show your age to other users"}
                        {key === "showStats" && "Display your Pod statistics publicly"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {value ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          setProfile((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              privacy: { ...prev.preferences.privacy, [key]: checked },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
