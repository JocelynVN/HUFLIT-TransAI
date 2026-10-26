import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, ConfigStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createRubricSchema = z.object({
  name: z.string().min(3),
  version: z.string().min(2),
  taxonomy: z.record(z.any()),
  scoringConfig: z.record(z.any()),
});

export async function GET() {
  const auth = await requireRole([Role.ADMIN, Role.TEACHER, Role.RESEARCHER]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const rubrics = await prisma.mQMRubricVersion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { feedbackRuns: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: { rubrics },
    });
  } catch (error) {
    console.error("Fetch rubrics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải cấu hình rubric MQM" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createRubricSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { name, version, taxonomy, scoringConfig } = result.data;

    const existing = await prisma.mQMRubricVersion.findUnique({
      where: { version },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_VERSION", message: "Phiên bản rubric đã tồn tại" } },
        { status: 409 }
      );
    }

    const rubric = await prisma.mQMRubricVersion.create({
      data: {
        name,
        version,
        taxonomy,
        scoringConfig,
        status: ConfigStatus.DRAFT,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "CREATE_RUBRIC_VERSION",
      resourceType: "MQMRubricVersion",
      resourceId: rubric.id,
      metadata: { version },
    });

    return NextResponse.json({ success: true, data: { rubric } }, { status: 201 });
  } catch (error) {
    console.error("Create rubric error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tạo cấu hình rubric" } },
      { status: 500 }
    );
  }
}
