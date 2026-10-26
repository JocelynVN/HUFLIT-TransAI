"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Award, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

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
  recentTranslations: {
    id: string;
    taskId: string;
    title: string;
    cefr: string;
    status: string;
    submittedAt: string | null;
    score: number | null;
  }[];
  hasSufficientData: boolean;
}

export default function StudentDashboard() {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <p className="text-sm">Đang tải dữ liệu học tập...</p>
      </div>
    );
  }

  const summary = data?.summary;
  const recent = data?.recentTranslations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Môi trường Thực hành Dịch thuật HUFLIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng bạn đến với TransAI Dashboard
          </h1>
          <p className="text-sm text-brand-100 mt-1 max-w-xl">
            Nơi bạn rèn luyện năng lực dịch Anh–Việt, tiếp nhận phản hồi chuẩn MQM và hoàn thiện kỹ năng qua hậu hiệu đính.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/student/practice"
            className="inline-flex items-center space-x-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-5 py-3 rounded-xl shadow-md transition text-sm"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Vào Kho bài tập luyện dịch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài đã nộp</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{summary?.submittedCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Tổng số bản dịch đã nộp cho AI</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang thực hiện</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{summary?.inProgressCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Bản nháp hoặc đang hậu hiệu đính</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoàn thành trọn vẹn</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{summary?.completedCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Đã qua hậu hiệu đính hoàn tất</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm AI ước tính</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {summary?.averageScore !== null && summary?.averageScore !== undefined
              ? `${summary.averageScore}/100`
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Điểm chất lượng MQM trung bình</p>
        </div>
      </div>

      {/* Main Grid: Recent Translations & Errors Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Translations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Bài dịch gần đây</h2>
            <Link href="/student/history" className="text-xs font-semibold text-brand-600 hover:underline">
              Xem toàn bộ lịch sử →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Bạn chưa có bài dịch nào</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Bắt đầu bài thực hành đầu tiên để nhận phản hồi từ AI.</p>
              <Link
                href="/student/practice"
                className="inline-flex items-center space-x-1 text-xs font-bold px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
              >
                <span>Khám phá bài tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-2 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.cefr}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Nộp lúc: {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString("vi-VN") : "Đang làm"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {item.score !== null ? (
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {item.score} đ
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa chấm</span>
                    )}
                    <Link
                      href={`/student/attempts/${item.id}/feedback`}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Error Distribution Quick View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Phân bố lỗi MQM</h2>
            <p className="text-xs text-slate-500 mb-6">Thống kê các nhóm lỗi bạn gặp phải trong các lần dịch</p>

            {data?.errorDistribution && data.errorDistribution.some((e) => e.count > 0) ? (
              <div className="space-y-4">
                {data.errorDistribution.map((item) => {
                  const colors: Record<string, { bg: string; text: string; label: string }> = {
                    ACCURACY: { bg: "bg-red-500", text: "text-red-700", label: "Tính chính xác (Accuracy)" },
                    FLUENCY: { bg: "bg-orange-500", text: "text-orange-700", label: "Độ trôi chảy (Fluency)" },
                    TERMINOLOGY: { bg: "bg-purple-500", text: "text-purple-700", label: "Thuật ngữ (Terminology)" },
                    STYLE: { bg: "bg-blue-500", text: "text-blue-700", label: "Văn phong (Style)" },
                  };
                  const conf = colors[item.category] || { bg: "bg-slate-500", text: "text-slate-700", label: item.category };

                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{conf.label}</span>
                        <span className="font-bold text-slate-900">{item.count} lỗi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`${conf.bg} h-2 rounded-full`}
                          style={{ width: `${Math.min(item.count * 15, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                Chưa có dữ liệu thống kê lỗi. Sau khi nộp bài dịch đầu tiên, hệ thống sẽ phân tích tại đây.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/student/progress"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-between"
            >
              <span>Xem phân tích tiến độ chi tiết</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
