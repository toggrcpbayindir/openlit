"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Coins, Clock, Target, TrendingUp, Plus, Calendar } from "lucide-react";
import TaskList from "./task-list";
import TaskForm from "./task-form";
import CoinChart from "./coin-chart";
import DailyReport from "./daily-report";
import { ProductivityStatistics, DailyCoinsData } from "@/types/productivity";

interface ProductivityDashboardProps {}

export default function ProductivityDashboard({}: ProductivityDashboardProps) {
  const [statistics, setStatistics] = useState<ProductivityStatistics | null>(null);
  const [dailyCoins, setDailyCoins] = useState<DailyCoinsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { toast } = useToast();

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/productivity/coins?period=week");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      
      const data = await response.json();
      setStatistics(data.statistics);
      setDailyCoins(data.dailyCoins);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load productivity statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const refreshData = () => {
    fetchStatistics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalCoins || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{statistics?.periodCoins || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(statistics?.totalHours || 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(statistics?.efficiency || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks per hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority and Difficulty Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Progress 
                value={(statistics?.avgPriority || 0) * 20} 
                className="flex-1"
              />
              <Badge variant="outline">
                {(statistics?.avgPriority || 0).toFixed(1)}/5
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Progress 
                value={(statistics?.avgDifficulty || 0) * 20} 
                className="flex-1"
              />
              <Badge variant="outline">
                {(statistics?.avgDifficulty || 0).toFixed(1)}/5
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        <TabsContent value="tasks" className="space-y-4">
          <TaskList onTaskUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coin Earnings Over Time</CardTitle>
              <CardDescription>
                Track your daily coin earnings and productivity trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoinChart data={dailyCoins} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <DailyReport />
        </TabsContent>
      </Tabs>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}