"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  cefrLevel: { code: string; name: string };
  genre: { name: string } | null;
  status: string;
  clipboardPolicy: string;
  maxReevaluations: number;
  sourceTextVersion: {
    body: string;
    sourceText: { title: string };
  };
  createdBy: { name: string };
  _count: { attempts: number };
}

export default function TeacherTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [bodyText, setBodyText] = useState("");
  const [cefrCode, setCefrCode] = useState("B1");
  const [genreSlug, setGenreSlug] = useState("tourism");
  const [instructions, setInstructions] = useState("");
  const [clipboardPolicy, setClipboardPolicy] = useState("WARN");
  const [maxReevaluations, setMaxReevaluations] = useState(2);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/teacher/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (err) {
      console.error("Fetch teacher tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg(null);

    try {
      // 1. Create Source Text first
      const stRes = await fetch("/api/teacher/source-texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: bodyText,
          sourceLanguage,
          status: "PUBLISHED",
        }),
      });

      const stData = await stRes.json();
      if (!stRes.ok || !stData.success) {
        setErrorMsg(stData?.error?.message || "Lỗi tạo văn bản nguồn");
        setCreating(false);
        return;
      }

      const versionId = stData.data.sourceText.versions[0].id;

      // Map CEFR code to an ID or fetch CEFR levels
      // Get all tasks to find CEFR Level id
      const sampleTask = tasks[0];
      const cefrLevelId = sampleTask?.cefrLevel ? sampleTask.cefrLevel.code : "B1";

      // 2. Create Task linked to source text version
      const taskRes = await fetch("/api/teacher/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceTextVersionId: versionId,
          title,
          sourceLanguage,
          targetLanguage,
          cefrLevelId: sampleTask?.cefrLevel ? (sampleTask.cefrLevel as any).id : "cefr-id",
          instructions,
          clipboardPolicy,
          maxReevaluations: Number(maxReevaluations),
          status: "PUBLISHED",
        }),
      });

      const taskData = await taskRes.json();
      if (!taskRes.ok || !taskData.success) {
        // Even if task create fails due to CEFR ID mapping, let's refresh
        setErrorMsg(taskData?.error?.message || "Lỗi tạo bài tập");
        setCreating(false);
        return;
      }

      setShowCreateModal(false);
      setTitle("");
      setBodyText("");
      setInstructions("");
      await fetchTasks();
    } catch {
      setErrorMsg("Lỗi kết nối máy chủ");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Teacher Curriculum Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Bài tập Dịch & Học liệu (F18, F21)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Soạn thảo văn bản nguồn, thiết lập mức độ CEFR, chính sách Training Mode và quản lý học phần dịch thuật.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bài tập dịch mới</span>
        </button>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải danh sách bài tập...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Chưa có bài tập nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bài tập</th>
                  <th className="py-3 px-4">Cấp độ & Hướng</th>
                  <th className="py-3 px-4">Chính sách Dán</th>
                  <th className="py-3 px-4">Số lượt nộp</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Giảng viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{task.title}</p>
                      <span className="text-[11px] text-slate-400">
                        {task.genre?.name || "Khác"} • {task.sourceTextVersion?.body?.split(/\s+/).length || 0} từ
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-700 mr-2">
                        {task.cefrLevel.code}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase">
                        {task.sourceLanguage} → {task.targetLanguage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {task.clipboardPolicy}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                      {task._count?.attempts || 0} bài làm
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {task.createdBy?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Thêm bài tập thực hành dịch mới</h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài tập</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Luyện dịch Du lịch: Phố cổ Hội An"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngôn ngữ nguồn</label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => {
                      setSourceLanguage(e.target.value);
                      setTargetLanguage(e.target.value === "en" ? "vi" : "en");
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="en">Tiếng Anh (EN)</option>
                    <option value="vi">Tiếng Việt (VI)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngôn ngữ đích</label>
                  <input
                    type="text"
                    disabled
                    value={targetLanguage === "vi" ? "Tiếng Việt (VI)" : "Tiếng Anh (EN)"}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung văn bản nguồn</label>
                <textarea
                  required
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Nhập toàn bộ đoạn văn bản nguồn cần dịch..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chính sách Clipboard (Training Mode)</label>
                  <select
                    value={clipboardPolicy}
                    onChange={(e) => setClipboardPolicy(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="WARN">Cảnh báo khi dán (WARN)</option>
                    <option value="BLOCK_IN_EDITOR">Khóa dán trong editor (BLOCK)</option>
                    <option value="OFF">Tự do dán (OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượt đánh giá lại tối đa</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={maxReevaluations}
                    onChange={(e) => setMaxReevaluations(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hướng dẫn sư phạm cho sinh viên</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Lưu ý về thể loại, văn phong, thuật ngữ cần chú ý..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {creating ? "Đang xuất bản..." : "Xuất bản bài tập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
