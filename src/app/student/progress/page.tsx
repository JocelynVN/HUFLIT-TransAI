"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface ProgressData {
  summary: {
    totalAttempts: number;
    submittedCount: number;
    completedCount: number;
    inProgressCount: number;
    averageScore: number | null;
  };
  cefrDistribution: { level: string; count: number }[];
  errorDistribution: { category: string; count: number }[];
  severityDistribution: { severity: string; count: number }[];
  scoreImprovements: { originalScore: number; postEditScore: number; improvement: number }[];
  hasSufficientData: boolean;
}

export default function StudentProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.success) setData(resData.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        Đang tổng hợp dữ liệu tiến trình học tập...
      </div>
    );
  }

  const summary = data?.summary;
  const hasData = data?.hasSufficientData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tiến độ học tập & Phân tích lỗi MQM
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi sự tiến bộ, tần suất lỗi và hiệu quả của quá trình hậu hiệu đính qua thời gian.
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Chưa đủ dữ liệu để tạo báo cáo tiến độ</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống cam kết tính trung thực trong nghiên cứu khoa học: không tạo ra xu hướng giả khi bạn chưa nộp bài. Hãy hoàn thành ít nhất một bài dịch để kích hoạt phân tích!
          </p>
          <Link
            href="/student/practice"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
          >
            <span>Bắt đầu bài dịch ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng bài đã nộp</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{summary?.submittedCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Đã được AI phân tích MQM</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình</span>
              <p className="text-3xl font-black text-purple-700 mt-2">
                {summary?.averageScore !== null ? `${summary?.averageScore}/100` : "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">AI Estimated Quality Score</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài hoàn thành</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">{summary?.completedCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Đã qua hậu hiệu đính</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số lần hậu hiệu đính</span>
              <p className="text-3xl font-black text-blue-600 mt-2">{data?.scoreImprovements.length || 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Lần có đánh giá lại trước/sau</p>
            </div>
          </div>

          {/* Error Category Breakdown & Severity Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MQM Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Phân bố lỗi theo Nhóm MQM</h3>
                <p className="text-xs text-slate-500">Giúp bạn nhận biết điểm yếu cần tập trung cải thiện</p>
              </div>

              <div className="space-y-3 pt-2">
                {data?.errorDistribution.map((item) => {
                  const colors: Record<string, { label: string; bar: string }> = {
                    ACCURACY: { label: "Accuracy (Độ chính xác)", bar: "bg-red-500" },
                    FLUENCY: { label: "Fluency (Độ trôi chảy)", bar: "bg-orange-500" },
                    TERMINOLOGY: { label: "Terminology (Thuật ngữ)", bar: "bg-purple-500" },
                    STYLE: { label: "Style (Văn phong)", bar: "bg-blue-500" },
                  };
                  const meta = colors[item.category] || { label: item.category, bar: "bg-slate-500" };

                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{meta.label}</span>
                        <span className="text-slate-900 font-bold">{item.count} lỗi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`${meta.bar} h-2.5 rounded-full`}
                          style={{ width: `${Math.min(item.count * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Mức độ nghiêm trọng của lỗi</h3>
                <p className="text-xs text-slate-500">Tỷ lệ lỗi Minor (1đ), Major (5đ), Critical (10đ)</p>
              </div>

              <div className="space-y-3 pt-2">
                {data?.severityDistribution.map((item) => {
                  const colors: Record<string, { label: string; bar: string }> = {
                    MINOR: { label: "Lỗi nhẹ (Minor - Trừ 1đ)", bar: "bg-amber-400" },
                    MAJOR: { label: "Lỗi đáng kể (Major - Trừ 5đ)", bar: "bg-orange-500" },
                    CRITICAL: { label: "Lỗi nghiêm trọng (Critical - Trừ 10đ)", bar: "bg-red-600" },
                  };
                  const meta = colors[item.severity] || { label: item.severity, bar: "bg-slate-400" };

                  return (
                    <div key={item.severity} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{meta.label}</span>
                        <span className="text-slate-900 font-bold">{item.count} lỗi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`${meta.bar} h-2.5 rounded-full`}
                          style={{ width: `${Math.min(item.count * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Post-editing Improvement Evidence */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Hiệu quả Hậu hiệu đính (Mức tăng điểm giữa Bản gốc v1 vs Bản sửa)
              </h3>
              <p className="text-xs text-slate-500">
                Bằng chứng định lượng về sự tiến bộ của sinh viên thông qua việc tiếp nhận phản hồi AI
              </p>
            </div>

            {data?.scoreImprovements.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                Chưa có bài nào được yêu cầu đánh giá lại sau hậu hiệu đính. Hãy thử tính năng "Đánh giá lại" tại màn hình Post-editing!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.scoreImprovements.map((imp, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      Bài thực hành #{idx + 1}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Bản gốc: <strong>{imp.originalScore} đ</strong></span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-xs text-emerald-700 font-bold">Sau sửa: <strong>{imp.postEditScore} đ</strong></span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold text-emerald-600">
                      <span>Mức độ cải thiện:</span>
                      <span>+{imp.improvement} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
