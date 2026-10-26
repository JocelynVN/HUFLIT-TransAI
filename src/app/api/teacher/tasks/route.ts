import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, TaskStatus, ClipboardPolicy } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createTaskSchema = z.object({
  sourceTextVersionId: z.string().uuid("ID phiên bản văn bản nguồn không hợp lệ"),
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").trim(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  cefrLevelId: z.string(),
  genreId: z.string().optional(),
  instructions: z.string().optional(),
  clipboardPolicy: z.nativeEnum(ClipboardPolicy).default(ClipboardPolicy.WARN),
  maxReevaluations: z.number().int().min(0).max(10).default(2),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.DRAFT),
});

export async function GET(req: NextRequest) {
  const auth = await requireRole([Role.TEACHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const tasks = await prisma.translationTask.findMany({
      include: {
        sourceTextVersion: {
          include: { sourceText: true },
        },
        cefrLevel: true,
        genre: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error("Fetch teacher tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách bài tập" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.TEACHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message },
        },
        { status: 400 }
      );
    }

    const task = await prisma.translationTask.create({
      data: {
        ...result.data,
        createdById: auth.user.id,
      },
      include: {
        cefrLevel: true,
        genre: true,
        sourceTextVersion: true,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "CREATE_TRANSLATION_TASK",
      resourceType: "TranslationTask",
      resourceId: task.id,
      metadata: { title: task.title, status: task.status },
    });

    return NextResponse.json(
      { success: true, data: { task } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tạo bài tập dịch" } },
      { status: 500 }
    );
  }
}
