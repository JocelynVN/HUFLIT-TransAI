"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  BookOpen,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Cpu,
  Layers,
  FileCode,
  Activity,
  ArrowRight,
} from "lucide-react";

interface AdminData {
  metrics: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalTasks: number;
    totalAttempts: number;
    totalFeedbackRuns: number;
    totalTokensUsed: number;
    totalCostEstimated: number;
    aiBudgetUsd: number;
    systemHealth: string;
    databaseStatus: string;
    aiProvider: string;
  };
  recentAuditLogs: {
    id: string;
    action: string;
    resourceType: string;
    createdAt: string;
    ipAddress: string | null;
    actor: { name: string; email: string } | null;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
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
        Đang tải bảng điều khiển quản trị viên...
      </div>
    );
  }

  const { metrics, recentAuditLogs } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản trị Hệ thống HUFLIT TransAI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát tài nguyên AI, trạng thái hệ thống, phân quyền người dùng và nhật ký audit an toàn.
          </p>
        </div>

        {/* System Health Status Badge */}
        <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-700">Hệ thống: {metrics.systemHealth}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">DB: {metrics.databaseStatus}</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Người dùng</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{metrics.totalUsers}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
            <span>{metrics.totalStudents} Sinh viên</span>
            <span>•</span>
            <span>{metrics.totalTeachers} Giảng viên</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài tập & Lượt nộp</span>
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{metrics.totalTasks}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
            <span>{metrics.totalAttempts} Lượt nộp bài</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đánh giá AI (MQM)</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-700 mt-3">{metrics.totalFeedbackRuns}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
            <span>{metrics.totalTokensUsed.toLocaleString()} tokens đã dùng</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chi phí AI ước tính</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-3">${metrics.totalCostEstimated}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
            <span>Ngân sách: ${metrics.aiBudgetUsd}/ngày ({metrics.aiProvider})</span>
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/admin/prompts"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition group"
        >
          <FileCode className="w-6 h-6 text-brand-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">
            Quản lý System Prompts
          </h3>
          <p className="text-xs text-slate-500 mt-1">Quản lý phiên bản Hidden Prompts cho bộ máy AI.</p>
        </Link>

        <Link
          href="/admin/mqm"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition group"
        >
          <Layers className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">
            Cấu hình Rubric MQM
          </h3>
          <p className="text-xs text-slate-500 mt-1">Quản lý taxonomy lỗi, trọng số điểm và phiên bản chấm.</p>
        </Link>

        <Link
          href="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
        >
          <Users className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">
            Quản lý Người dùng
          </h3>
          <p className="text-xs text-slate-500 mt-1">Danh sách sinh viên, giảng viên và khóa/kích hoạt tài khoản.</p>
        </Link>

        <Link
          href="/admin/translation-memory"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition group"
        >
          <Cpu className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
            Translation Memory
          </h3>
          <p className="text-xs text-slate-500 mt-1">Kho ngữ liệu song ngữ Anh-Việt đã được thẩm định.</p>
        </Link>
      </div>

      {/* Recent Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <span>Nhật ký Audit hệ thống gần đây</span>
          </h3>
          <span className="text-xs text-slate-400">Ghi vết tự động mọi hành động nhạy cảm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4">Người thực hiện</th>
                <th className="py-2.5 px-4">Hành động</th>
                <th className="py-2.5 px-4">Đối tượng</th>
                <th className="py-2.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {log.actor?.name || "Hệ thống"} ({log.actor?.email || "system"})
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{log.resourceType}</td>
                  <td className="py-2.5 px-4 text-slate-400 font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
