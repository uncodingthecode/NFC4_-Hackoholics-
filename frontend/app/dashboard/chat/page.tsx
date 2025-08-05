"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Paperclip, User, Bot } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "doctor" | "ai"
  content: string
  timestamp: Date
  attachments?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      content: "Hello! I'm your AI health assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "2",
      sender: "user",
      content: "I've been experiencing some chest discomfort lately. Should I be concerned?",
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: "3",
      sender: "ai",
      content:
        "I understand your concern about chest discomfort. While I can provide general information, it's important to consult with a healthcare professional for proper evaluation. Based on your recent vitals, I notice your blood pressure has been slightly elevated. I recommend scheduling an appointment with Dr. Johnson.",
      timestamp: new Date(Date.now() - 15000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content:
          "Thank you for your message. I'm analyzing your health data to provide the best recommendations. Is there anything specific you'd like me to focus on?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case "user":
        return <User className="h-4 w-4" />
      case "doctor":
        return <User className="h-4 w-4 text-blue-600" />
      case "ai":
        return <Bot className="h-4 w-4 text-teal-600" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getSenderName = (sender: string) => {
    switch (sender) {
      case "user":
        return "You"
      case "doctor":
        return "Dr. Johnson"
      case "ai":
        return "AI Assistant"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Chat Portal</h1>
          <p className="text-gray-600">Communicate with your healthcare team and AI assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            AI Assistant Online
          </Badge>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-teal-600" />
            Health Consultation Chat
          </CardTitle>
          <CardDescription>Chat with your AI health assistant or healthcare providers</CardDescription>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === "user" ? "bg-teal-100" : message.sender === "ai" ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {getSenderIcon(message.sender)}
              </div>
              <div className={`flex-1 max-w-[70%] ${message.sender === "user" ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{getSenderName(message.sender)}</span>
                  <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-teal-600 hover:bg-teal-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This is an AI assistant. For medical emergencies, call 911 immediately.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Upload Report</h3>
            <p className="text-sm text-gray-600 mb-3">Share lab results or medical reports</p>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Paperclip className="mr-2 h-3 w-3" />
              Upload File
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Schedule Appointment</h3>
            <p className="text-sm text-gray-600 mb-3">Book a consultation with your doctor</p>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Schedule Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Emergency Contact</h3>
            <p className="text-sm text-gray-600 mb-3">Quick access to emergency services</p>
            <Button variant="destructive" size="sm" className="w-full">
              Emergency Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
