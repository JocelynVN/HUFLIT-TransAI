# Kiến trúc Hệ thống HUFLIT TransAI

## 1. Giới thiệu tổng quan
HUFLIT TransAI là nền tảng thực hành biên dịch hai chiều Anh–Việt và Việt–Anh tích hợp AI theo khung đánh giá MQM (Multidimensional Quality Metrics), thiết kế riêng cho sinh viên ngành Biên – Phiên dịch tại HUFLIT.

Hệ thống được cấu trúc theo triết lý sư phạm:
> **Student translates first → AI provides feedback → Student revises (Post-editing) → System measures progress.**

---

## 2. Mô hình Kiến trúc Phân tầng (Layered Architecture)

```
+-----------------------------------------------------------------------+
|                             USER PORTALS                              |
|   Student Portal  |  Teacher Portal  |  Research Portal  |  Admin     |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|                    NEXT.JS 14 APP ROUTER FRONTEND                     |
|  Tailwind CSS • Accessible UI • MQM Highlighting • Diff View • Charts |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|                 AUTHENTICATION & RBAC (Server Layer)                  |
|       JWT (Jose) • Bcrypt (Cost 10) • HttpOnly Cookies • Audit Log    |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|                        APPLICATION API SERVICES                       |
|   /api/tasks   |   /api/attempts   |   /api/research   |  /api/admin  |
+-----------------------------------------------------------------------+
                                   |
       +---------------------------+---------------------------+
       |                                                       |
+-----------------------------+               +---------------------------------+
|      AI EVALUATION ENGINE   |               |     RESEARCH & EXPORT ENGINE    |
| • AI Provider Interface     |               | • Corpus Alignment              |
| • Mock Provider (Offline)   |               | • Comparative Analysis (Pre/Post|
| • Live Provider (Gemini/OAI)|               | • SUS Questionnaire Engine      |
| • MQM Error Span Matcher    |               | • CSV Formula Injection Defense |
| • Penalty Scoring Engine    |               | • Pseudonymization Pipeline     |
+-----------------------------+               +---------------------------------+
       |                                                       |
+-----------------------------------------------------------------------+
|                         DATA ACCESS LAYER                             |
|                  Prisma ORM • PostgreSQL 16 • Redis                  |
+-----------------------------------------------------------------------+
```

---

## 3. Các thành phần cốt lõi

### 3.1. Authentication & Role-Based Access Control (RBAC)
- 4 vai trò rõ ràng: `STUDENT`, `TEACHER`, `RESEARCHER`, `ADMIN`.
- Phân quyền được kiểm tra nghiêm ngặt tại Server Route Handlers và Database Access Layer.
- Sinh viên đăng ký công khai chỉ được cấp vai trò `STUDENT`.
- Mật khẩu lưu dưới dạng Bcrypt hash an toàn.

### 3.2. Không gian luyện dịch (Training Workspace)
- Chế độ Training Mode bảo đảm sinh viên dịch độc lập.
- Chính sách kiểm soát clipboard có thể cấu hình: `OFF`, `WARN`, `BLOCK_IN_EDITOR`.
- Tự động lưu bản nháp (Autosave debounced 2s).
- Lưu bản dịch gốc **bất biến (Immutable Version 1)** khi nộp bài.

### 3.3. Bộ máy Đánh giá MQM (AI Evaluation Engine)
- Sử dụng mô hình trừ điểm chuẩn hóa MQM:
  $$\text{Score} = \text{clamp}\left(100 - \frac{100 \times \sum \text{penalties}}{\max(\text{WordCount}, 20)}, 0, 100\right)$$
- Thuật toán so khớp chuỗi Unicode (`matchSpan`) an toàn với tiếng Việt có dấu, định vị `targetQuote` và `occurrenceIndex` chính xác thành `startOffset` và `endOffset`.
- Nếu không khớp vị trí, tự động chuyển thành nhận xét cấp đoạn (`anchorStatus: UNANCHORED`).
- Trừu tượng hóa qua `AIProvider`: `MockAIProvider` (chạy deterministic, không tốn chi phí, phục vụ dev/test) và `LiveAIProvider` (Gemini / OpenAI).

### 3.4. Hậu hiệu đính (Post-editing) & Đối chiếu
- Sinh viên xem lại bản gốc, xem gợi ý sửa lỗi và bản dịch tham khảo của AI.
- Tạo các phiên bản chỉnh sửa tiếp theo (Kind: `POST_EDIT`, `versionNumber > 1`).
- Trình xem đối chiếu trực quan (Diff Viewer).
- Có thể yêu cầu AI đánh giá lại trong hạn mức `maxReevaluations`.

### 3.5. Cổng Nghiên cứu & Bảo mật Khoa học
- Quản lý đề tài nghiên cứu, phân nhóm Thực nghiệm (AI-Assisted) vs Đối chứng (Control).
- Translation Corpus có cấu trúc đối gióng song ngữ.
- Thang đo SUS (System Usability Scale) chuẩn hóa 10 câu hỏi theo công thức John Brooke (1996).
- Xuất dữ liệu CSV an toàn: Chống CSV Formula Injection (escape `=`, `+`, `-`, `@`), chèn mã UTF-8 BOM hiển thị chuẩn tiếng Việt trên Microsoft Excel, hỗ trợ ẩn danh hóa (`pseudonymCode`).
