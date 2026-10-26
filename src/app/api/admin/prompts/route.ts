import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, ConfigStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createPromptSchema = z.object({
  name: z.string().min(3),
  version: z.string().min(2),
  systemInstruction: z.string().min(20),
  developerContext: z.string().optional(),
});

export async function GET() {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const prompts = await prisma.promptVersion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { feedbackRuns: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: { prompts },
    });
  } catch (error) {
    console.error("Fetch prompts error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách prompts" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createPromptSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { name, version, systemInstruction, developerContext } = result.data;

    // Check duplicate version
    const existing = await prisma.promptVersion.findUnique({
      where: { version },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_VERSION", message: "Phiên bản prompt đã tồn tại" } },
        { status: 409 }
      );
    }

    const prompt = await prisma.promptVersion.create({
      data: {
        name,
        version,
        systemInstruction,
        developerContext,
        status: ConfigStatus.DRAFT,
        createdById: auth.user.id,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "CREATE_PROMPT_VERSION",
      resourceType: "PromptVersion",
      resourceId: prompt.id,
      metadata: { version },
    });

    return NextResponse.json({ success: true, data: { prompt } }, { status: 201 });
  } catch (error) {
    console.error("Create prompt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tạo phiên bản prompt mới" } },
      { status: 500 }
    );
  }
}
