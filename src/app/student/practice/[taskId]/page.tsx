"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Save,
  CheckCircle,
  AlertTriangle,
  Send,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

interface TaskDetail {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  cefrLevel: string;
  cefrName: string;
  genre: string;
  instructions: string | null;
  clipboardPolicy: "OFF" | "WARN" | "BLOCK_IN_EDITOR";
  maxReevaluations: number;
  sourceText: string;
  wordCount: number;
  activeAttempt: {
    id: string;
    status: string;
    draftText: string | null;
    latestVersionText: string | null;
    startedAt: string;
  } | null;
}

export default function TranslationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [translationText, setTranslationText] = useState("");
  const [loading, setLoading] = useState(true);

  // Autosave and status
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "OFFLINE">("SAVED");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Modals & Warnings
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTask();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (!data.success) {
        alert(data.error?.message || "Không thể tải bài tập");
        router.push("/student/practice");
        return;
      }

      const taskData: TaskDetail = data.data.task;
      setTask(taskData);

      // Check if attempt exists or initialize one
      if (taskData.activeAttempt) {
        setAttemptId(taskData.activeAttempt.id);
        setTranslationText(taskData.activeAttempt.draftText || "");
      } else {
        // Create fresh attempt
        const initRes = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: taskData.id }),
        });
        const initData = await initRes.json();
        if (initData.success) {
          setAttemptId(initData.data.attempt.id);
        }
      }

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Task load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Autosave trigger on content change (debounced 2 seconds)
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTranslationText(newText);
    setSaveStatus("SAVING");

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      saveDraft(newText);
    }, 2000);
  };

  const saveDraft = async (textToSave: string) => {
    if (!attemptId) return;
    try {
      const res = await fetch(`/api/attempts/${attemptId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftText: textToSave,
          durationSeconds: elapsedSeconds,
        }),
      });

      if (res.ok) {
        setSaveStatus("SAVED");
        setLastSavedAt(new Date());
      } else {
        setSaveStatus("OFFLINE");
      }
    } catch {
      setSaveStatus("OFFLINE");
    }
  };

  // Clipboard policy handling (F06 Training Mode)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!task) return;

    if (task.clipboardPolicy === "BLOCK_IN_EDITOR") {
      e.preventDefault();
      setPasteWarning(
        "Chính sách Training Mode: Giảng viên đã khóa tính năng dán nội dung để rèn luyện kỹ năng tự dịch độc lập."
      );
      setTimeout(() => setPasteWarning(null), 5000);
    } else if (task.clipboardPolicy === "WARN") {
      setPasteWarning("Lưu ý: Bạn vừa dán nội dung từ clipboard. Hãy đảm bảo đây là bản dịch của chính bạn.");
      setTimeout(() => setPasteWarning(null), 4000);
    }
  };

  // Submit translation
  const handleConfirmSubmit = async () => {
    if (!attemptId || !translationText.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translationText,
          durationSeconds: elapsedSeconds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data?.error?.message || "Lỗi khi nộp bài");
        setSubmitting(false);
        return;
      }

      // Seamless redirect to AI feedback page
      router.push(`/student/attempts/${attemptId}/feedback`);
    } catch {
      setSubmitError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang khởi tạo không gian luyện dịch (Training Workspace)...
      </div>
    );
  }

  const studentWordCount = translationText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = translationText.length;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F7F9FC]">
      {/* Workspace Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-40">
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
                {task.cefrLevel}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {task.sourceLanguage.toUpperCase()} → {task.targetLanguage.toUpperCase()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {task.genre}
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{task.title}</h1>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center space-x-4 text-xs">
          {/* Timer */}
          <div className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono font-bold text-slate-800">{timeFormatted}</span>
          </div>

          {/* Autosave Status */}
          <div className="flex items-center space-x-1 text-slate-500">
            {saveStatus === "SAVED" ? (
              <span className="inline-flex items-center text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Đã tự động lưu
              </span>
            ) : saveStatus === "SAVING" ? (
              <span className="inline-flex items-center text-amber-600 font-medium">
                <Save className="w-3.5 h-3.5 mr-1 animate-pulse" />
                Đang lưu nháp...
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-500 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Mất kết nối
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={studentWordCount === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp bài & Nhận phản hồi AI</span>
          </button>
        </div>
      </div>

      {/* Paste Policy Notification Banner */}
      {pasteWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{pasteWarning}</span>
        </div>
      )}

      {/* Main Split Panels */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Source Text */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>Văn bản nguồn ({task.sourceLanguage.toUpperCase()})</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">{task.wordCount} từ</span>
            </div>

            {/* Source Content */}
            <div className="prose prose-slate max-w-none text-slate-900 leading-relaxed text-base font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {task.sourceText}
            </div>

            {/* Instructions */}
            {task.instructions && (
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                <span className="font-bold flex items-center space-x-1 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hướng dẫn bài tập từ Giảng viên:</span>
                </span>
                <p className="text-blue-800 leading-relaxed">{task.instructions}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Chính sách Training Mode: {task.clipboardPolicy}</span>
            <span>Bản dịch mẫu được bảo mật cho đến khi bạn nộp bài</span>
          </div>
        </div>

        {/* Right Panel: Translation Editor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Bản dịch của bạn ({task.targetLanguage.toUpperCase()})
              </span>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                <span>{studentWordCount} từ</span>
                <span>•</span>
                <span>{charCount} ký tự</span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={translationText}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={`Nhập bản dịch tiếng ${task.targetLanguage === "vi" ? "Việt" : "Anh"} của bạn tại đây...`}
              className="w-full flex-1 min-h-[320px] p-4 text-base font-sans text-slate-900 leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition"
              autoFocus
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>
              {lastSavedAt
                ? `Lưu lần cuối lúc: ${lastSavedAt.toLocaleTimeString("vi-VN")}`
                : "Tự động lưu sau 2 giây gõ phím"}
            </span>
            <span className="text-brand-600 font-medium">Bản gốc sẽ được khóa bất biến khi nộp</span>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Xác nhận nộp bản dịch</h3>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                Bản dịch ban đầu của bạn sẽ được <strong>lưu bất biến</strong> để làm căn cứ đánh giá và nghiên cứu khoa học.
              </p>
              <p>
                Sau khi nộp, AI sẽ phân tích văn bản theo khung phân loại lỗi <strong>MQM</strong> và cung cấp hướng dẫn để bạn tiến hành hậu hiệu đính.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                Số từ đã dịch: <strong>{studentWordCount} từ</strong> • Thời gian thực hiện: <strong>{timeFormatted}</strong>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>AI đang chấm điểm & phân tích MQM...</span>
                ) : (
                  <span>Xác nhận nộp bài</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
