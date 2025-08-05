"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Watch, 
  Activity, 
  Heart, 
  Moon, 
  Scale, 
  Zap, 
  Link, 
  Unlink, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Smartphone,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { wearablesAPI, Wearable } from "@/lib/api";

// Using the Wearable interface from the API service

interface SyncStatus {
  device_type: string;
  device_name: string;
  last_sync: string;
  sync_frequency: string;
  is_active: boolean;
}

export default function WearablesPage() {
  const [wearables, setWearables] = useState<Wearable[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const { toast } = useToast();

  const deviceTypes = [
    {
      type: "fitbit",
      name: "Fitbit",
      icon: <Watch className="h-6 w-6" />,
      description: "Connect your Fitbit device to sync activity, heart rate, sleep, and weight data",
      color: "bg-blue-500",
      features: ["Steps", "Heart Rate", "Sleep", "Weight", "Calories"]
    },
    {
      type: "apple_health",
      name: "Apple Health",
      icon: <Smartphone className="h-6 w-6" />,
      description: "Sync data from Apple Health app including activity, vitals, and health metrics",
      color: "bg-green-500",
      features: ["Steps", "Heart Rate", "Sleep", "Weight", "Calories", "Blood Pressure"]
    },
    {
      type: "garmin",
      name: "Garmin",
      icon: <Watch className="h-6 w-6" />,
      description: "Connect your Garmin device for comprehensive fitness and health tracking",
      color: "bg-orange-500",
      features: ["Steps", "Heart Rate", "Sleep", "Weight", "Calories", "GPS"]
    },
    {
      type: "samsung_health",
      name: "Samsung Health",
      icon: <Smartphone className="h-6 w-6" />,
      description: "Sync data from Samsung Health app for comprehensive health monitoring",
      color: "bg-purple-500",
      features: ["Steps", "Heart Rate", "Sleep", "Weight", "Calories"]
    }
  ];

  useEffect(() => {
    fetchWearables();
    fetchSyncStatus();
  }, []);

  const fetchWearables = async () => {
    try {
      setLoading(true);
      const response = await wearablesAPI.getUserWearables();
      setWearables(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wearables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await wearablesAPI.getSyncStatus();
      setSyncStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  };

  const connectDevice = async (deviceType: string) => {
    try {
      if (deviceType === "fitbit") {
        // For Fitbit, we need to get the auth URL first
        const authResponse = await fetch("/api/v1/cloud-sync/auth/fitbit", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const authData = await authResponse.json();
        const authUrl = authData.data.authUrl;
        
        if (authUrl) {
          window.open(authUrl, "_blank", "width=600,height=600");
          
          // Listen for the callback
          const checkConnection = setInterval(async () => {
            try {
              await fetchWearables();
              const connected = wearables.some(w => w.device_type === deviceType && w.is_active);
              if (connected) {
                clearInterval(checkConnection);
                toast({
                  title: "Success",
                  description: `${deviceType} connected successfully!`,
                });
              }
            } catch (error) {
              console.error("Error checking connection:", error);
            }
          }, 2000);

          // Stop checking after 5 minutes
          setTimeout(() => clearInterval(checkConnection), 300000);
        }
      } else if (deviceType === "apple_health") {
        // For Apple Health, we'll use a different approach
        toast({
          title: "Apple Health Integration",
          description: "Apple Health integration requires additional setup. Please contact support.",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect device",
        variant: "destructive",
      });
    }
  };

  const syncDevice = async (deviceType: string) => {
    try {
      setSyncing(true);
      await wearablesAPI.syncWearableData(deviceType);
      toast({
        title: "Success",
        description: `${deviceType} data synced successfully!`,
      });
      fetchSyncStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync device data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const disconnectDevice = async (wearableId: string) => {
    try {
      await wearablesAPI.disconnectWearable(wearableId);
      toast({
        title: "Success",
        description: "Device disconnected successfully",
      });
      fetchWearables();
      fetchSyncStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect device",
        variant: "destructive",
      });
    }
  };

  const updateSyncFrequency = async (wearableId: string, frequency: string) => {
    try {
      // Note: This endpoint doesn't exist in the current API, so we'll show a message
      toast({
        title: "Info",
        description: "Sync frequency update feature coming soon",
      });
      // TODO: Add updateSyncFrequency method to wearablesAPI when backend supports it
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sync frequency",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const device = deviceTypes.find(d => d.type === deviceType);
    return device?.icon || <Watch className="h-6 w-6" />;
  };

  const getDeviceColor = (deviceType: string) => {
    const device = deviceTypes.find(d => d.type === deviceType);
    return device?.color || "bg-gray-500";
  };

  const getStatusIcon = (isActive: boolean, lastSync?: string) => {
    if (!isActive) return <WifiOff className="h-4 w-4 text-red-500" />;
    
    if (!lastSync) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    
    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const diffHours = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (diffHours < 24) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-orange-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wearable Devices</h1>
          <p className="text-muted-foreground">
            Connect and sync your wearable devices for comprehensive health tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="connect">Connect New Device</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Manage your connected wearable devices and sync settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : wearables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Watch className="mx-auto h-12 w-12 mb-4" />
                  <p>No devices connected</p>
                  <p className="text-sm">Connect a wearable device to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wearables.map((wearable) => (
                    <div
                      key={wearable._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getDeviceColor(wearable.device_type)} text-white`}>
                          {getDeviceIcon(wearable.device_type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{wearable.device_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">
                              {wearable.device_type.replace("_", " ")}
                            </Badge>
                            {getStatusIcon(wearable.is_active, wearable.last_sync)}
                                                         <span className="text-sm text-muted-foreground">
                               Last sync: {wearable.last_sync ? format(new Date(wearable.last_sync), "MMM dd, h:mm a") : "Never"}
                             </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {wearable.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                                                 <Select
                           value={wearable.sync_frequency}
                           onValueChange={(value: string) => updateSyncFrequency(wearable._id, value)}
                         >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncDevice(wearable.device_type)}
                          disabled={syncing}
                        >
                          {syncing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectDevice(wearable._id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connect" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deviceTypes.map((device) => (
              <Card key={device.type} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${device.color} text-white`}>
                      {device.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>{device.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {device.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => connectDevice(device.type)}
                    className="w-full"
                    disabled={wearables.some(w => w.device_type === device.type && w.is_active)}
                  >
                    {wearables.some(w => w.device_type === device.type && w.is_active) ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Link className="mr-2 h-4 w-4" />
                        Connect {device.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>
                Monitor the sync status of your connected devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getDeviceColor(status.device_type)} text-white`}>
                        {getDeviceIcon(status.device_type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{status.device_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sync frequency: {status.sync_frequency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status.is_active, status.last_sync)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(status.last_sync), "MMM dd, h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 