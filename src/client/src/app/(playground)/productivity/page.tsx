import { Metadata } from "next";
import ProductivityDashboard from "@/components/productivity/productivity-dashboard";

export const metadata: Metadata = {
  title: "Productivity Tracker | OpenLIT",
  description: "Track your productivity and earn coins based on task completion, priority, and difficulty.",
};

export default function ProductivityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Productivity Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tasks, track your progress, and earn coins based on your productivity.
        </p>
      </div>
      
      <ProductivityDashboard />
    </div>
  );
}