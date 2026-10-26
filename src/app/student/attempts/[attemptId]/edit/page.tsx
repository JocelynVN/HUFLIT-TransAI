"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Save,
  RefreshCw,
  GitCompare,
  Lightbulb,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface VersionItem {
  id: string;
  versionNumber: number;
  kind: "ORIGINAL" | "POST_EDIT";
  text: string;
  wordCount: number;
  createdAt: string;
  feedbackRuns: {
    id: string;
    estimatedScore: number | null;
    overallComment: string | null;
  }[];
}

interface AttemptData {
  id: string;
  status: string;
  task: {
    id: string;
    title: string;
    sourceLanguage: string;
    targetLanguage: string;
    maxReevaluations: number;
    sourceTextVersion: { body: string };
  };
  versions: VersionItem[];
}

export default function PostEditingPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentText, setCurrentText] = useState("");
  const [savingRevision, setSavingRevision] = useState(false);
  const [reevaluating, setReevaluating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();
      if (data.success) {
        const att: AttemptData = data.data.attempt;
        setAttempt(att);

        // Get latest version text
        const latestVersion = att.versions[att.versions.length - 1];
        if (latestVersion) {
          setCurrentText(latestVersion.text);
        }
      }
    } catch (err) {
      console.error("Fetch attempt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRevision = async () => {
    if (!currentText.trim()) return;
    setSavingRevision(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data?.error?.message || "Lỗi lưu bản sửa");
        setSavingRevision(false);
        return;
      }

      setActionMessage("Đã lưu phiên bản hậu hiệu đính mới thành công!");
      await fetchAttempt();
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ");
    } finally {
      setSavingRevision(false);
    }
  };

  const handleReevaluate = async () => {
    setReevaluating(true);
    setErrorMessage(null);

    try {
      // First save current revision if changed
      await fetch(`/api/attempts/${attemptId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });

      // Then trigger re-evaluation
      const res = await fetch(`/api/attempts/${attemptId}/reevaluate`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data?.error?.message || "Lỗi yêu cầu đánh giá lại");
        setReevaluating(false);
        return;
      }

      setActionMessage("AI đã hoàn thành đánh giá lại bản dịch mới!");
      await fetchAttempt();
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ");
    } finally {
      setReevaluating(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await fetch(`/api/attempts/${attemptId}/complete`, { method: "POST" });
      router.push(`/student/history`);
    } catch (err) {
      console.error("Complete lesson error:", err);
    }
  };

  if (loading || !attempt) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang tải giao diện Hậu hiệu đính (Post-editing)...
      </div>
    );
  }

  const originalVersion = attempt.versions.find((v) => v.versionNumber === 1);
  const latestVersion = attempt.versions[attempt.versions.length - 1];
  const initialFeedback = originalVersion?.feedbackRuns[0];
  const latestFeedback = latestVersion?.feedbackRuns[0];

  const totalRuns = attempt.versions.reduce((acc, v) => acc + v.feedbackRuns.length, 0);
  const remainingReevals = Math.max(0, attempt.task.maxReevaluations + 1 - totalRuns);

  // Compute Word diff comparison between original and current revision
  const originalWords = (originalVersion?.text || "").split(/\s+/).filter(Boolean);
  const revisedWords = currentText.split(/\s+/).filter(Boolean);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F7F9FC]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-40">
        <div className="flex items-center space-x-3">
          <Link
            href={`/student/attempts/${attemptId}/feedback`}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Post-editing Mode
              </span>
              <span className="text-[10px] text-slate-500">
                Phiên bản hiện tại: v{latestVersion?.versionNumber} ({latestVersion?.kind})
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 mt-0.5">{attempt.task.title}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
              showDiff
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>{showDiff ? "Ẩn so sánh Diff" : "Xem so sánh Diff"}</span>
          </button>

          <button
            onClick={handleReevaluate}
            disabled={reevaluating || remainingReevals === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reevaluating ? "animate-spin" : ""}`} />
            <span>Đánh giá lại ({remainingReevals} lượt còn)</span>
          </button>

          <button
            onClick={handleCompleteLesson}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Hoàn thành bài tập</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 text-center font-semibold">
          {actionMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-800 text-center font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Score Comparison Pill Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Điểm bản dịch gốc (v1):</span>
              <span className="text-base font-extrabold text-slate-800">
                {initialFeedback?.estimatedScore ?? "—"}/100
              </span>
            </div>
            <div className="text-slate-300">→</div>
            <div>
              <span className="text-purple-700 block text-[10px] uppercase font-bold">Điểm phiên bản hiện tại:</span>
              <span className="text-base font-extrabold text-purple-700">
                {latestFeedback?.estimatedScore ?? "Chưa đánh giá lại"}/100
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Số từ bản gốc: <strong>{originalWords.length}</strong> • Bản sửa: <strong>{revisedWords.length}</strong>
          </div>
        </div>
      </div>

      {/* Diff View if toggled */}
      {showDiff && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl text-xs font-mono leading-relaxed space-y-2">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
              Đối chiếu Diff (Bản gốc v1 vs Bản sửa hiện tại):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-xl">
                <span className="text-red-400 font-bold block mb-1">[-] Bản dịch gốc v1:</span>
                <p className="text-red-200">{originalVersion?.text}</p>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 rounded-xl">
                <span className="text-emerald-400 font-bold block mb-1">[+] Bản dịch sau hậu hiệu đính:</span>
                <p className="text-emerald-200">{currentText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Side-by-Side Editor */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Read-only Original Translation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Bản dịch gốc ban đầu (Read-only)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                v1.0 • Bất biến
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-700 font-sans">
              {originalVersion?.text}
            </div>

            {/* AI Reference reminder */}
            {initialFeedback?.overallComment && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center space-x-1 text-brand-700">
                  <Lightbulb className="w-3.5 h-3.5 text-brand-600" />
                  <span>Lời khuyên từ phản hồi AI:</span>
                </span>
                <p className="text-blue-950 leading-relaxed">{initialFeedback.overallComment}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Giữ nguyên bản gốc để đối chiếu tiến trình học tập
          </div>
        </div>

        {/* Right Column: Editable Revision */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Bản hậu hiệu đính đang chỉnh sửa
              </span>
              <span className="text-xs font-mono text-slate-500">
                {revisedWords.length} từ • {currentText.length} ký tự
              </span>
            </div>

            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Chỉnh sửa bản dịch của bạn sau khi xem phản hồi AI..."
              className="w-full flex-1 min-h-[300px] p-4 text-base font-sans text-slate-900 leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Nhấn Lưu để tạo phiên bản mới</span>
            <button
              onClick={handleSaveRevision}
              disabled={savingRevision}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingRevision ? "Đang lưu..." : "Lưu phiên bản này"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
