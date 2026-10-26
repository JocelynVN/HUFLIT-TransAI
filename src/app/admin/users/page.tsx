"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, ArrowLeft, CheckCircle, Ban, Shield } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  roles: string[];
  createdAt: string;
  _count: { attempts: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
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
            Quản lý Người dùng & Sinh viên (F24)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm tra tiến độ, phân vai trò và quản lý trạng thái tài khoản sinh viên và giảng viên.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
          />
        </form>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-400 uppercase">Lọc theo vai trò:</span>
          {["ALL", "STUDENT", "TEACHER", "RESEARCHER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                roleFilter === r
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Đang tải danh sách người dùng...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Vai trò (Roles)</th>
                  <th className="py-3 px-4">Bài dịch đã làm</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{user.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{user.email}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{user._count.attempts} bài</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          <Ban className="w-3 h-3 mr-1" />
                          Đang khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                          user.status === "ACTIVE"
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                      </button>
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
