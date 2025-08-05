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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  Settings, 
  Shield, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Lock,
  Unlock,
  Database,
  Smartphone,
  Monitor,
  Tablet,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cloudSyncAPI, CloudSync } from "@/lib/api";

interface CloudSyncStatus {
  cloud_provider: string;
  sync_status: string;
  last_sync: string;
  next_sync: string;
  sync_frequency: string;
  storage_used: number;
  storage_limit: number;
  data_types: string[];
}

interface SyncSettings {
  sync_frequency: string;
  data_types: string[];
}

export default function CloudSyncPage() {
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SyncSettings>({
    sync_frequency: "daily",
    data_types: ["vitals", "medications", "prescriptions", "reports", "profile"]
  });
  const { toast } = useToast();

  const cloudProviders = [
    {
      id: "google_drive",
      name: "Google Drive",
      icon: <Cloud className="h-6 w-6" />,
      description: "Secure cloud storage with Google Drive integration",
      color: "bg-blue-500",
      features: ["15GB Free", "End-to-end encryption", "Cross-platform sync"]
    },
    {
      id: "dropbox",
      name: "Dropbox",
      icon: <Cloud className="h-6 w-6" />,
      description: "Reliable cloud storage with Dropbox integration",
      color: "bg-blue-600",
      features: ["2GB Free", "File versioning", "Offline access"]
    },
    {
      id: "onedrive",
      name: "OneDrive",
      icon: <Cloud className="h-6 w-6" />,
      description: "Microsoft's cloud storage solution",
      color: "bg-blue-700",
      features: ["5GB Free", "Office integration", "Real-time sync"]
    }
  ];

  const dataTypes = [
    { id: "vitals", label: "Vital Signs", icon: <Heart className="h-4 w-4" /> },
    { id: "medications", label: "Medications", icon: <Database className="h-4 w-4" /> },
    { id: "prescriptions", label: "Prescriptions", icon: <Database className="h-4 w-4" /> },
    { id: "reports", label: "Health Reports", icon: <Database className="h-4 w-4" /> },
    { id: "profile", label: "Profile Data", icon: <Database className="h-4 w-4" /> }
  ];

  const syncFrequencies = [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ];

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await cloudSyncAPI.getSyncStatus();
      const data = response.data.data;
      setSyncStatus(data);
      if (data) {
        setSettings({
          sync_frequency: data.sync_frequency,
          data_types: data.data_types
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sync status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeCloudSync = async (provider: string) => {
    try {
      await cloudSyncAPI.initializeCloudSync({
        sync_type: provider as any,
        data_types: settings.data_types,
        sync_frequency: settings.sync_frequency,
      });
      toast({
        title: "Success",
        description: "Cloud sync initialized successfully",
      });
      fetchSyncStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize cloud sync",
        variant: "destructive",
      });
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const response = await cloudSyncAPI.getGoogleDriveAuthUrl();
      const authUrl = response.data.data.authUrl;
      
      if (authUrl) {
        window.open(authUrl, "_blank", "width=600,height=600");
        
        // Listen for the callback
        const checkConnection = setInterval(async () => {
          try {
            await fetchSyncStatus();
            if (syncStatus?.cloud_provider === "google_drive") {
              clearInterval(checkConnection);
              toast({
                title: "Success",
                description: "Google Drive connected successfully!",
              });
            }
          } catch (error) {
            console.error("Error checking connection:", error);
          }
        }, 2000);

        // Stop checking after 5 minutes
        setTimeout(() => clearInterval(checkConnection), 300000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Google Drive",
        variant: "destructive",
      });
    }
  };

  const syncToCloud = async () => {
    try {
      setSyncing(true);
      await cloudSyncAPI.syncToCloud();
      toast({
        title: "Success",
        description: "Data synced to cloud successfully!",
      });
      fetchSyncStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data to cloud",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncFromCloud = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/v1/cloud-sync/sync-from-cloud", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Data synced from cloud successfully!",
        });
        fetchSyncStatus();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data from cloud",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateSettings = async () => {
    try {
      const response = await fetch("/api/v1/cloud-sync/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sync settings updated successfully",
        });
        fetchSyncStatus();
        setShowSettings(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStoragePercentage = () => {
    if (!syncStatus) return 0;
    return (syncStatus.storage_used / syncStatus.storage_limit) * 100;
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cloud Sync</h1>
          <p className="text-muted-foreground">
            Secure cloud storage and synchronization across all your devices
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Cloud Providers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : syncStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                  {getStatusIcon(syncStatus.sync_status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{syncStatus.sync_status.replace("_", " ")}</div>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {format(new Date(syncStatus.last_sync), "MMM dd, h:mm a")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatStorage(syncStatus.storage_used)}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatStorage(syncStatus.storage_limit)} used
                  </p>
                  <Progress value={getStoragePercentage()} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Sync</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(new Date(syncStatus.next_sync), "MMM dd")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {syncStatus.sync_frequency} sync schedule
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Cloud Sync Configured</CardTitle>
                <CardDescription>
                  Set up cloud sync to backup and sync your health data across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowSettings(true)}>
                  <Cloud className="mr-2 h-4 w-4" />
                  Setup Cloud Sync
                </Button>
              </CardContent>
            </Card>
          )}

          {syncStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manual sync operations and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={syncToCloud}
                    disabled={syncing}
                    className="flex-1"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Sync to Cloud
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={syncFromCloud}
                    disabled={syncing}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Sync from Cloud
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cloudProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${provider.color} text-white`}>
                      {provider.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {provider.features.map((feature) => (
                        <li key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => {
                      if (provider.id === "google_drive") {
                        connectGoogleDrive();
                      } else {
                        initializeCloudSync(provider.id);
                      }
                    }}
                    className="w-full"
                    disabled={syncStatus?.cloud_provider === provider.id}
                  >
                    {syncStatus?.cloud_provider === provider.id ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" />
                        Connect {provider.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure your cloud sync preferences and data types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sync Frequency</label>
                <Select
                  value={settings.sync_frequency}
                  onValueChange={(value) => setSettings({ ...settings, sync_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {syncFrequencies.map((frequency) => (
                      <SelectItem key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Types to Sync</label>
                <div className="space-y-2">
                  {dataTypes.map((dataType) => (
                    <div key={dataType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={dataType.id}
                        checked={settings.data_types.includes(dataType.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSettings({
                              ...settings,
                              data_types: [...settings.data_types, dataType.id]
                            });
                          } else {
                            setSettings({
                              ...settings,
                              data_types: settings.data_types.filter(id => id !== dataType.id)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={dataType.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center space-x-2"
                      >
                        {dataType.icon}
                        <span>{dataType.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={updateSettings} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cloud Sync Setup</DialogTitle>
            <DialogDescription>
              Choose your cloud provider and configure sync settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cloud Provider</label>
              <Select
                value={syncStatus?.cloud_provider || ""}
                onValueChange={(value) => initializeCloudSync(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cloud provider" />
                </SelectTrigger>
                <SelectContent>
                  {cloudProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Frequency</label>
              <Select
                value={settings.sync_frequency}
                onValueChange={(value) => setSettings({ ...settings, sync_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncFrequencies.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={updateSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 