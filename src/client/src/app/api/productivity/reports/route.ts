import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/productivity/reports - Generate daily productivity reports
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    
    // Set to start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get or create daily summary
    let dailySummary = await prisma.dailyProductivitySummary.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: startOfDay,
        },
      },
    });

    // Calculate daily metrics
    const completedTasks = await prisma.productivityTask.findMany({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        coinRecords: true,
      },
    });

    const totalCoins = completedTasks.reduce((sum, task) => sum + task.coinsEarned, 0);
    const totalHours = completedTasks.reduce((sum, task) => sum + (task.actualHours || task.estimatedHours), 0);
    const avgPriority = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => sum + task.priority, 0) / completedTasks.length 
      : 0;
    const avgDifficulty = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => sum + task.difficulty, 0) / completedTasks.length 
      : 0;
    const efficiency = totalHours > 0 ? completedTasks.length / totalHours : 0;

    // Update or create daily summary
    dailySummary = await prisma.dailyProductivitySummary.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: startOfDay,
        },
      },
      update: {
        totalCoins,
        tasksCompleted: completedTasks.length,
        totalHours,
        avgPriority,
        avgDifficulty,
        efficiency,
      },
      create: {
        userId: user.id,
        date: startOfDay,
        totalCoins,
        tasksCompleted: completedTasks.length,
        totalHours,
        avgPriority,
        avgDifficulty,
        efficiency,
      },
    });

    // Get pending tasks for the day
    const pendingTasks = await prisma.productivityTask.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["pending", "in_progress"],
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [
        { priority: "desc" },
        { difficulty: "desc" },
      ],
    });

    // Get historical data for trends (last 7 days)
    const sevenDaysAgo = new Date(startOfDay);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const historicalSummaries = await prisma.dailyProductivitySummary.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
          lt: startOfDay,
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 7,
    });

    // Calculate trends
    const avgDailyCoins = historicalSummaries.length > 0 
      ? historicalSummaries.reduce((sum, day) => sum + day.totalCoins, 0) / historicalSummaries.length 
      : 0;
    const avgDailyTasks = historicalSummaries.length > 0 
      ? historicalSummaries.reduce((sum, day) => sum + day.tasksCompleted, 0) / historicalSummaries.length 
      : 0;

    // Generate insights and recommendations
    const insights = [];
    
    if (totalCoins > avgDailyCoins * 1.2) {
      insights.push("🎉 Exceptional day! You earned 20% more coins than your average.");
    } else if (totalCoins < avgDailyCoins * 0.8) {
      insights.push("📈 Consider focusing on higher priority tasks to increase your coin earnings.");
    }

    if (efficiency > 1) {
      insights.push("⚡ Great efficiency! You're completing more than one task per hour.");
    } else if (efficiency < 0.5) {
      insights.push("🎯 Try breaking down larger tasks into smaller, manageable pieces.");
    }

    if (avgPriority >= 4) {
      insights.push("🎯 Excellent focus on high-priority tasks!");
    } else if (avgPriority <= 2) {
      insights.push("🔥 Consider prioritizing more important tasks for better productivity.");
    }

    return NextResponse.json({
      summary: dailySummary,
      completedTasks,
      pendingTasks,
      trends: {
        avgDailyCoins,
        avgDailyTasks,
        coinTrend: totalCoins - avgDailyCoins,
        taskTrend: completedTasks.length - avgDailyTasks,
      },
      insights,
      historicalData: historicalSummaries,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/productivity/reports/generate - Manually trigger report generation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { date } = body;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Force regeneration of daily summary
    const response = await fetch(`${req.nextUrl.origin}/api/productivity/reports?date=${startOfDay.toISOString()}`, {
      method: 'GET',
      headers: req.headers,
    });

    const reportData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}