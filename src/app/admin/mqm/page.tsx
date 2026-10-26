"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, ArrowLeft, CheckCircle, ShieldAlert, Award } from "lucide-react";

interface RubricVersionItem {
  id: string;
  name: string;
  version: string;
  taxonomy: any;
  scoringConfig: any;
  status: string;
  activatedAt: string | null;
  createdAt: string;
  _count: { feedbackRuns: number };
}

export default function AdminMQMRubricsPage() {
  const [rubrics, setRubrics] = useState<RubricVersionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const res = await fetch("/api/admin/mqm-rubrics");
      const data = await res.json();
      if (data.success) {
        setRubrics(data.data.rubrics);
      }
    } catch (err) {
      console.error("Fetch rubrics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await fetch(`/api/admin/mqm-rubrics/${id}/activate`, { method: "POST" });
      await fetchRubrics();
    } catch (err) {
      console.error("Activate rubric error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
          <Link href="/admin/dashboard" className="hover:underline flex items-center">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Bảng điều khiển Quản trị
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cấu hình Rubric Đánh giá MQM (F23)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý Taxonomy lỗi (Accuracy, Fluency, Terminology, Style), trọng số phạt và quy tắc tính điểm chất lượng.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải cấu hình rubric...</div>
      ) : (
        <div className="space-y-6">
          {rubrics.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 ${
                r.status === "ACTIVE" ? "border-purple-500 ring-2 ring-purple-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono">
                    {r.version}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{r.name}</h3>
                  {r.status === "ACTIVE" && (
                    <span className="inline-flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Rubric đang kích hoạt
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">Đã dùng cho {r._count.feedbackRuns} bản chấm</span>
                  {r.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleActivate(r.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl"
                    >
                      Kích hoạt rubric này
                    </button>
                  )}
                </div>
              </div>

              {/* Taxonomy and Scoring Config preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Taxonomy phân loại lỗi:
                  </span>
                  <pre className="font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                    {JSON.stringify(r.taxonomy, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Cấu hình trọng số và công thức chấm điểm:
                  </span>
                  <pre className="font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                    {JSON.stringify(r.scoringConfig, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
