"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  Coins, 
  MoreVertical, 
  Play, 
  CheckCircle, 
  XCircle,
  Edit
} from "lucide-react";
import { ProductivityTask, TASK_PRIORITIES, TASK_DIFFICULTIES, TASK_STATUSES } from "@/types/productivity";
import TaskForm from "./task-form";

interface TaskListProps {
  onTaskUpdate: () => void;
}

export default function TaskList({ onTaskUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<ProductivityTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<ProductivityTask | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const url = filter === "all" 
        ? "/api/productivity/tasks" 
        : `/api/productivity/tasks?status=${filter}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const updateTaskStatus = async (taskId: string, status: string, actualHours?: number) => {
    try {
      const response = await fetch(`/api/productivity/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, actualHours }),
      });

      if (!response.ok) throw new Error("Failed to update task");
      
      toast({
        title: "Success",
        description: `Task ${status === "completed" ? "completed" : "updated"} successfully`,
      });
      
      fetchTasks();
      onTaskUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/productivity/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      fetchTasks();
      onTaskUpdate();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: number) => {
    const priorityConfig = TASK_PRIORITIES.find(p => p.value === priority);
    return (
      <Badge variant="outline" className={priorityConfig?.color}>
        {priorityConfig?.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: number) => {
    const difficultyConfig = TASK_DIFFICULTIES.find(d => d.value === difficulty);
    return (
      <Badge variant="outline" className={difficultyConfig?.color}>
        {difficultyConfig?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
    return (
      <Badge variant="outline" className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const calculateEstimatedCoins = (task: ProductivityTask) => {
    const baseMultiplier = 10;
    const hours = task.estimatedHours;
    const efficiencyBonus = hours <= 1 ? 1.2 : 1;
    return Math.round(task.priority * task.difficulty * hours * baseMultiplier * efficiencyBonus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {["all", "pending", "in_progress", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {task.status === "pending" && (
                        <DropdownMenuItem 
                          onClick={() => updateTaskStatus(task.id, "in_progress")}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </DropdownMenuItem>
                      )}
                      {task.status !== "completed" && (
                        <DropdownMenuItem 
                          onClick={() => {
                            const hours = prompt("How many hours did you spend on this task?");
                            if (hours && !isNaN(Number(hours))) {
                              updateTaskStatus(task.id, "completed", Number(hours));
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status and Badges */}
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                  {getDifficultyBadge(task.difficulty)}
                </div>

                {/* Task Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {task.actualHours || task.estimatedHours}h
                      {task.actualHours && ` (est. ${task.estimatedHours}h)`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {task.status === "completed" 
                        ? `${task.coinsEarned} coins`
                        : `~${calculateEstimatedCoins(task)} coins`
                      }
                    </span>
                  </div>
                  
                  <div className="text-muted-foreground">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                  
                  {task.completedAt && (
                    <div className="text-muted-foreground">
                      Completed: {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            fetchTasks();
            onTaskUpdate();
          }}
        />
      )}
    </div>
  );
}