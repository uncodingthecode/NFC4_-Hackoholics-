"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Download, Share2, Trash2, FileText, Brain, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { reportsAPI, Report } from "@/lib/api";

// Using the Report interface from the API service

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("comprehensive");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast } = useToast();

  const reportTypes = [
    { value: "comprehensive", label: "Comprehensive Health Report", description: "Complete health analysis with all data" },
    { value: "health_summary", label: "Health Summary", description: "Brief overview of current health status" },
    { value: "vital_trends", label: "Vital Signs Trends", description: "Analysis of vital signs over time" },
    { value: "medication_report", label: "Medication Analysis", description: "Medication effectiveness and interactions" },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports();
      setReports(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const payload = {
        type: selectedReportType as Report['type'],
        data_period: `${dateRange.from?.toISOString() || ''} to ${dateRange.to?.toISOString() || ''}`,
        title: `${selectedReportType.replace('_', ' ').toUpperCase()} Report`,
      };

      await reportsAPI.generateReport(payload);
      toast({
        title: "Success",
        description: "Report generated successfully!",
      });
      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (report: Report) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, "_blank");
    } else {
      toast({
        title: "Error",
        description: "PDF not available for this report",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await reportsAPI.deleteReport(reportId);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "comprehensive":
        return <Brain className="h-4 w-4" />;
      case "health_summary":
        return <FileText className="h-4 w-4" />;
      case "vital_trends":
        return <Clock className="h-4 w-4" />;
      case "medication_report":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "comprehensive":
        return "bg-blue-100 text-blue-800";
      case "health_summary":
        return "bg-green-100 text-green-800";
      case "vital_trends":
        return "bg-purple-100 text-purple-800";
      case "medication_report":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Reports</h1>
          <p className="text-muted-foreground">
            Generate AI-powered health reports and insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Create a comprehensive health report using AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            {getReportTypeIcon(type.value)}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range (Optional)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={generateReport} 
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate AI Report
                    </>
                  )}
                </Button>
              </div>

              {generating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating report...</span>
                    <span>This may take a few minutes</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View and manage your generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first report to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-muted">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className={getReportTypeColor(report.type)}>
                              {report.type.replace("_", " ")}
                            </Badge>
                            {report.ai_generated && (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="mr-1 h-3 w-3" />
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generated on {format(new Date(report.generated_at), "MMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{report.title}</DialogTitle>
                              <DialogDescription>
                                Generated on {format(new Date(report.generated_at), "MMM dd, yyyy 'at' h:mm a")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-sans">{report.content}</pre>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {report.pdf_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport(report._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 