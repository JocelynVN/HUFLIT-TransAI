"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Database,
  ArrowLeft,
  Download,
  Filter,
  ShieldCheck,
  Search,
  BookOpen,
} from "lucide-react";

interface CorpusItem {
  attemptId: string;
  participantIdentifier: string;
  taskTitle: string;
  sourceLanguage: string;
  targetLanguage: string;
  cefrLevel: string;
  genre: string;
  sourceText: string;
  originalTranslation: string;
  postEditedTranslation: string | null;
  aiScore: number | null;
  promptVersion: string;
  rubricVersion: string;
  errorCount: number;
  errors: {
    category: string;
    subtype: string;
    severity: string;
    targetQuote: string;
    explanation: string;
  }[];
}

export default function ResearchCorpusPage() {
  const [corpus, setCorpus] = useState<CorpusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudonymize, setPseudonymize] = useState(true);
  const [cefrFilter, setCefrFilter] = useState("ALL");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCorpus();
  }, [cefrFilter, pseudonymize]);

  const fetchCorpus = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cefrFilter !== "ALL") params.set("cefr", cefrFilter);
    params.set("pseudonymize", pseudonymize.toString());

    try {
      const res = await fetch(`/api/research/corpus?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCorpus(data.data.corpus);
      }
    } catch (err) {
      console.error("Fetch corpus failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/research/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exportType: "CORPUS", pseudonymize }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `huflit_translation_corpus_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

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
            Translation Corpus Đối gióng Song ngữ (F27)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tập dữ liệu nghiên cứu có cấu trúc, lưu vết toàn bộ phiên bản dịch và annotation lỗi theo rubric chuẩn hóa.
          </p>
        </div>

        {/* Export CTA */}
        <button
          onClick={handleExportCSV}
          disabled={exporting || corpus.length === 0}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? "Đang xuất CSV..." : "Xuất file Corpus (CSV / Excel)"}</span>
        </button>
      </div>

      {/* Filter and Privacy Settings Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-500 uppercase tracking-wider">Lọc cấp độ CEFR:</span>
          {["ALL", "B1", "B2", "C1"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setCefrFilter(lvl)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                cefrFilter === lvl
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Pseudonymization Toggle */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Chế độ Giảm nhận dạng (Pseudonymized):</span>
          <button
            onClick={() => setPseudonymize(!pseudonymize)}
            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] transition ${
              pseudonymize ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}
          >
            {pseudonymize ? "BẬT (Mã hóa P-xxx)" : "TẮT (Hiển thị tên thật)"}
          </button>
        </div>
      </div>

      {/* Corpus Aligned List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải ngữ liệu Corpus...</div>
      ) : corpus.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Chưa có bản ghi Corpus nào</h3>
          <p className="text-xs text-slate-500 mt-1">Các bài dịch đã nộp của sinh viên sẽ tự động tích hợp vào Corpus.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {corpus.map((item, index) => (
            <div
              key={item.attemptId}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-400">#{index + 1}</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {item.participantIdentifier}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{item.taskTitle}</span>
                  <span className="font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.cefrLevel}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Điểm AI: {item.aiScore !== null ? `${item.aiScore} đ` : "—"}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Prompt: {item.promptVersion} • Rubric: {item.rubricVersion}
                  </span>
                </div>
              </div>

              {/* Aligned 3 Columns (Source, Original Translation, Post-Edited Translation) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Source Text */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
                    1. Văn bản nguồn ({item.sourceLanguage.toUpperCase()}):
                  </span>
                  <p className="text-slate-900 leading-relaxed font-serif">{item.sourceText}</p>
                </div>

                {/* Original Translation */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <span className="font-bold text-blue-700 block uppercase tracking-wider text-[10px]">
                    2. Bản dịch sinh viên (v1.0):
                  </span>
                  <p className="text-slate-900 leading-relaxed font-sans">{item.originalTranslation}</p>
                </div>

                {/* Post-edited Translation */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-700 block uppercase tracking-wider text-[10px]">
                    3. Bản dịch sau Hậu hiệu đính:
                  </span>
                  <p className="text-slate-900 leading-relaxed font-sans">
                    {item.postEditedTranslation || (
                      <span className="italic text-slate-400">Chưa thực hiện hậu hiệu đính</span>
                    )}
                  </p>
                </div>
              </div>

              {/* MQM Annotation Tags */}
              {item.errors.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Lỗi MQM được phát hiện ({item.errors.length} lỗi):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.errors.map((err, eIdx) => (
                      <span
                        key={eIdx}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                          err.category === "ACCURACY"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : err.category === "FLUENCY"
                            ? "bg-orange-50 text-orange-800 border-orange-200"
                            : err.category === "TERMINOLOGY"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                        title={err.explanation}
                      >
                        <strong className="font-extrabold">{err.category}:</strong>
                        <span>"{err.targetQuote}" ({err.severity})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
