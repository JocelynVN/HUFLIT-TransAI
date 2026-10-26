import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, UserStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const statusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = statusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Trạng thái không hợp lệ" } },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: result.data.status },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "UPDATE_USER_STATUS",
      resourceType: "User",
      resourceId: updated.id,
      metadata: { status: updated.status },
    });

    return NextResponse.json({
      success: true,
      data: { user: updated },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi cập nhật trạng thái người dùng" } },
      { status: 500 }
    );
  }
}
