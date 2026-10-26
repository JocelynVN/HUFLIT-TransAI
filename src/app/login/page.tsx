"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogIn, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error?.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      const roles = data.data.user.roles;
      if (roles.includes("STUDENT")) {
        router.push("/student/dashboard");
      } else if (roles.includes("TEACHER")) {
        router.push("/teacher/tasks");
      } else if (roles.includes("RESEARCHER")) {
        router.push("/research/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const setDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng nhập hệ thống</h2>
          <p className="text-sm text-slate-500 mt-1">Nền tảng thực hành biên dịch HUFLIT TransAI</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@huflit.edu.vn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Mật khẩu
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-white bg-brand-600 hover:bg-brand-700 font-medium text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tài khoản mẫu:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemo("student@huflit.edu.vn", "student123")}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
            >
              <span className="font-semibold text-blue-700">Sinh viên</span>
              <p className="text-[10px] text-slate-500 truncate">student@huflit.edu.vn</p>
            </button>
            <button
              type="button"
              onClick={() => setDemo("teacher@huflit.edu.vn", "teacher123")}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
            >
              <span className="font-semibold text-emerald-700">Giảng viên</span>
              <p className="text-[10px] text-slate-500 truncate">teacher@huflit.edu.vn</p>
            </button>
            <button
              type="button"
              onClick={() => setDemo("researcher@huflit.edu.vn", "researcher123")}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
            >
              <span className="font-semibold text-purple-700">Nghiên cứu</span>
              <p className="text-[10px] text-slate-500 truncate">researcher@huflit.edu.vn</p>
            </button>
            <button
              type="button"
              onClick={() => setDemo("admin@huflit.edu.vn", "admin123")}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
            >
              <span className="font-semibold text-amber-700">Quản trị viên</span>
              <p className="text-[10px] text-slate-500 truncate">admin@huflit.edu.vn</p>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Chưa có tài khoản sinh viên?{" "}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
