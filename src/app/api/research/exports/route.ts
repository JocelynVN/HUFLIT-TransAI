import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { buildCSV } from "@/lib/exportSanitizer";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const auth = await requireRole([Role.RESEARCHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const exportType = body.exportType || "CORPUS"; // CORPUS, ATTEMPTS, SUS, COMPARISON
    const pseudonymize = body.pseudonymize !== false;

    let csvContent = "";
    let filename = `huflit_export_${exportType.toLowerCase()}_${Date.now()}.csv`;

    if (exportType === "CORPUS") {
      const attempts = await prisma.translationAttempt.findMany({
        where: { status: { in: ["SUBMITTED", "FEEDBACK_READY", "POST_EDITING", "COMPLETED"] } },
        include: {
          user: { include: { participants: true } },
          task: { include: { cefrLevel: true, sourceTextVersion: true, genre: true } },
          versions: {
            include: {
              feedbackRuns: {
                include: { errorAnnotations: true },
              },
            },
            orderBy: { versionNumber: "asc" },
          },
        },
      });

      const rows: (string | number | null | undefined)[][] = [
        [
          "Mã Đối tượng (ID)",
          "Bài tập",
          "Cấp độ CEFR",
          "Thể loại",
          "Văn bản nguồn",
          "Bản dịch ban đầu (v1)",
          "Bản dịch sau hậu hiệu đính",
          "Điểm AI ước tính",
          "Số lượng lỗi MQM",
          "Danh mục lỗi chi tiết",
        ],
      ];

      attempts.forEach((att) => {
        const participantId = pseudonymize
          ? att.user.participants[0]?.pseudonymCode || `P-${att.userId.substring(0, 6)}`
          : att.user.name;

        const v1 = att.versions.find((v) => v.versionNumber === 1);
        const postEdit = att.versions.find((v) => v.versionNumber > 1);
        const feedback = v1?.feedbackRuns[0];

        const errorsSummary =
          feedback?.errorAnnotations
            .map((e) => `[${e.category}|${e.severity}] ${e.targetQuote}: ${e.explanation}`)
            .join("; ") || "Không có lỗi";

        rows.push([
          participantId,
          att.task.title,
          att.task.cefrLevel.code,
          att.task.genre?.name || "Khác",
          att.task.sourceTextVersion.body,
          v1?.text || "",
          postEdit?.text || "Chưa sửa",
          feedback?.estimatedScore ?? "Chưa có",
          feedback?.errorAnnotations.length || 0,
          errorsSummary,
        ]);
      });

      csvContent = buildCSV(rows);
    } else if (exportType === "SUS") {
      const survey = await prisma.survey.findFirst({
        where: { type: "SUS" },
        include: {
          responses: {
            include: { participant: true },
          },
        },
      });

      const rows: (string | number | null | undefined)[][] = [
        [
          "Mã Đối tượng",
          "Điểm SUS tổng (0-100)",
          "Câu 1",
          "Câu 2",
          "Câu 3",
          "Câu 4",
          "Câu 5",
          "Câu 6",
          "Câu 7",
          "Câu 8",
          "Câu 9",
          "Câu 10",
          "Thời gian nộp",
        ],
      ];

      if (survey) {
        survey.responses.forEach((r) => {
          const answers = Array.isArray(r.answers) ? (r.answers as number[]) : [];
          rows.push([
            r.participant.pseudonymCode,
            r.calculatedScore,
            answers[0] || "",
            answers[1] || "",
            answers[2] || "",
            answers[3] || "",
            answers[4] || "",
            answers[5] || "",
            answers[6] || "",
            answers[7] || "",
            answers[8] || "",
            answers[9] || "",
            new Date(r.submittedAt).toISOString(),
          ]);
        });
      }

      csvContent = buildCSV(rows);
    } else {
      // General Attempts
      const attempts = await prisma.translationAttempt.findMany({
        include: {
          user: { include: { participants: true } },
          task: { include: { cefrLevel: true } },
          versions: {
            include: { feedbackRuns: true },
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      });

      const rows: (string | number | null | undefined)[][] = [
        ["Mã Đối tượng", "Bài tập", "Cấp độ", "Trạng thái", "Thời gian làm (giây)", "Điểm AI"],
      ];

      attempts.forEach((a) => {
        const participantId = pseudonymize
          ? a.user.participants[0]?.pseudonymCode || `P-${a.userId.substring(0, 6)}`
          : a.user.name;

        const latestScore = a.versions[0]?.feedbackRuns[0]?.estimatedScore ?? null;

        rows.push([
          participantId,
          a.task.title,
          a.task.cefrLevel.code,
          a.status,
          a.durationSeconds,
          latestScore,
        ]);
      });

      csvContent = buildCSV(rows);
    }

    await logAudit({
      actorId: auth.user.id,
      action: "EXPORT_RESEARCH_DATA",
      resourceType: "ResearchExport",
      metadata: { exportType, pseudonymize, rowCount: csvContent.split("\n").length },
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi xuất dữ liệu nghiên cứu" } },
      { status: 500 }
    );
  }
}
