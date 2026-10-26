"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Award,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Layers,
  Sparkles,
  RefreshCw,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

interface ErrorAnnotation {
  id: string;
  category: "ACCURACY" | "FLUENCY" | "TERMINOLOGY" | "STYLE";
  subtype: string;
  severity: "MINOR" | "MAJOR" | "CRITICAL" | "NEUTRAL";
  targetQuote: string;
  startOffset: number | null;
  endOffset: number | null;
  anchorStatus: "ANCHORED" | "UNANCHORED";
  sourceEvidence: string | null;
  explanation: string;
  suggestion: string | null;
}

interface FeedbackRun {
  id: string;
  status: string;
  overallComment: string | null;
  strengths: string[] | null;
  learningTips: string[] | null;
  suggestedTranslations: string[] | null;
  estimatedScore: number | null;
  provider: string;
  errorAnnotations: ErrorAnnotation[];
}

interface AttemptData {
  id: string;
  status: string;
  task: {
    id: string;
    title: string;
    sourceLanguage: string;
    targetLanguage: string;
    cefrLevel: { code: string; name: string };
    genre: { name: string } | null;
    sourceTextVersion: { body: string };
    instructions: string | null;
  };
  versions: {
    id: string;
    versionNumber: number;
    kind: string;
    text: string;
    feedbackRuns: FeedbackRun[];
  }[];
}

export default function AIFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ERRORS" | "COMPARISON">("OVERVIEW");
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();
      if (data.success) {
        setAttempt(data.data.attempt);
        // Select first error by default if present
        const originalVersion = data.data.attempt.versions.find((v: any) => v.versionNumber === 1);
        const feedback = originalVersion?.feedbackRuns[0];
        if (feedback?.errorAnnotations?.length > 0) {
          setSelectedErrorId(feedback.errorAnnotations[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch attempt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEvaluation = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/attempts/${attemptId}/reevaluate`, { method: "POST" });
      await fetchAttempt();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang tải phân tích phản hồi AI và bản đồ lỗi MQM...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-900">Không tìm thấy bài dịch</h3>
        <Link href="/student/dashboard" className="mt-4 inline-block text-xs font-bold text-brand-600">
          Về Dashboard
        </Link>
      </div>
    );
  }

  const originalVersion = attempt.versions.find((v) => v.versionNumber === 1);
  const feedback = originalVersion?.feedbackRuns[0];
  const annotations = feedback?.errorAnnotations || [];
  const sourceText = attempt.task.sourceTextVersion.body;
  const studentText = originalVersion?.text || "";

  // Render text with interactive MQM Highlighting
  const renderHighlightedText = () => {
    if (!studentText) return null;

    // Filter anchored annotations with valid start and end offsets
    const validSpans = annotations
      .filter((a) => a.anchorStatus === "ANCHORED" && a.startOffset !== null && a.endOffset !== null)
      .sort((a, b) => (a.startOffset || 0) - (b.startOffset || 0));

    if (validSpans.length === 0) {
      return <p className="leading-relaxed font-sans">{studentText}</p>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    validSpans.forEach((span, i) => {
      const start = span.startOffset!;
      const end = span.endOffset!;

      // Text before highlight
      if (start > lastIndex) {
        elements.push(studentText.substring(lastIndex, start));
      }

      const highlightedChunk = studentText.substring(start, end);
      const isSelected = span.id === selectedErrorId;

      const styleClass =
        span.category === "ACCURACY"
          ? "mqm-highlight-accuracy"
          : span.category === "FLUENCY"
          ? "mqm-highlight-fluency"
          : span.category === "TERMINOLOGY"
          ? "mqm-highlight-terminology"
          : "mqm-highlight-style";

      elements.push(
        <mark
          key={`span-${span.id}-${i}`}
          onClick={() => {
            setSelectedErrorId(span.id);
            setActiveTab("ERRORS");
          }}
          className={`mqm-highlight ${styleClass} ${
            isSelected ? "ring-2 ring-slate-900 shadow-sm" : ""
          }`}
          title={`[${span.category}] ${span.explanation}`}
        >
          {highlightedChunk}
          <span className="text-[9px] font-bold uppercase ml-1 px-1 py-0.2 rounded bg-black/10 select-none">
            {span.category[0]}
          </span>
        </mark>
      );

      lastIndex = Math.max(lastIndex, end);
    });

    if (lastIndex < studentText.length) {
      elements.push(studentText.substring(lastIndex));
    }

    return <p className="leading-relaxed font-sans text-slate-900">{elements}</p>;
  };

  const selectedAnnotation = annotations.find((a) => a.id === selectedErrorId) || annotations[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F7F9FC]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-40">
        <div className="flex items-center space-x-3">
          <Link
            href="/student/practice"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {attempt.task.cefrLevel.code}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {attempt.task.sourceLanguage.toUpperCase()} → {attempt.task.targetLanguage.toUpperCase()}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                MQM Feedback Ready
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 mt-0.5">{attempt.task.title}</h1>
          </div>
        </div>

        {/* Action Button: Post-editing */}
        <div className="flex items-center space-x-3">
          <Link
            href={`/student/attempts/${attemptId}/edit`}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Edit3 className="w-4 h-4" />
            <span>Tiến hành Hậu hiệu đính (Post-edit)</span>
          </Link>
        </div>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Source Text (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>Văn bản nguồn ({attempt.task.sourceLanguage.toUpperCase()})</span>
              </span>
            </div>
            <div className="text-slate-800 text-sm leading-relaxed font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {sourceText}
            </div>

            {/* MQM Legend */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Chú giải mã màu MQM:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-500"></span>
                  <span className="text-slate-700 text-[11px]">Accuracy (Độ chính xác)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-orange-100 border border-orange-500"></span>
                  <span className="text-slate-700 text-[11px]">Fluency (Độ trôi chảy)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-purple-100 border border-purple-500"></span>
                  <span className="text-slate-700 text-[11px]">Terminology (Thuật ngữ)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-blue-100 border border-blue-500"></span>
                  <span className="text-slate-700 text-[11px]">Style (Văn phong)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Học liệu được thẩm định theo 8 tiêu chí chuẩn HUFLIT
          </div>
        </div>

        {/* Center Column: Student Translation with Highlights (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Bản dịch sinh viên (Bản gốc bất biến)
              </span>
              <span className="text-xs font-semibold text-slate-400">v1.0 (Original)</span>
            </div>

            {/* Interactive highlighted text container */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-sm leading-relaxed">
              {renderHighlightedText()}
            </div>

            {/* Unanchored Errors Notice if any */}
            {annotations.some((a) => a.anchorStatus === "UNANCHORED") && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-bold mb-1">Góp ý cấp đoạn / toàn bài:</p>
                <ul className="list-disc pl-4 space-y-1 text-amber-800">
                  {annotations
                    .filter((a) => a.anchorStatus === "UNANCHORED")
                    .map((a) => (
                      <li key={a.id}>
                        [{a.category}] {a.explanation}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bấm vào từ được tô màu để xem chi tiết lỗi</span>
            <span className="text-brand-600 font-bold">{annotations.length} lỗi phát hiện</span>
          </div>
        </div>

        {/* Right Column: AI Feedback Tabs & Error Explanations (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button
                onClick={() => setActiveTab("OVERVIEW")}
                className={`flex-1 pb-2.5 transition text-center ${
                  activeTab === "OVERVIEW"
                    ? "border-b-2 border-brand-600 text-brand-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("ERRORS")}
                className={`flex-1 pb-2.5 transition text-center ${
                  activeTab === "ERRORS"
                    ? "border-b-2 border-brand-600 text-brand-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Chi tiết lỗi ({annotations.length})
              </button>
              <button
                onClick={() => setActiveTab("COMPARISON")}
                className={`flex-1 pb-2.5 transition text-center ${
                  activeTab === "COMPARISON"
                    ? "border-b-2 border-brand-600 text-brand-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Đối chiếu
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {/* Score card */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700">
                      AI Estimated Quality Score
                    </span>
                    <p className="text-2xl font-black text-purple-900 mt-0.5">
                      {feedback?.estimatedScore !== null && feedback?.estimatedScore !== undefined
                        ? `${feedback.estimatedScore}/100`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-purple-600">Dựa trên thang trừ điểm MQM</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-200/50 text-purple-700 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                {/* Overall comment */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">Nhận xét tổng quát:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {feedback?.overallComment || "Đang xử lý nhận xét..."}
                  </p>
                </div>

                {/* Strengths */}
                {feedback?.strengths && feedback.strengths.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Điểm tốt của bản dịch:</span>
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {feedback.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Learning Tips */}
                {feedback?.learningTips && feedback.learningTips.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-700 flex items-center space-x-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Gợi ý học tập & rèn luyện:</span>
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {feedback.learningTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ERRORS LIST & DETAILS */}
            {activeTab === "ERRORS" && (
              <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                {annotations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    Không phát hiện lỗi nghiêm trọng nào trong bản dịch!
                  </div>
                ) : (
                  <>
                    {/* Error Selector Buttons */}
                    <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-100">
                      {annotations.map((a, i) => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedErrorId(a.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                            selectedAnnotation?.id === a.id
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Lỗi #{i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Detailed Card for Selected Error */}
                    {selectedAnnotation && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              selectedAnnotation.category === "ACCURACY"
                                ? "bg-red-100 text-red-800"
                                : selectedAnnotation.category === "FLUENCY"
                                ? "bg-orange-100 text-orange-800"
                                : selectedAnnotation.category === "TERMINOLOGY"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedAnnotation.category} • {selectedAnnotation.subtype}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Mức độ: {selectedAnnotation.severity}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                            Đoạn bị lỗi:
                          </span>
                          <p className="font-semibold text-slate-900 bg-white p-2 rounded-lg border border-slate-200">
                            "{selectedAnnotation.targetQuote}"
                          </p>
                        </div>

                        {selectedAnnotation.sourceEvidence && (
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                              Đối chiếu văn bản nguồn:
                            </span>
                            <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                              "{selectedAnnotation.sourceEvidence}"
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                            Giải thích vì sao là lỗi:
                          </span>
                          <p className="text-slate-700 leading-relaxed">{selectedAnnotation.explanation}</p>
                        </div>

                        {selectedAnnotation.suggestion && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <span className="text-emerald-800 font-bold block mb-0.5">Cách chỉnh sửa gợi ý:</span>
                            <p className="text-emerald-900 font-medium">{selectedAnnotation.suggestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: COMPARISON */}
            {activeTab === "COMPARISON" && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Phương án dịch tham khảo (AI Reference):</span>
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-950 leading-relaxed">
                    {feedback?.suggestedTranslations?.[0] || "Đang tải phương án dịch tham khảo..."}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    * Lưu ý sư phạm: Bản dịch AI mang tính chất gợi ý tham khảo, không mặc định là đáp án duy nhất hoàn hảo.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Bản dịch gốc ban đầu của bạn:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    {studentText}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Động cơ: {feedback?.provider || "MQM Engine"}</span>
            <Link
              href={`/student/attempts/${attemptId}/edit`}
              className="text-brand-600 font-bold hover:underline"
            >
              Vào sửa bài (Post-edit) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
