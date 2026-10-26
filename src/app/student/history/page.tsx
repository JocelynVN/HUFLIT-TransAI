"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, ArrowRight, Award, CheckCircle, Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  taskId: string;
  taskTitle: string;
  cefrLevel: string;
  direction: string;
  genre: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
  durationSeconds: number;
  versionsCount: number;
  latestScore: number | null;
}

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/me/history");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data.history);
      }
    } catch (err) {
      console.error("Fetch history failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lịch sử bài dịch của bạn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi toàn bộ các bài dịch, phản hồi AI và các phiên bản hậu hiệu đính đã thực hiện.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tên bài tập..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
        />
      </div>

      {/* History Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải lịch sử...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Chưa có bài dịch nào trong lịch sử</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Hãy bắt đầu bài dịch đầu tiên tại kho bài tập.</p>
          <Link
            href="/student/practice"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
          >
            <span>Vào kho bài tập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bài tập</th>
                  <th className="py-3 px-4">Cấp độ & Hướng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Điểm AI</th>
                  <th className="py-3 px-4">Số phiên bản</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{item.taskTitle}</p>
                      <span className="text-[11px] text-slate-400">{item.genre}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold mr-2">
                        {item.cefrLevel}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.direction}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === "COMPLETED" ? (
                        <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Hoàn thành
                        </span>
                      ) : item.status === "FEEDBACK_READY" ? (
                        <span className="inline-flex items-center text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                          Đã có phản hồi
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.latestScore !== null ? (
                        <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                          {item.latestScore} đ
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-600">{item.versionsCount} phiên bản</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleDateString("vi-VN")
                        : new Date(item.startedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/student/attempts/${item.id}/feedback`}
                        className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-bold hover:underline"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
