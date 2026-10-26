import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role, TextStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createSourceTextSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").trim(),
  body: z.string().min(10, "Nội dung văn bản tối thiểu 10 ký tự").trim(),
  sourceLanguage: z.enum(["en", "vi"]),
  genreId: z.string().optional(),
  sourceReference: z.string().optional(),
  licenseInformation: z.string().optional(),
  status: z.nativeEnum(TextStatus).default(TextStatus.DRAFT),
});

export async function GET(req: NextRequest) {
  const auth = await requireRole([Role.TEACHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TextStatus | null;

    const sourceTexts = await prisma.sourceText.findMany({
      where: status ? { status } : undefined,
      include: {
        genre: true,
        createdBy: { select: { id: true, name: true, email: true } },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        _count: { select: { versions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { sourceTexts },
    });
  } catch (error) {
    console.error("Fetch source texts error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách văn bản nguồn" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.TEACHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createSourceTextSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message },
        },
        { status: 400 }
      );
    }

    const { title, body: textBody, sourceLanguage, genreId, sourceReference, licenseInformation, status } = result.data;

    const sourceText = await prisma.sourceText.create({
      data: {
        title,
        body: textBody,
        sourceLanguage,
        genreId,
        sourceReference,
        licenseInformation,
        status,
        createdById: auth.user.id,
        versions: {
          create: [
            {
              versionNumber: 1,
              body: textBody,
            },
          ],
        },
      },
      include: {
        versions: true,
        genre: true,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "CREATE_SOURCE_TEXT",
      resourceType: "SourceText",
      resourceId: sourceText.id,
      metadata: { title, sourceLanguage },
    });

    return NextResponse.json(
      {
        success: true,
        data: { sourceText },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create source text error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tạo văn bản nguồn" } },
      { status: 500 }
    );
  }
}
