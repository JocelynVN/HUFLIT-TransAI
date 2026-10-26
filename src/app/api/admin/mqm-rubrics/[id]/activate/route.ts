import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, ConfigStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const target = await prisma.mQMRubricVersion.findUnique({
      where: { id: params.id },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy rubric" } },
        { status: 404 }
      );
    }

    // Archive current active
    await prisma.mQMRubricVersion.updateMany({
      where: { status: ConfigStatus.ACTIVE },
      data: { status: ConfigStatus.ARCHIVED },
    });

    // Activate selected
    const activated = await prisma.mQMRubricVersion.update({
      where: { id: params.id },
      data: {
        status: ConfigStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "ACTIVATE_RUBRIC_VERSION",
      resourceType: "MQMRubricVersion",
      resourceId: activated.id,
      metadata: { version: activated.version },
    });

    return NextResponse.json({
      success: true,
      data: { rubric: activated },
    });
  } catch (error) {
    console.error("Activate rubric error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi kích hoạt rubric" } },
      { status: 500 }
    );
  }
}
