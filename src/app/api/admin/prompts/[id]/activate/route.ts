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
    const target = await prisma.promptVersion.findUnique({
      where: { id: params.id },
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy prompt" } },
        { status: 404 }
      );
    }

    // Deactivate previous active prompts
    await prisma.promptVersion.updateMany({
      where: { status: ConfigStatus.ACTIVE },
      data: { status: ConfigStatus.ARCHIVED },
    });

    // Activate selected prompt
    const activated = await prisma.promptVersion.update({
      where: { id: params.id },
      data: {
        status: ConfigStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "ACTIVATE_PROMPT_VERSION",
      resourceType: "PromptVersion",
      resourceId: activated.id,
      metadata: { version: activated.version },
    });

    return NextResponse.json({
      success: true,
      data: { prompt: activated },
    });
  } catch (error) {
    console.error("Activate prompt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi kích hoạt prompt" } },
      { status: 500 }
    );
  }
}
