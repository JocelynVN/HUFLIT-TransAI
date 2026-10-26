"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Award, ArrowLeft, CheckCircle2, HelpCircle, Send } from "lucide-react";

interface QuestionItem {
  id: number;
  text: string;
}

export default function StudentSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/research/sus")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.survey?.questions) {
          const qs: QuestionItem[] = data.data.survey.questions;
          setQuestions(qs);
          // Default all to 3 (neutral)
          const initial: Record<number, number> = {};
          qs.forEach((q) => (initial[q.id] = 3));
          setAnswers(initial);
        }
      })
      .finally(() => setLoading(false));
  }, [surveyId]);

  const handleSelectAnswer = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const answersArray = questions.map((q) => answers[q.id] || 3);

    try {
      const res = await fetch(`/api/research/surveys/${surveyId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersArray }),
      });

      const data = await res.json();
      if (data.success) {
        setResultScore(data.data.calculatedScore);
      }
    } catch (err) {
      console.error("Submit SUS failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Đang tải bảng câu hỏi khảo sát...
      </div>
    );
  }

  if (resultScore !== null) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Cảm ơn bạn đã tham gia khảo sát!</h2>
        <p className="text-sm text-slate-600">
          Ý kiến của bạn đóng góp trực tiếp vào đề tài nghiên cứu cải tiến công cụ dịch thuật tích hợp AI tại HUFLIT.
        </p>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Điểm SUS bạn đánh giá:
          </span>
          <p className="text-4xl font-black text-emerald-700 mt-1">{resultScore}/100</p>
          <p className="text-xs text-slate-500 mt-1">Chuẩn hóa theo công thức John Brooke (1996)</p>
        </div>

        <div className="pt-4">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <span>Về Dashboard Sinh viên</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-1">
          <Link href="/student/dashboard" className="hover:underline flex items-center">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Về Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Khảo sát Trải nghiệm Người dùng (SUS)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Vui lòng cho biết mức độ đồng ý của bạn với 10 nhận định dưới đây (Thang đo từ 1: Hoàn toàn không đồng ý đến 5: Hoàn toàn đồng ý).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <p className="text-sm font-bold text-slate-900">
                <span className="text-brand-600 mr-1.5">Câu {idx + 1}.</span> {q.text}
              </p>

              <div className="grid grid-cols-5 gap-2 pt-2 text-center text-xs">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectAnswer(q.id, val)}
                    className={`py-2 rounded-xl font-bold transition flex flex-col items-center space-y-1 ${
                      answers[q.id] === val
                        ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-300"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span className="text-sm">{val}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {val === 1
                        ? "Rất không đồng ý"
                        : val === 3
                        ? "Bình thường"
                        : val === 5
                        ? "Rất đồng ý"
                        : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Đang gửi phản hồi..." : "Gửi kết quả khảo sát"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
