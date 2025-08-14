"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ProductivityReport } from "@/types/productivity";
import { format } from "date-fns";

export default function DailyReport() {
  const [report, setReport] = useState<ProductivityReport | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const fetchReport = async (date: Date) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/productivity/reports?date=${date.toISOString()}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch report");
      
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error",
        description: "Failed to load daily report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const generateReport = async () => {
    try {
      const response = await fetch("/api/productivity/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: selectedDate.toISOString() }),
      });

      if (!response.ok) throw new Error("Failed to generate report");
      
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
      
      fetchReport(selectedDate);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={generateReport} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Report
        </Button>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
              <CardDescription>
                Productivity metrics for {format(selectedDate, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.summary.totalCoins}</div>
                  <div className="text-sm text-muted-foreground">Coins Earned</div>
                  <div className="flex items-center justify-center mt-1">
                    {getTrendIcon(report.trends.coinTrend)}
                    <span className={`text-xs ml-1 ${getTrendColor(report.trends.coinTrend)}`}>
                      {report.trends.coinTrend > 0 ? "+" : ""}{report.trends.coinTrend.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.summary.tasksCompleted}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  <div className="flex items-center justify-center mt-1">
                    {getTrendIcon(report.trends.taskTrend)}
                    <span className={`text-xs ml-1 ${getTrendColor(report.trends.taskTrend)}`}>
                      {report.trends.taskTrend > 0 ? "+" : ""}{report.trends.taskTrend.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.summary.totalHours.toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">Hours Worked</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.summary.efficiency.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {report.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      {insight}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Tasks */}
          {report.completedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks ({report.completedTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Priority: {task.priority} | Difficulty: {task.difficulty} | 
                          Time: {task.actualHours || task.estimatedHours}h
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {task.coinsEarned} coins
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Tasks */}
          {report.pendingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks ({report.pendingTasks.length})</CardTitle>
                <CardDescription>Tasks that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.pendingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Priority: {task.priority} | Difficulty: {task.difficulty} | 
                          Est. time: {task.estimatedHours}h
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        ~{task.priority * task.difficulty * task.estimatedHours * 10} coins
                      </Badge>
                    </div>
                  ))}
                  {report.pendingTasks.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      And {report.pendingTasks.length - 5} more tasks...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No report data available for this date</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}