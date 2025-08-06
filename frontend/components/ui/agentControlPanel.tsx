"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { agentService } from "@/services/agentService"
import { Bot, Users, Trash2, RefreshCw, Activity, User } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast" // or your toast library

interface AgentStatus {
  isRunning: boolean;
  lastRun?: Date;
  user?: {
    id: string;
    name: string;
  };
}

interface AgentControlPanelProps {
  onAgentRun?: () => void; // Callback when agent runs successfully
  showFamilyControls?: boolean;
  showCleanup?: boolean;
  showStatus?: boolean;
}

export default function AgentControlPanel({ 
  onAgentRun,
  showFamilyControls = true,
  showCleanup = false,
  showStatus = true
}: AgentControlPanelProps) {
  const [isRunningAgent, setIsRunningAgent] = useState(false)
  const [isRunningFamily, setIsRunningFamily] = useState(false)
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)

  // Load agent status on component mount
  useEffect(() => {
    loadAgentStatus()
  }, [])

  const loadAgentStatus = async () => {
    try {
      const result = await agentService.getAgentStatus()
      if (result.success) {
        setAgentStatus(result.data)
      }
    } catch (error) {
      console.error("Error loading agent status:", error)
    }
  }

  // Run AI agent for current user
  const handleRunMyAgent = async () => {
    setIsRunningAgent(true)
    try {
      const result = await agentService.runMyAgent()
      
      if (result.success) {
        toast.success(result.data.message || "AI Agent executed successfully!")
        onAgentRun?.()
        await loadAgentStatus()
      } else {
        toast.error(result.error || "Failed to run AI Agent")
      }
    } catch (error) {
      console.error("Error running agent:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsRunningAgent(false)
    }
  }

  // Run AI agents for family
  const handleRunFamilyAgents = async () => {
    setIsRunningFamily(true)
    try {
      const result = await agentService.runFamilyAgents()
      
      if (result.success) {
        toast.success(result.data.message || "Family AI Agents executed successfully!")
        onAgentRun?.()
        await loadAgentStatus()
      } else {
        toast.error(result.error || "Failed to run Family AI Agents")
      }
    } catch (error) {
      console.error("Error running family agents:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsRunningFamily(false)
    }
  }

  // Run AI agents for all users (admin function)
  const handleRunAllAgents = async () => {
    setIsRunningAll(true)
    try {
      const result = await agentService.runAllAgents()
      
      if (result.success) {
        toast.success(result.data.message || "All AI Agents executed successfully!")
        onAgentRun?.()
        await loadAgentStatus()
      } else {
        toast.error(result.error || "Failed to run All AI Agents")
      }
    } catch (error) {
      console.error("Error running all agents:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsRunningAll(false)
    }
  }

  // Cleanup old data
  const handleCleanup = async () => {
    setIsCleaning(true)
    try {
      const result = await agentService.cleanup()
      
      if (result.success) {
        toast.success("Old alerts and notifications cleaned up successfully!")
        onAgentRun?.() // Refresh data
      } else {
        toast.error(result.error || "Failed to cleanup old data")
      }
    } catch (error) {
      console.error("Error during cleanup:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsCleaning(false)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Activity className="h-5 w-5" />
          AI Agent Control Panel
        </CardTitle>
        <CardDescription className="text-blue-600">
          Manually trigger AI health analysis and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Status Display */}
          {showStatus && agentStatus && (
            <div className="p-3 bg-card rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-blue-800">Agent Status</p>
                <Badge variant={agentStatus.isRunning ? "default" : "secondary"}>
                  {agentStatus.isRunning ? "Running" : "Idle"}
                </Badge>
              </div>
              {agentStatus.user && (
                <p className="text-sm text-blue-600">
                  Logged in as: {agentStatus.user.name}
                </p>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Run My Agent */}
            <Button
              onClick={handleRunMyAgent}
              disabled={isRunningAgent}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
            >
              {isRunningAgent ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              Run My Agent
            </Button>

            {/* Run Family Agents */}
            {showFamilyControls && (
              <Button
                onClick={handleRunFamilyAgents}
                disabled={isRunningFamily}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                {isRunningFamily ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Run Family Agents
              </Button>
            )}

            {/* Run All Agents (Admin) */}
            <Button
              onClick={handleRunAllAgents}
              disabled={isRunningAll}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
            >
              {isRunningAll ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Run All Agents
            </Button>

            {/* Cleanup */}
            {showCleanup && (
              <Button
                onClick={handleCleanup}
                disabled={isCleaning}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent sm:col-span-2 lg:col-span-1"
              >
                {isCleaning ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Cleanup Old Data
              </Button>
            )}
          </div>

          {/* Quick Instructions */}
          <div className="p-3 bg-card rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">
              <strong>Tip:</strong> AI Agents automatically run every 5 minutes, but you can manually trigger 
              them here for immediate health analysis and alert generation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}