"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCode,
  Plus,
  CheckCircle,
  Clock,
  ArrowLeft,
  Shield,
  RotateCcw,
} from "lucide-react";

interface PromptVersionItem {
  id: string;
  name: string;
  version: string;
  systemInstruction: string;
  developerContext: string | null;
  status: string;
  createdAt: string;
  activatedAt: string | null;
  _count: { feedbackRuns: number };
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [developerContext, setDeveloperContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/admin/prompts");
      const data = await res.json();
      if (data.success) {
        setPrompts(data.data.prompts);
      }
    } catch (err) {
      console.error("Fetch prompts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/prompts/${id}/activate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchPrompts();
      }
    } catch (err) {
      console.error("Activate failed:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          version,
          systemInstruction,
          developerContext,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data?.error?.message || "Lỗi tạo phiên bản prompt");
        setSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      setName("");
      setVersion("");
      setSystemInstruction("");
      setDeveloperContext("");
      await fetchPrompts();
    } catch {
      setErrorMsg("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:underline flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Bảng điều khiển Quản trị
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Hidden System Prompts (F22)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm soát các phiên bản Prompt sư phạm cho AI. Bảo mật tuyệt đối: không tiết lộ cho sinh viên.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bản nháp Prompt mới</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải danh sách prompts...</div>
      ) : (
        <div className="space-y-4">
          {prompts.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition ${
                p.status === "ACTIVE" ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono">
                    {p.version}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                  {p.status === "ACTIVE" && (
                    <span className="inline-flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Đang kích hoạt
                    </span>
                  )}
                  {p.status === "ARCHIVED" && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Đã lưu trữ
                    </span>
                  )}
                  {p.status === "DRAFT" && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Bản nháp
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">
                    Đã áp dụng cho {p._count.feedbackRuns} bài đánh giá
                  </span>
                  {p.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleActivate(p.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Kích hoạt phiên bản này</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider block">
                  Nội dung System Instruction:
                </span>
                <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap overflow-x-auto">
                  {p.systemInstruction}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Prompt Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Tạo phiên bản Prompt mới</h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Prompt</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: MQM Evaluator v2.0"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã phiên bản (Version)</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v1.1"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">System Instruction (Chỉ thị cho AI)</label>
                <textarea
                  required
                  rows={8}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder="You are an educational translation assessment assistant..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bối cảnh phát triển (Developer Context)</label>
                <input
                  type="text"
                  value={developerContext}
                  onChange={(e) => setDeveloperContext(e.target.value)}
                  placeholder="HUFLIT Translation Studies Department"
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
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu bản nháp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
