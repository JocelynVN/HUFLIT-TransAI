import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    const logs = await prisma.auditLog.findMany({
      where: action ? { action } : undefined,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải nhật ký hệ thống" } },
      { status: 500 }
    );
  }
}
