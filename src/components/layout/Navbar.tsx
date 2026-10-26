"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LogOut,
  Shield,
  GraduationCap,
  Microscope,
  Menu,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close portal dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const hasTeacherRole = user?.roles.includes("TEACHER");
  const hasResearcherRole = user?.roles.includes("RESEARCHER");
  const hasAdminRole = user?.roles.includes("ADMIN");
  const managementRoleCount = [hasTeacherRole, hasResearcherRole, hasAdminRole].filter(Boolean).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-3">
          {/* Brand - Always rigid, never squished */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 text-brand-600 font-bold text-xl tracking-tight shrink-0">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col shrink-0">
                <span className="leading-tight text-slate-900 font-extrabold text-base sm:text-lg whitespace-nowrap">
                  HUFLIT <span className="text-brand-600">TransAI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-normal whitespace-nowrap hidden sm:block">
                  Biên dịch Anh–Việt & Việt–Anh
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAuthPage && user && (
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Student Practice Links */}
              <Link
                href="/student/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  pathname.startsWith("/student/dashboard")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/student/practice"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  pathname.startsWith("/student/practice")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Kho bài tập
              </Link>
              <Link
                href="/student/history"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  pathname.startsWith("/student/history")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Lịch sử dịch
              </Link>
              <Link
                href="/student/progress"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  pathname.startsWith("/student/progress")
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Tiến độ học tập
              </Link>

              {/* Single Management Portal */}
              {managementRoleCount === 1 && (
                <>
                  {hasTeacherRole && (
                    <Link
                      href="/teacher/tasks"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition whitespace-nowrap ${
                        pathname.startsWith("/teacher")
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Giảng viên</span>
                    </Link>
                  )}
                  {hasResearcherRole && (
                    <Link
                      href="/research/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition whitespace-nowrap ${
                        pathname.startsWith("/research")
                          ? "bg-purple-50 text-purple-700 font-semibold"
                          : "text-slate-600 hover:text-purple-700 hover:bg-slate-100"
                      }`}
                    >
                      <Microscope className="w-4 h-4 text-purple-600" />
                      <span>Nghiên cứu</span>
                    </Link>
                  )}
                  {hasAdminRole && (
                    <Link
                      href="/admin/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition whitespace-nowrap ${
                        pathname.startsWith("/admin")
                          ? "bg-amber-50 text-amber-700 font-semibold"
                          : "text-slate-600 hover:text-amber-700 hover:bg-slate-100"
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Quản trị</span>
                    </Link>
                  )}
                </>
              )}

              {/* Multiple Management Portals: Switcher Dropdown */}
              {managementRoleCount > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition whitespace-nowrap ${
                      pathname.startsWith("/teacher")
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : pathname.startsWith("/research")
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : pathname.startsWith("/admin")
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {pathname.startsWith("/teacher") ? (
                      <>
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Giảng viên</span>
                      </>
                    ) : pathname.startsWith("/research") ? (
                      <>
                        <Microscope className="w-4 h-4 text-purple-600" />
                        <span>Nghiên cứu</span>
                      </>
                    ) : pathname.startsWith("/admin") ? (
                      <>
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>Quản trị</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>Phân hệ quản lý</span>
                      </>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        Chuyển phân hệ
                      </div>
                      {hasTeacherRole && (
                        <Link
                          href="/teacher/tasks"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 text-sm font-medium transition ${
                            pathname.startsWith("/teacher") ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-tight">Cổng Giảng viên</span>
                            <span className="text-[10px] text-slate-500">Quản lý bài tập & học liệu</span>
                          </div>
                        </Link>
                      )}
                      {hasResearcherRole && (
                        <Link
                          href="/research/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 text-sm font-medium transition ${
                            pathname.startsWith("/research") ? "bg-purple-50 text-purple-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                            <Microscope className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-tight">Cổng Nghiên cứu</span>
                            <span className="text-[10px] text-slate-500">Corpus & Phân tích SUS</span>
                          </div>
                        </Link>
                      )}
                      {hasAdminRole && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 text-sm font-medium transition ${
                            pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs leading-tight">Cổng Quản trị</span>
                            <span className="text-[10px] text-slate-500">Prompts, MQM, Người dùng</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}

          {/* User actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <div className="hidden sm:flex flex-col text-right max-w-[140px] md:max-w-[180px] lg:max-w-[210px]">
                  <span className="text-sm font-semibold text-slate-900 leading-tight truncate" title={user.name}>
                    {user.name}
                  </span>
                  <div className="flex items-center justify-end space-x-1 mt-0.5">
                    {user.roles.includes("ADMIN") ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-800">
                        ADMIN
                      </span>
                    ) : user.roles.includes("TEACHER") ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
                        TEACHER
                      </span>
                    ) : user.roles.includes("RESEARCHER") ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-purple-100 text-purple-800">
                        RESEARCHER
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                        STUDENT
                      </span>
                    )}
                    {user.roles.length > 1 && (
                      <span
                        className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1 py-0.5 rounded cursor-default"
                        title={`Các vai trò: ${user.roles.join(", ")}`}
                      >
                        +{user.roles.length - 1}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : !isAuthPage ? (
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  Đăng ký
                </Link>
              </div>
            ) : null}

            {/* Mobile / Tablet menu toggle button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
                aria-label="Mở menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 bg-white shadow-lg">
          <div className="py-2 border-b border-slate-100 mb-2">
            <p className="text-xs font-semibold text-slate-500">Đang đăng nhập:</p>
            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.roles.map((r) => (
                <span
                  key={r}
                  className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-slate-100 text-slate-700"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1">Thực hành Dịch thuật</p>
          <Link
            href="/student/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard Sinh viên
          </Link>
          <Link
            href="/student/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Kho bài tập
          </Link>
          <Link
            href="/student/history"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Lịch sử bài dịch
          </Link>
          <Link
            href="/student/progress"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tiến độ học tập
          </Link>

          {(hasTeacherRole || hasResearcherRole || hasAdminRole) && (
            <>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3">Phân hệ Quản lý</p>
              {hasTeacherRole && (
                <Link
                  href="/teacher/tasks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Cổng Giảng viên</span>
                </Link>
              )}
              {hasResearcherRole && (
                <Link
                  href="/research/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <span>Cổng Nghiên cứu</span>
                </Link>
              )}
              {hasAdminRole && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50"
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Cổng Quản trị viên</span>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
