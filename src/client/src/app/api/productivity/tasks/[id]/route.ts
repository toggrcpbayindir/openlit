import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Calculate coin value based on priority, difficulty, and hours
function calculateCoins(priority: number, difficulty: number, hours: number): number {
  // Base coin formula: (priority * difficulty * hours) * base_multiplier
  const baseMultiplier = 10;
  const efficiencyBonus = hours <= 1 ? 1.2 : 1; // Bonus for quick completion
  return Math.round(priority * difficulty * hours * baseMultiplier * efficiencyBonus);
}

// PUT /api/productivity/tasks/[id] - Update task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { title, description, priority, difficulty, estimatedHours, status, actualHours } = body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.productivityTask.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If completing the task, calculate coins
    let coinsEarned = existingTask.coinsEarned;
    let completedAt = existingTask.completedAt;

    if (status === "completed" && existingTask.status !== "completed") {
      const hoursWorked = actualHours || estimatedHours || existingTask.estimatedHours;
      coinsEarned = calculateCoins(
        priority || existingTask.priority,
        difficulty || existingTask.difficulty,
        hoursWorked
      );
      completedAt = new Date();
    }

    const task = await prisma.productivityTask.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority: Math.max(1, Math.min(5, priority)) }),
        ...(difficulty && { difficulty: Math.max(1, Math.min(5, difficulty)) }),
        ...(estimatedHours && { estimatedHours }),
        ...(status && { status }),
        ...(actualHours && { actualHours }),
        coinsEarned,
        completedAt,
      },
      include: {
        coinRecords: true,
      },
    });

    // Create coin record if task was completed
    if (status === "completed" && existingTask.status !== "completed") {
      await prisma.coinRecord.create({
        data: {
          taskId: task.id,
          userId: user.id,
          amount: coinsEarned,
          reason: "completion",
          metadata: JSON.stringify({
            priority: task.priority,
            difficulty: task.difficulty,
            hours: task.actualHours || task.estimatedHours,
          }),
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/productivity/tasks/[id] - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if task exists and belongs to user
    const task = await prisma.productivityTask.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete task and associated coin records (cascading)
    await prisma.productivityTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}