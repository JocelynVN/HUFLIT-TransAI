"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Search, Plus, ArrowLeft, CheckCircle, Database } from "lucide-react";

interface TMEntry {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  domain: string | null;
  provenance: string | null;
  status: string;
  createdAt: string;
}

export default function AdminTMPage() {
  const [entries, setEntries] = useState<TMEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [domain, setDomain] = useState("Translation Studies");
  const [provenance, setProvenance] = useState("HUFLIT Approved Faculty Glossary");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTM();
  }, []);

  const fetchTM = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("query", search.trim());

    try {
      const res = await fetch(`/api/admin/translation-memory?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data.entries);
      }
    } catch (err) {
      console.error("Fetch TM error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/translation-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText,
          targetText,
          sourceLanguage,
          targetLanguage,
          domain,
          provenance,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setSourceText("");
        setTargetText("");
        await fetchTM();
      }
    } catch (err) {
      console.error("Add TM failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:underline flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Bảng điều khiển Quản trị
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Translation Memory đã thẩm định (F25)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ngữ liệu song ngữ chuẩn hóa đã được giảng viên phê duyệt. Không tự động chèn trước nộp trong Training Mode.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm cặp câu TM mới</span>
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={(e) => { e.preventDefault(); fetchTM(); }} className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo thuật ngữ nguồn hoặc đích..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
        />
      </form>

      {/* TM Entries Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải bộ nhớ dịch...</div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Không tìm thấy mục TM phù hợp</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ngữ đoạn Nguồn</th>
                  <th className="py-3 px-4">Bản dịch Thẩm định (Đích)</th>
                  <th className="py-3 px-4">Lĩnh vực & Nguồn gốc</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {entry.sourceLanguage}
                      </span>
                      {entry.sourceText}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-700 max-w-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {entry.targetLanguage}
                      </span>
                      {entry.targetText}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">{entry.domain || "Chung"}</span>
                      <span className="text-[11px] text-slate-400">{entry.provenance}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm cặp câu Translation Memory</h3>
            <form onSubmit={handleAddEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Văn bản / Thuật ngữ nguồn (Source)</label>
                <input
                  type="text"
                  required
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="post-editing"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bản dịch thẩm định (Target)</label>
                <input
                  type="text"
                  required
                  value={targetText}
                  onChange={(e) => setTargetText(e.target.value)}
                  placeholder="hậu hiệu đính"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên ngành (Domain)</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn thẩm định</label>
                  <input
                    type="text"
                    value={provenance}
                    onChange={(e) => setProvenance(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  {submitting ? "Đang lưu..." : "Lưu vào TM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
