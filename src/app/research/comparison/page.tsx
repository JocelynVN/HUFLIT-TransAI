"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompare, ArrowLeft, TrendingUp, Users, Award, BarChart3 } from "lucide-react";

interface ComparisonData {
  groupsComparison: {
    aiAssisted: { sampleSize: number; meanScore: number | null };
    control: { sampleSize: number; meanScore: number | null };
  };
  postEditingEffectiveness: {
    pairedCount: number;
    meanImprovement: number | null;
    prePostPairs: { original: number; postEdit: number; diff: number }[];
  };
}

export default function ComparativeAnalysisPage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/research/comparison")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.success) setData(resData.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang tổng hợp dữ liệu đối sánh khoa học...
      </div>
    );
  }

  const { groupsComparison, postEditingEffectiveness } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
          <Link href="/research/dashboard" className="hover:underline flex items-center">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Cổng Nghiên cứu
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Phân tích Đối sánh Nghiên cứu (F28 & F29)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Thống kê mô tả đối sánh giữa điều kiện có AI hỗ trợ và nhóm đối chứng, cùng hiệu quả của quá trình hậu hiệu đính.
        </p>
      </div>

      {/* Experimental vs Control Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase border border-purple-200">
              Nhóm Thực nghiệm (AI-Assisted)
            </span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-900 mt-2">
            {groupsComparison.aiAssisted.meanScore !== null
              ? `${groupsComparison.aiAssisted.meanScore}/100`
              : "Chưa đủ dữ liệu"}
          </p>
          <div className="text-xs text-slate-500">
            Cỡ mẫu: <strong>{groupsComparison.aiAssisted.sampleSize} bài nộp</strong>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            Sinh viên thực hành có sự hỗ trợ của phản hồi AI theo khung MQM và gợi ý sửa lỗi tương tác.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
              Nhóm Đối chứng (Control Group)
            </span>
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {groupsComparison.control.meanScore !== null
              ? `${groupsComparison.control.meanScore}/100`
              : "Chưa đủ dữ liệu"}
          </p>
          <div className="text-xs text-slate-500">
            Cỡ mẫu: <strong>{groupsComparison.control.sampleSize} bài nộp</strong>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            Sinh viên thực hành theo phương pháp truyền thống, không nhận phản hồi trực tiếp từ AI.
          </p>
        </div>
      </div>

      {/* Post-editing Improvement Analytics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Hiệu quả của Giai đoạn Hậu hiệu đính (Pre/Post Editing Paired Analysis)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh chất lượng bản dịch gốc (v1.0) và bản dịch sau khi sinh viên chủ động sửa theo góp ý AI
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Mức tăng điểm trung bình:</span>
            <span className="text-2xl font-black text-emerald-600">
              {postEditingEffectiveness.meanImprovement !== null
                ? `+${postEditingEffectiveness.meanImprovement} điểm`
                : "—"}
            </span>
          </div>
        </div>

        {postEditingEffectiveness.prePostPairs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Chưa có cặp bản ghi Pre/Post-editing nào hoàn thành đánh giá lại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Bản ghi cặp (Pair #)</th>
                  <th className="py-2.5 px-4">Điểm Bản dịch gốc (v1)</th>
                  <th className="py-2.5 px-4">Điểm sau Hậu hiệu đính</th>
                  <th className="py-2.5 px-4 text-right">Chênh lệch (Gain Score)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {postEditingEffectiveness.prePostPairs.map((pair, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">Cặp thực nghiệm #{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium">{pair.original} điểm</td>
                    <td className="py-2.5 px-4 font-bold text-purple-700">{pair.postEdit} điểm</td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded ${
                          pair.diff >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {pair.diff >= 0 ? `+${pair.diff}` : pair.diff} điểm
                      </span>
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
