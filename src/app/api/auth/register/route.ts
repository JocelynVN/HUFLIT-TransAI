import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { Role } from "@prisma/client";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ").toLowerCase().trim(),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().min(2, "Họ và tên tối thiểu 2 ký tự").trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message || "Dữ liệu không hợp lệ",
          },
        },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email này đã được đăng ký trong hệ thống.",
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user with STUDENT role only (blueprint rule: public register only allows STUDENT)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roles: {
          create: [{ role: Role.STUDENT }],
        },
      },
      include: {
        roles: true,
      },
    });

    const userRoles = user.roles.map((r) => r.role);
    const sessionToken = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoles,
    });

    await logAudit({
      actorId: user.id,
      action: "USER_REGISTER",
      resourceType: "User",
      resourceId: user.id,
      metadata: { email, roles: userRoles },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: userRoles,
        },
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Đã xảy ra lỗi trong quá trình xử lý đăng ký.",
        },
      },
      { status: 500 }
    );
  }
}
