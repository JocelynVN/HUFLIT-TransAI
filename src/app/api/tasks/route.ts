import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { TaskStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const cefr = searchParams.get("cefr");
    const direction = searchParams.get("direction"); // e.g. "en-vi" or "vi-en"
    const genreSlug = searchParams.get("genre");
    const search = searchParams.get("search");

    let sourceLanguage: string | undefined = undefined;
    let targetLanguage: string | undefined = undefined;

    if (direction) {
      const parts = direction.split("-");
      if (parts.length === 2) {
        sourceLanguage = parts[0];
        targetLanguage = parts[1];
      }
    }

    const tasks = await prisma.translationTask.findMany({
      where: {
        status: TaskStatus.PUBLISHED,
        ...(cefr ? { cefrLevel: { code: cefr.toUpperCase() } } : {}),
        ...(sourceLanguage ? { sourceLanguage } : {}),
        ...(targetLanguage ? { targetLanguage } : {}),
        ...(genreSlug ? { genre: { slug: genreSlug } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { instructions: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        cefrLevel: true,
        genre: true,
        sourceTextVersion: {
          select: {
            id: true,
            versionNumber: true,
            body: true,
          },
        },
        attempts: {
          where: { userId: auth.user.id },
          select: {
            id: true,
            status: true,
            completedAt: true,
            submittedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTasks = tasks.map((task) => {
      const body = task.sourceTextVersion?.body || "";
      const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
      const latestAttempt = task.attempts[0] || null;

      return {
        id: task.id,
        title: task.title,
        sourceLanguage: task.sourceLanguage,
        targetLanguage: task.targetLanguage,
        cefrLevel: task.cefrLevel.code,
        cefrName: task.cefrLevel.name,
        genre: task.genre?.name || "Khác",
        genreSlug: task.genre?.slug || "general",
        instructions: task.instructions,
        clipboardPolicy: task.clipboardPolicy,
        wordCount,
        latestAttemptStatus: latestAttempt ? latestAttempt.status : null,
        latestAttemptId: latestAttempt ? latestAttempt.id : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { tasks: formattedTasks },
    });
  } catch (error) {
    console.error("Fetch practice tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách bài luyện dịch" } },
      { status: 500 }
    );
  }
}
