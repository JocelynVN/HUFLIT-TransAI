import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, AttemptStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireRole([Role.ADMIN, Role.TEACHER]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalTasks,
      totalAttempts,
      totalFeedbackRuns,
      aiUsageRecords,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.userRole.count({ where: { role: Role.STUDENT } }),
      prisma.userRole.count({ where: { role: Role.TEACHER } }),
      prisma.translationTask.count(),
      prisma.translationAttempt.count(),
      prisma.feedbackRun.count(),
      prisma.aIUsageRecord.findMany({
        select: { totalTokens: true, estimatedCost: true },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true, name: true } } },
      }),
    ]);

    const totalTokensUsed = aiUsageRecords.reduce((acc, r) => acc + r.totalTokens, 0);
    const totalCostEstimated = aiUsageRecords.reduce((acc, r) => acc + r.estimatedCost, 0);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalTasks,
          totalAttempts,
          totalFeedbackRuns,
          totalTokensUsed,
          totalCostEstimated: Math.round(totalCostEstimated * 1000) / 1000,
          aiBudgetUsd: parseFloat(process.env.AI_DAILY_BUDGET_USD || "50.0"),
          systemHealth: "OPERATIONAL",
          databaseStatus: "CONNECTED",
          aiProvider: process.env.AI_PROVIDER || "mock",
        },
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải thống kê hệ thống" } },
      { status: 500 }
    );
  }
}
