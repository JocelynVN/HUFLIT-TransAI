"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ArrowLeft, Download, CheckCircle, HelpCircle, BarChart3 } from "lucide-react";

interface SUSAnalytics {
  survey: {
    id: string;
    title: string;
    questions: { id: number; text: string }[];
  };
  analytics: {
    totalResponses: number;
    meanScore: number | null;
    grade: { grade: string; adjective: string; acceptable: boolean } | null;
  };
  responses: {
    id: string;
    pseudonymCode: string;
    calculatedScore: number;
    answers: number[];
    submittedAt: string;
  }[];
}

export default function ResearchSUSPage() {
  const [data, setData] = useState<SUSAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSUS();
  }, []);

  const fetchSUS = async () => {
    try {
      const res = await fetch("/api/research/sus");
      const resData = await res.json();
      if (resData.success) setData(resData.data);
    } catch (err) {
      console.error("Fetch SUS error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSUS = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/research/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exportType: "SUS" }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `huflit_sus_survey_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export SUS error:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang tải phân tích kết quả thang đo SUS...
      </div>
    );
  }

  const { analytics, responses, survey } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/research/dashboard" className="hover:underline flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Cổng Nghiên cứu
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thang đo Khả năng Sử dụng Hệ thống (SUS) (F30)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tiêu chuẩn đánh giá trải nghiệm người dùng System Usability Scale (John Brooke, 1996) với 10 câu hỏi chuẩn.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/student/surveys/${survey.id}`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Làm thử khảo sát SUS
          </Link>

          <button
            onClick={handleExportSUS}
            disabled={exporting || responses.length === 0}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Đang xuất..." : "Xuất kết quả SUS (CSV)"}</span>
          </button>
        </div>
      </div>

      {/* SUS Overall Score Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Điểm SUS Tổng thể của Nền tảng:
          </span>
          <div className="flex items-baseline space-x-3">
            <span className="text-5xl font-black text-slate-900">
              {analytics.meanScore !== null ? analytics.meanScore : "—"}
            </span>
            <span className="text-slate-400 font-bold text-lg">/ 100</span>
            {analytics.grade && (
              <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Xếp loại {analytics.grade.grade} ({analytics.grade.adjective})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tiêu chuẩn ngành (Industry Benchmark): Mức điểm 68 tương đương trung bình (Average).
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <p>
            Tổng số phiếu khảo sát: <strong>{analytics.totalResponses} sinh viên</strong>
          </p>
          <p className="mt-1">
            Công thức: <strong>odd (x - 1) + even (5 - x) × 2.5</strong>
          </p>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Danh sách Phiếu trả lời của Sinh viên</h3>

        {responses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Chưa có sinh viên nào hoàn thành khảo sát SUS. Bạn có thể nhấn nút "Làm thử khảo sát SUS" để nộp phiếu thử nghiệm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Mã Đối tượng</th>
                  <th className="py-2.5 px-4">Điểm SUS (0 - 100)</th>
                  <th className="py-2.5 px-4">Thời gian nộp</th>
                  <th className="py-2.5 px-4">Chi tiết 10 câu trả lời</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.pseudonymCode}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {r.calculatedScore} điểm
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {new Date(r.submittedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                      [{Array.isArray(r.answers) ? r.answers.join(", ") : ""}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
