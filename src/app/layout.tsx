import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "HUFLIT TransAI | Nền tảng thực hành biên dịch tích hợp AI",
  description:
    "Nền tảng thực hành biên dịch Anh–Việt và Việt–Anh tích hợp AI theo khung đánh giá MQM cho sinh viên HUFLIT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#16243A]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
            <p className="font-medium text-slate-700">
              Trường Đại học Ngoại ngữ – Tin học TP. Hồ Chí Minh (HUFLIT)
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Khoa Ngoại ngữ & Văn hóa • Đề tài Nghiên cứu Ứng dụng AI trong Đào tạo Biên – Phiên dịch © 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
