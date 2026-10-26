import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET() {
  const auth = await requireRole([Role.RESEARCHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const studies = await prisma.researchStudy.findMany({
      include: {
        groups: true,
        _count: {
          select: {
            participants: true,
            tests: true,
            surveys: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { studies },
    });
  } catch (error) {
    console.error("Fetch studies error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách đề tài nghiên cứu" } },
      { status: 500 }
    );
  }
}
