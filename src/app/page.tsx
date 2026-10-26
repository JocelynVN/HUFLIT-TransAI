"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle, Sparkles, ArrowRight, Shield, Award, BarChart3, Edit3, Lock } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        if (email.startsWith("student")) router.push("/student/dashboard");
        else if (email.startsWith("teacher")) router.push("/teacher/tasks");
        else if (email.startsWith("researcher")) router.push("/research/dashboard");
        else router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center">
        <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-200 text-brand-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Phiên bản Nghiên cứu & Thực hành 1.0</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Nền tảng thực hành biên dịch tích hợp AI <br className="hidden sm:inline" />
          <span className="text-brand-600">chuẩn MQM cho sinh viên HUFLIT</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Môi trường sư phạm thông minh: Sinh viên tự dịch độc lập, nhận phản hồi AI chi tiết theo khung phân loại lỗi MQM, chủ động hậu hiệu đính và đo lường tiến bộ học tập.
        </p>

        {/* Core Pedagogical Philosophy Banner */}
        <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Triết lý sư phạm cốt lõi</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs inline-flex items-center justify-center mb-2">1</span>
              <h4 className="font-bold text-sm text-slate-900">Sinh viên tự dịch</h4>
              <p className="text-xs text-slate-500 mt-1">Môi trường tập trung, bảo đảm tính độc lập trước gợi ý AI.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs inline-flex items-center justify-center mb-2">2</span>
              <h4 className="font-bold text-sm text-slate-900">AI phản hồi MQM</h4>
              <p className="text-xs text-slate-500 mt-1">Chỉ rõ lỗi chính xác, ngữ pháp, thuật ngữ và văn phong.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs inline-flex items-center justify-center mb-2">3</span>
              <h4 className="font-bold text-sm text-slate-900">Hậu hiệu đính</h4>
              <p className="text-xs text-slate-500 mt-1">Sinh viên sửa bản dịch, đối chiếu phiên bản trước/sau.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs inline-flex items-center justify-center mb-2">4</span>
              <h4 className="font-bold text-sm text-slate-900">Đo lường tiến bộ</h4>
              <p className="text-xs text-slate-500 mt-1">Phân tích tần suất lỗi, độ cải thiện phục vụ nghiên cứu.</p>
            </div>
          </div>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mt-12 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Trải nghiệm nhanh theo từng vai trò (1-Click Demo Login)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hệ thống phân quyền chuẩn xác tại Server & DB Access Layer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student */}
            <button
              onClick={() => handleQuickLogin("student@huflit.edu.vn", "student123")}
              className="group p-4 bg-slate-800/80 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500 rounded-xl transition text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  STUDENT
                </span>
                <p className="font-bold text-sm text-white mt-2">Nguyễn Văn Sinh</p>
                <p className="text-xs text-slate-400 mt-0.5">student@huflit.edu.vn</p>
              </div>
              <div className="mt-4 flex items-center text-xs text-brand-400 font-medium group-hover:translate-x-1 transition">
                <span>Vào Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>

            {/* Teacher */}
            <button
              onClick={() => handleQuickLogin("teacher@huflit.edu.vn", "teacher123")}
              className="group p-4 bg-slate-800/80 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 rounded-xl transition text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TEACHER
                </span>
                <p className="font-bold text-sm text-white mt-2">ThS. Trần Thị GV</p>
                <p className="text-xs text-slate-400 mt-0.5">teacher@huflit.edu.vn</p>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition">
                <span>Quản lý học liệu</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>

            {/* Researcher */}
            <button
              onClick={() => handleQuickLogin("researcher@huflit.edu.vn", "researcher123")}
              className="group p-4 bg-slate-800/80 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 rounded-xl transition text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  RESEARCHER
                </span>
                <p className="font-bold text-sm text-white mt-2">TS. Lê Nghiên Cứu</p>
                <p className="text-xs text-slate-400 mt-0.5">researcher@huflit.edu.vn</p>
              </div>
              <div className="mt-4 flex items-center text-xs text-purple-400 font-medium group-hover:translate-x-1 transition">
                <span>Dữ liệu & Corpus</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleQuickLogin("admin@huflit.edu.vn", "admin123")}
              className="group p-4 bg-slate-800/80 hover:bg-amber-600/30 border border-slate-700 hover:border-amber-500 rounded-xl transition text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ADMIN
                </span>
                <p className="font-bold text-sm text-white mt-2">Quản trị Hệ thống</p>
                <p className="text-xs text-slate-400 mt-0.5">admin@huflit.edu.vn</p>
              </div>
              <div className="mt-4 flex items-center text-xs text-amber-400 font-medium group-hover:translate-x-1 transition">
                <span>Cấu hình & Audit</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Tính năng chuyên biệt cho Đào tạo Dịch thuật</h2>
          <p className="text-slate-600 mt-2">Hỗ trợ trọn vẹn 31 chức năng theo chuẩn đặc tả v1.0</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Phân loại lỗi MQM</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Tô màu trực quan các nhóm lỗi Accuracy (Đỏ), Fluency (Cam), Terminology (Tím), và Style (Xanh) kèm nhãn mức độ nghiêm trọng và giải thích ngữ cảnh chi tiết.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mb-4">
              <Edit3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Hậu hiệu đính & So sánh</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Lưu bản dịch gốc bất biến, tạo phiên bản Post-editing có kiểm soát, xem Diff trực quan và đánh giá lại chất lượng sau khi chỉnh sửa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Corpus & Nghiên cứu Khoa học</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Pre-test / Post-test, bộ câu hỏi SUS, phân tích đối sánh thực nghiệm vs đối chứng và xuất dữ liệu nghiên cứu giảm nhận dạng an toàn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
