"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, User as UserIcon, Shield, GraduationCap, Microscope, Menu, X } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-brand-600 font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-slate-900 font-extrabold text-lg">HUFLIT <span className="text-brand-600">TransAI</span></span>
                <span className="text-[10px] text-slate-500 font-medium tracking-normal -mt-0.5">Biên dịch Anh–Việt & Việt–Anh</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAuthPage && user && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* Student Links */}
              <Link
                href="/student/dashboard"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname.startsWith("/student/dashboard")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/student/practice"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname.startsWith("/student/practice")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Kho bài tập
              </Link>
              <Link
                href="/student/history"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname.startsWith("/student/history")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Lịch sử dịch
              </Link>
              <Link
                href="/student/progress"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname.startsWith("/student/progress")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Tiến độ học tập
              </Link>

              {/* Teacher Portal Link */}
              {user.roles.includes("TEACHER") && (
                <Link
                  href="/teacher/tasks"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                    pathname.startsWith("/teacher")
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Giảng viên</span>
                </Link>
              )}

              {/* Research Portal Link */}
              {(user.roles.includes("RESEARCHER") || user.roles.includes("ADMIN")) && (
                <Link
                  href="/research/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                    pathname.startsWith("/research")
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : "text-slate-600 hover:text-purple-700 hover:bg-slate-100"
                  }`}
                >
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <span>Nghiên cứu</span>
                </Link>
              )}

              {/* Admin Portal Link */}
              {user.roles.includes("ADMIN") && (
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-50 text-amber-700 font-semibold"
                      : "text-slate-600 hover:text-amber-700 hover:bg-slate-100"
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Quản trị</span>
                </Link>
              )}
            </nav>
          )}

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</span>
                  <div className="flex items-center justify-end space-x-1 mt-0.5">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          role === "ADMIN"
                            ? "bg-amber-100 text-amber-800"
                            : role === "TEACHER"
                            ? "bg-emerald-100 text-emerald-800"
                            : role === "RESEARCHER"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  Đăng ký
                </Link>
              </div>
            ) : null}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 bg-white">
          <Link
            href="/student/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard Sinh viên
          </Link>
          <Link
            href="/student/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Kho bài tập
          </Link>
          <Link
            href="/student/history"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Lịch sử bài dịch
          </Link>
          <Link
            href="/student/progress"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Tiến độ học tập
          </Link>

          {user.roles.includes("TEACHER") && (
            <Link
              href="/teacher/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Cổng Giảng viên
            </Link>
          )}

          {user.roles.includes("RESEARCHER") && (
            <Link
              href="/research/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
            >
              Cổng Nghiên cứu
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 hover:bg-amber-50"
            >
              Cổng Quản trị viên
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
