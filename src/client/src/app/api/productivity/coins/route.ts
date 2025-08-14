import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/productivity/coins - Get coin history and statistics
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
    const period = searchParams.get("period") || "week"; // day, week, month, year
    const limit = parseInt(searchParams.get("limit") || "100");

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get coin records for the period
    const coinRecords = await prisma.coinRecord.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
        },
      },
      include: {
        task: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });

    // Calculate total coins earned
    const totalCoins = await prisma.coinRecord.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate coins for the current period
    const periodCoins = await prisma.coinRecord.aggregate({
      where: {
        userId: user.id,
        timestamp: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get daily aggregated data for charts
    const dailyCoins = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        SUM(amount) as totalCoins,
        COUNT(*) as recordCount
      FROM coin_records 
      WHERE user_id = ${user.id} 
        AND timestamp >= ${startDate.toISOString()}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;

    // Calculate productivity metrics
    const completedTasks = await prisma.productivityTask.count({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
    });

    const totalHours = await prisma.productivityTask.aggregate({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
      _sum: {
        actualHours: true,
      },
    });

    const avgPriority = await prisma.productivityTask.aggregate({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
      _avg: {
        priority: true,
      },
    });

    const avgDifficulty = await prisma.productivityTask.aggregate({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
      _avg: {
        difficulty: true,
      },
    });

    return NextResponse.json({
      coinRecords,
      statistics: {
        totalCoins: totalCoins._sum.amount || 0,
        periodCoins: periodCoins._sum.amount || 0,
        completedTasks,
        totalHours: totalHours._sum.actualHours || 0,
        avgPriority: avgPriority._avg.priority || 0,
        avgDifficulty: avgDifficulty._avg.difficulty || 0,
        efficiency: (totalHours._sum.actualHours || 0) > 0 
          ? completedTasks / (totalHours._sum.actualHours || 1) 
          : 0,
      },
      dailyCoins,
      period,
    });
  } catch (error) {
    console.error("Error fetching coin data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}