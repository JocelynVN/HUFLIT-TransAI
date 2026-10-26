"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter, ArrowRight, Languages, CheckCircle, Clock } from "lucide-react";

interface PracticeTask {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  cefrLevel: string;
  cefrName: string;
  genre: string;
  genreSlug: string;
  instructions: string | null;
  clipboardPolicy: string;
  wordCount: number;
  latestAttemptStatus: string | null;
  latestAttemptId: string | null;
}

export default function PracticeBankPage() {
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [cefr, setCefr] = useState<string>("ALL");
  const [direction, setDirection] = useState<string>("ALL");
  const [genre, setGenre] = useState<string>("ALL");

  useEffect(() => {
    fetchTasks();
  }, [cefr, direction, genre]);

  const fetchTasks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cefr !== "ALL") params.set("cefr", cefr);
    if (direction !== "ALL") params.set("direction", direction);
    if (genre !== "ALL") params.set("genre", genre);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kho bài tập thực hành dịch thuật
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Chọn bài tập phù hợp với cấp độ CEFR (B1, B2, C1) và hướng dịch để bắt đầu rèn luyện kỹ năng.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, từ khóa hoặc hướng dẫn..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-sm">
          {/* CEFR Level buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ CEFR:</span>
            {["ALL", "B1", "B2", "C1"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setCefr(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  cefr === lvl
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl === "ALL" ? "Tất cả" : lvl}
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hướng dịch:</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Tất cả hướng</option>
              <option value="en-vi">Anh → Việt (En - Vi)</option>
              <option value="vi-en">Việt → Anh (Vi - En)</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thể loại:</span>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Tất cả thể loại</option>
              <option value="tourism">Du lịch & Khách sạn</option>
              <option value="academic">Học thuật</option>
              <option value="business">Kinh doanh & Thương mại</option>
              <option value="technical">Kỹ thuật & Công nghệ</option>
              <option value="general">Tổng quát</option>
              <option value="literary">Văn học</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải danh sách bài tập...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Không tìm thấy bài tập phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy thử thay đổi bộ lọc tìm kiếm hoặc từ khóa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                      {task.cefrLevel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {task.genre}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {task.sourceLanguage.toUpperCase()} → {task.targetLanguage.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">{task.title}</h3>

                {task.instructions && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.instructions}</p>
                )}

                <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{task.wordCount} từ nguồn</span>
                  <span>•</span>
                  <span>Chính sách dán: {task.clipboardPolicy}</span>
                </div>
              </div>

              {/* Status and Action CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {task.latestAttemptStatus === "COMPLETED" ? (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Đã hoàn thành
                    </span>
                  ) : task.latestAttemptStatus ? (
                    <span className="inline-flex items-center text-xs font-semibold text-amber-600">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Đang làm ({task.latestAttemptStatus})
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Chưa làm</span>
                  )}
                </div>

                <Link
                  href={
                    task.latestAttemptId && task.latestAttemptStatus !== "DRAFT"
                      ? `/student/attempts/${task.latestAttemptId}/feedback`
                      : `/student/practice/${task.id}`
                  }
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
                >
                  <span>
                    {task.latestAttemptId && task.latestAttemptStatus !== "DRAFT"
                      ? "Xem kết quả"
                      : "Luyện dịch ngay"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
