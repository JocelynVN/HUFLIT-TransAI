import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "../../../../prisma/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Check if database URL is set
    if (!process.env.DATABASE_URL) {
      return new NextResponse(
        renderHtml({
          success: false,
          title: "Thiếu biến môi trường DATABASE_URL",
          message:
            "Vui lòng vào Vercel Dashboard -> Project Settings -> Environment Variables và thêm biến DATABASE_URL trỏ đến cơ sở dữ liệu PostgreSQL (Neon, Supabase, hoặc Vercel Postgres).",
        }),
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
      );
    }

    // Run seed
    await seedDatabase(prisma);

    const userCount = await prisma.user.count();

    return new NextResponse(
      renderHtml({
        success: true,
        title: "Khởi tạo dữ liệu thành công! 🎉",
        message: `Hệ thống HUFLIT TransAI đã khởi tạo thành công ${userCount} người dùng, các cấp độ CEFR (B1, B2, C1), học liệu mẫu và bộ tiêu chí MQM trong cơ sở dữ liệu online.`,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Setup error:", error);

    // If tables do not exist yet
    const isTableMissing =
      error?.message?.includes("does not exist") || error?.code === "P2021";

    return new NextResponse(
      renderHtml({
        success: false,
        title: isTableMissing
          ? "Cơ sở dữ liệu chưa có cấu trúc bảng"
          : "Không thể kết nối cơ sở dữ liệu",
        message: isTableMissing
          ? "Bảng trong cơ sở dữ liệu chưa được tạo. Hãy chạy lệnh 'npx prisma db push' từ máy cục bộ trỏ vào DATABASE_URL online, hoặc kiểm tra cấu hình Vercel build."
          : `Lỗi: ${error?.message || "Lỗi kết nối cơ sở dữ liệu"}`,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}

function renderHtml({
  success,
  title,
  message,
}: {
  success: boolean;
  title: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khởi tạo CSDL | HUFLIT TransAI</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
  <div class="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
    <div class="p-6 sm:p-8 ${success ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}">
      <div class="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
        <span>HUFLIT TransAI Setup</span>
      </div>
      <h1 class="text-2xl font-bold">${title}</h1>
      <p class="text-sm mt-1 opacity-90">${message}</p>
    </div>

    <div class="p-6 sm:p-8 space-y-6">
      ${
        success
          ? `
      <div>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Tài khoản đăng nhập đã sẵn sàng:</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span class="font-bold text-blue-800 uppercase">🎓 Sinh viên</span>
            <p class="mt-1 font-mono text-slate-700">student@huflit.edu.vn</p>
            <p class="font-mono text-slate-500">Mật khẩu: <span class="font-bold text-slate-800">student123</span></p>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span class="font-bold text-emerald-800 uppercase">🧑‍🏫 Giảng viên</span>
            <p class="mt-1 font-mono text-slate-700">teacher@huflit.edu.vn</p>
            <p class="font-mono text-slate-500">Mật khẩu: <span class="font-bold text-slate-800">teacher123</span></p>
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <span class="font-bold text-purple-800 uppercase">🔬 Nghiên cứu viên</span>
            <p class="mt-1 font-mono text-slate-700">researcher@huflit.edu.vn</p>
            <p class="font-mono text-slate-500">Mật khẩu: <span class="font-bold text-slate-800">researcher123</span></p>
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="font-bold text-amber-800 uppercase">🛡️ Quản trị viên</span>
            <p class="mt-1 font-mono text-slate-700">admin@huflit.edu.vn</p>
            <p class="font-mono text-slate-500">Mật khẩu: <span class="font-bold text-slate-800">admin123</span></p>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
        <a href="/" class="text-sm font-medium text-slate-600 hover:text-slate-900">Về Trang chủ</a>
        <a href="/login" class="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition">
          Đến Trang Đăng nhập &rarr;
        </a>
      </div>
      `
          : `
      <div>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Các bước khắc phục:</h2>
        <ol class="list-decimal list-inside space-y-2 text-xs text-slate-600">
          <li>Tạo một cơ sở dữ liệu PostgreSQL miễn phí (trên <a href="https://neon.tech" target="_blank" class="text-blue-600 font-bold underline">Neon.tech</a>, Supabase hoặc Vercel Storage).</li>
          <li>Vào <b>Vercel Dashboard &rarr; Settings &rarr; Environment Variables</b>, thêm:
            <ul class="list-disc list-inside ml-4 mt-1 font-mono text-slate-700">
              <li>DATABASE_URL="postgresql://..."</li>
              <li>AUTH_SECRET="chuoi-bi-mat-ngau-nhien-it-nhat-32-ky-tu"</li>
              <li>NEXTAUTH_URL="https://ten-mien-vercel-cua-ban.vercel.app"</li>
            </ul>
          </li>
          <li>Tải lại trang này (<code class="bg-slate-100 px-1 py-0.5 rounded">/api/setup</code>) để tự động nạp dữ liệu.</li>
        </ol>
      </div>

      <div class="pt-4 border-t border-slate-100 flex justify-end">
        <button onclick="window.location.reload()" class="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium text-sm">
          Thử lại
        </button>
      </div>
      `
      }
    </div>
  </div>
</body>
</html>`;
}
