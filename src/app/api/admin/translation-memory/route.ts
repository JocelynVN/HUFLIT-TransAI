import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasAnyRole, requireRole } from "@/lib/rbac";
import { Role, TMStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createTMSchema = z.object({
  sourceText: z.string().min(1).trim(),
  targetText: z.string().min(1).trim(),
  sourceLanguage: z.string().default("en"),
  targetLanguage: z.string().default("vi"),
  domain: z.string().optional(),
  provenance: z.string().optional(),
  status: z.nativeEnum(TMStatus).default(TMStatus.APPROVED),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const domain = searchParams.get("domain");
    const isStaff = hasAnyRole(auth.user, [Role.ADMIN, Role.TEACHER]);

    const entries = await prisma.translationMemoryEntry.findMany({
      where: {
        // Students can only see APPROVED entries
        ...(!isStaff ? { status: TMStatus.APPROVED } : {}),
        ...(domain ? { domain: { contains: domain, mode: "insensitive" } } : {}),
        ...(query
          ? {
              OR: [
                { sourceText: { contains: query, mode: "insensitive" } },
                { targetText: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { entries },
    });
  } catch (error) {
    console.error("Fetch TM error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải Translation Memory" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.TEACHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createTMSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const entry = await prisma.translationMemoryEntry.create({
      data: {
        ...result.data,
        approvedById: auth.user.id,
        approvedAt: result.data.status === TMStatus.APPROVED ? new Date() : null,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "CREATE_TM_ENTRY",
      resourceType: "TranslationMemoryEntry",
      resourceId: entry.id,
    });

    return NextResponse.json({ success: true, data: { entry } }, { status: 201 });
  } catch (error) {
    console.error("Create TM entry error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi thêm mục Translation Memory" } },
      { status: 500 }
    );
  }
}
