"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: "pod" | "personal"
  color: string
}

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Hiking Pod",
    date: "2024-01-15",
    time: "9:00 AM",
    type: "pod",
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Cooking Class",
    date: "2024-01-18",
    time: "7:00 PM",
    type: "pod",
    color: "bg-orange-500",
  },
  {
    id: "3",
    title: "Photography Walk",
    date: "2024-01-21",
    time: "2:00 PM",
    type: "pod",
    color: "bg-green-500",
  },
]

export function CalendarComponent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useState<CalendarEvent[]>(sampleEvents)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {monthNames[month]} {year}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[80px] p-1 border border-gray-100 dark:border-gray-800 rounded-lg
                  ${day ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" : ""}
                  ${day && isToday(day) ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
                `}
              >
                {day && (
                  <div className="space-y-1">
                    <div
                      className={`text-sm font-medium ${isToday(day) ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {getEventsForDate(day).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                          title={`${event.title} at ${event.time}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Today's Events */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Today's Schedule</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </div>

            {events.filter((event) => {
              const eventDate = new Date(event.date)
              return eventDate.toDateString() === today.toDateString()
            }).length > 0 ? (
              <div className="space-y-2">
                {events
                  .filter((event) => {
                    const eventDate = new Date(event.date)
                    return eventDate.toDateString() === today.toDateString()
                  })
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className={`w-3 h-3 rounded-full ${event.color}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{event.time}</p>
                      </div>
                      <Badge variant={event.type === "pod" ? "default" : "secondary"}>{event.type}</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No events scheduled for today</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
