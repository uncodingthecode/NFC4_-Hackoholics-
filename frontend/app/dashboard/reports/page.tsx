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
"use client";

import { useRef, useState } from "react";
import { useHealthcare } from "@/context/healthcare-context";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, FileText, TrendingUp, Activity, Pill, Heart } from "lucide-react";

export default function ReportsPage() {
  const { vitals, medications, profile } = useHealthcare();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate comprehensive dummy data for better visualization
  const generateDummyVitals = () => {
    const dummyVitals = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days of data
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      dummyVitals.push({
        date: date.toLocaleDateString(),
        systolic: Math.floor(Math.random() * 40) + 110, // 110-150
        diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
        sugar: Math.floor(Math.random() * 60) + 80, // 80-140
        temperature: Math.floor(Math.random() * 4) + 96, // 96-100
        weight: Math.floor(Math.random() * 10) + 65, // 65-75
        heartRate: Math.floor(Math.random() * 30) + 60, // 60-90
      });
    }
    return dummyVitals;
  };

  const dummyVitals = generateDummyVitals();
  const chartData = vitals.length > 0 ? vitals.map((v) => ({
    date: new Date(v.timestamp).toLocaleDateString(),
    systolic: v.bp_systolic,
    diastolic: v.bp_diastolic,
    sugar: v.sugar,
    temperature: v.temperature,
    weight: v.weight,
  })) : dummyVitals;

  // Medication adherence data
  const medicationAdherence = [
    { name: "Taken", value: 85, color: "#10b981" },
    { name: "Missed", value: 15, color: "#ef4444" },
  ];

  // Health score data
  const healthScoreData = [
    { month: "Jan", score: 75 },
    { month: "Feb", score: 78 },
    { month: "Mar", score: 82 },
    { month: "Apr", score: 79 },
    { month: "May", score: 85 },
    { month: "Jun", score: 88 },
  ];

  const downloadReport = () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      let yPosition = 20;
      const pageHeight = 297;
      const margin = 20;
      const lineHeight = 7;
      
      // Helper function to add text and handle page breaks
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(text, margin, yPosition);
        yPosition += lineHeight + (fontSize - 12) * 0.5;
      };

      // Header
      addText("HEALTH SUMMARY REPORT", 20, true);
      addText(`Generated on ${new Date().toLocaleDateString()}`, 12);
      yPosition += 10;

      // Patient Information
      if (profile) {
        addText("PATIENT INFORMATION", 16, true);
        yPosition += 5;
        addText(`Name: ${profile.gender === "Male" ? "Mr." : "Ms."} ${profile.user_id}`);
        addText(`Age: ${Math.floor((new Date().getTime() - new Date(profile.DOB).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`);
        addText(`Gender: ${profile.gender}`);
        addText(`Blood Group: ${profile.blood_group}`);
        addText(`Height: ${profile.height} cm`);
        addText(`Weight: ${profile.weight} kg`);
        yPosition += 10;
      }

      // Current Vitals
      addText("CURRENT VITALS SUMMARY", 16, true);
      yPosition += 5;
      if (last) {
        addText(`Blood Pressure: ${last.systolic}/${last.diastolic} mmHg`);
        addText(`Blood Sugar: ${last.sugar} mg/dL`);
        addText(`Weight: ${last.weight} kg`);
        addText(`Temperature: ${last.temperature} °F`);
      } else {
        addText("No vitals recorded");
      }
      yPosition += 10;

      // Health Progress
      if (first && last) {
        addText("HEALTH PROGRESS COMPARISON", 16, true);
        yPosition += 5;
        addText(`Blood Pressure: ${first.systolic}/${first.diastolic} → ${last.systolic}/${last.diastolic} mmHg`);
        addText(`Blood Sugar: ${first.sugar} → ${last.sugar} mg/dL`);
        addText(`Weight: ${first.weight} → ${last.weight} kg`);
        addText(`Temperature: ${first.temperature} → ${last.temperature} °F`);
        yPosition += 10;
      }

      // Medication Adherence
      addText("MEDICATION ADHERENCE", 16, true);
      yPosition += 5;
      addText("Taken: 85%");
      addText("Missed: 15%");
      addText("Status: Excellent adherence rate!");
      yPosition += 10;

      // Health Score Trend
      addText("HEALTH SCORE TREND (Last 6 Months)", 16, true);
      yPosition += 5;
      healthScoreData.forEach((data) => {
        addText(`${data.month}: ${data.score}/100`);
      });
      yPosition += 10;

      // Current Medications
      addText("CURRENT MEDICATIONS", 16, true);
      yPosition += 5;
      if (medications.length === 0) {
        addText("No medications currently prescribed.");
      } else {
        medications.forEach((med) => {
          addText(`${med.medicine_name} - ${med.dosage}`, 12, true);
          addText(`  Frequency: ${med.frequency}`);
          addText(`  Timing: ${med.timing.join(", ")}`);
          addText(`  Stock: ${med.stock_count}${med.stock_count <= med.refill_alert_threshold ? " (LOW STOCK)" : ""}`);
          yPosition += 2;
        });
      }

      // Footer
      yPosition += 10;
      addText("This report was generated automatically by the HealthCare Management System", 10);
      addText("For any questions, please consult with your healthcare provider", 10);

      pdf.save(`Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const first = chartData[0];
  const last = chartData[chartData.length - 1];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Health Summary Report</h1>
        </div>
                 <Button 
           onClick={downloadReport} 
           disabled={isGeneratingPDF}
           className="flex items-center gap-2"
         >
           <Download className="h-4 w-4" />
           {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
         </Button>
      </div>

      <div
        ref={reportRef}
        className="bg-white text-black p-8 rounded-lg max-w-6xl mx-auto font-sans shadow-lg"
      >
        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Health Summary Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* User Profile Info */}
        {profile && (
          <Card className="mb-8 border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Name:</p>
                  <p className="text-gray-900">{profile.gender === "Male" ? "Mr." : "Ms."} {profile.user_id}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Age:</p>
                  <p className="text-gray-900">{Math.floor((new Date().getTime() - new Date(profile.DOB).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Gender:</p>
                  <p className="text-gray-900">{profile.gender}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Blood Group:</p>
                  <p className="text-gray-900">{profile.blood_group}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Height:</p>
                  <p className="text-gray-900">{profile.height} cm</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Weight:</p>
                  <p className="text-gray-900">{profile.weight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Vitals Summary */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Current Vitals Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="text-2xl font-bold text-red-600">{last?.systolic || 120}/{last?.diastolic || 80}</p>
                <p className="text-xs text-gray-500">mmHg</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Blood Sugar</p>
                <p className="text-2xl font-bold text-blue-600">{last?.sugar || 95}</p>
                <p className="text-xs text-gray-500">mg/dL</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-2xl font-bold text-purple-600">{last?.weight || 70}</p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-2xl font-bold text-orange-600">{last?.temperature || 98.6}</p>
                <p className="text-xs text-gray-500">°F</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Trends Chart */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vitals Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!isGeneratingPDF ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} name="Systolic BP" />
                    <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={3} name="Diastolic BP" />
                    <Line type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={3} name="Blood Sugar" />
                    <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={3} name="Temperature" />
                    <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} name="Weight" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">Chart rendering for PDF...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Progress Comparison */}
        {first && last && (
          <Card className="mb-8 border-2">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Health Progress Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Blood Pressure</p>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {first.systolic}/{first.diastolic} → {last.systolic}/{last.diastolic}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Blood Sugar</p>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {first.sugar} → {last.sugar}
                    </p>
                    <p className="text-xs text-gray-500">mg/dL</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Weight</p>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {first.weight} → {last.weight}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Temperature</p>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {first.temperature} → {last.temperature}
                    </p>
                    <p className="text-xs text-gray-500">°F</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medication Adherence */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Adherence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={medicationAdherence}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {medicationAdherence.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Taken: 85%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Missed: 15%</span>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold">Excellent adherence rate!</p>
                  <p className="text-xs text-green-600">Keep up the good work with your medication schedule.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Score Trend */}
        <Card className="mb-8 border-2">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {medications.length === 0 ? (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No medications currently prescribed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Medication Name</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Dosage</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Frequency</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Timing</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Stock Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med._id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">{med.medicine_name}</td>
                        <td className="border border-gray-300 px-4 py-3">{med.dosage}</td>
                        <td className="border border-gray-300 px-4 py-3">{med.frequency}</td>
                        <td className="border border-gray-300 px-4 py-3">{med.timing.join(", ")}</td>
                        <td className={`border border-gray-300 px-4 py-3 font-semibold ${
                          med.stock_count <= med.refill_alert_threshold ? "text-red-600" : "text-green-600"
                        }`}>
                          {med.stock_count}
                          {med.stock_count <= med.refill_alert_threshold && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Low Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
          <p>This report was generated automatically by the HealthCare Management System</p>
          <p>For any questions, please consult with your healthcare provider</p>
        </div>
      </div>
    </div>
  );
}