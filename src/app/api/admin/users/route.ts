import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireRole([Role.ADMIN, Role.TEACHER]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role") as Role | null;
    const search = searchParams.get("search");

    const users = await prisma.user.findMany({
      where: {
        ...(roleFilter ? { roles: { some: { role: roleFilter } } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        roles: { select: { role: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => ({
      ...u,
      roles: u.roles.map((r) => r.role),
    }));

    return NextResponse.json({
      success: true,
      data: { users: formatted },
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải danh sách người dùng" } },
      { status: 500 }
    );
  }
}
