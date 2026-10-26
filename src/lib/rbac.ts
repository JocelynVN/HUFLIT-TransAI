import { Role } from "@prisma/client";
import { getCurrentUser, SessionUser } from "./auth";
import { NextResponse } from "next/server";

export function hasRole(user: SessionUser | null, role: Role): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: SessionUser | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

export async function requireAuth(): Promise<
  { user: SessionUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Bạn cần đăng nhập để thực hiện chức năng này.",
          },
        },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function requireRole(allowedRoles: Role[]): Promise<
  { user: SessionUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth;

  const user = auth.user;
  if (!hasAnyRole(user, allowedRoles)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Bạn không có quyền truy cập chức năng này.",
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}
