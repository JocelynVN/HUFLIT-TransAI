import { NextResponse } from "next/server";
import { getCurrentUser, COOKIE_NAME } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAudit({
        actorId: user.id,
        action: "USER_LOGOUT",
        resourceType: "User",
        resourceId: user.id,
      });
    }

    const response = NextResponse.json({
      success: true,
      data: { message: "Đăng xuất thành công" },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi đăng xuất" } },
      { status: 500 }
    );
  }
}
