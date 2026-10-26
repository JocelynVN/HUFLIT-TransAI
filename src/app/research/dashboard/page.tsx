"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Microscope,
  Database,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface StudyData {
  id: string;
  title: string;
  description: string;
  protocolVersion: string;
  status: string;
  groups: { id: string; code: string; name: string; condition: string }[];
  _count: {
    participants: number;
    tests: number;
    surveys: number;
  };
}

export default function ResearchDashboardPage() {
  const [studies, setStudies] = useState<StudyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/research/studies")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setStudies(data.data.studies);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Microscope className="w-3.5 h-3.5 text-purple-600" />
            <span>Research & Scientific Experimentation Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cổng Nghiên cứu Khoa học HUFLIT TransAI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đánh giá tác động của AI Feedback theo chuẩn MQM đến năng lực dịch thuật của sinh viên.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Dữ liệu nghiên cứu được giảm nhận dạng (Pseudonymized)</span>
        </div>
      </div>

      {/* 4 Research Action Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/research/corpus"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition group"
        >
          <Database className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">
            Translation Corpus (F27)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tập dữ liệu song ngữ đối gióng: Văn bản nguồn, bản dịch sinh viên, annotation lỗi và gợi ý AI.
          </p>
        </Link>

        <Link
          href="/research/comparison"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition group"
        >
          <GitCompare className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
            Phân tích Đối sánh (F28)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            So sánh nhóm Thực nghiệm (AI-Assisted) vs Đối chứng, và hiệu quả Pre-test/Post-test.
          </p>
        </Link>

        <Link
          href="/research/sus"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition group"
        >
          <Award className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">
            Khảo sát SUS (F30)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Thang đo Khả năng Sử dụng Hệ thống (System Usability Scale) chuẩn hóa 10 tiêu chí.
          </p>
        </Link>

        <Link
          href="/research/corpus"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition group"
        >
          <FileSpreadsheet className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
            Xuất dữ liệu CSV (F31)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Xuất Corpus, điểm số và khảo sát với UTF-8 BOM, an toàn chống CSV injection.
          </p>
        </Link>
      </div>

      {/* Active Research Studies List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Đề tài Nghiên cứu Khoa học Đang Thực hiện</h2>
            <p className="text-xs text-slate-500 mt-0.5">Nghị quyết và đề cương nghiên cứu cấp Khoa / Trường</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {studies.length} Đề tài
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Đang tải đề tài nghiên cứu...</div>
        ) : (
          <div className="space-y-6">
            {studies.map((study) => (
              <div key={study.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 mr-2">
                      {study.protocolVersion}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 inline">{study.title}</h3>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                    {study.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{study.description}</p>

                {/* Experimental Groups Setup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {study.groups.map((group) => (
                    <div key={group.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{group.name}</span>
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {group.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Điều kiện: {group.condition}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <div className="flex space-x-4">
                    <span>Đối tượng tham gia: <strong>{study._count.participants} sinh viên</strong></span>
                    <span>Bài kiểm tra Pre/Post: <strong>{study._count.tests} bài</strong></span>
                  </div>
                  <Link
                    href="/research/corpus"
                    className="font-bold text-purple-700 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <span>Xem Corpus nghiên cứu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
