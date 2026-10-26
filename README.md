# HUFLIT TransAI: AI-Assisted Translation Practice Tool
### Nền tảng thực hành biên dịch Anh–Việt và Việt–Anh tích hợp AI cho sinh viên HUFLIT

> **Phiên bản:** 1.0 (Full Implementation)  
> **Sản phẩm:** Responsive Full-stack Web Application  
> **Phạm vi triển khai:** Trọn vẹn 31 chức năng thuộc Student Portal, Teacher Portal, Admin Portal và Research Portal.

---

## 1. Triết lý Sư phạm Cốt lõi
Hệ thống được phát triển theo nguyên tắc:
> **Sinh viên tự dịch trước → AI phản hồi theo khung MQM → Sinh viên chủ động hậu hiệu đính → Hệ thống đo lường tiến bộ.**

AI không làm bài thay cho sinh viên. AI đóng vai trò như một trợ giảng thông minh (AI Tutor), chỉ ra các lỗi theo chuẩn chất lượng dịch thuật MQM (Multidimensional Quality Metrics), giải thích ngữ cảnh và hướng dẫn sinh viên hoàn thiện bản dịch.

---

## 2. Danh mục 31 Chức năng Đã Triển khai

| Mã F | Tên chức năng | Phân hệ | Trạng thái |
|---|---|---|---|
| **F01** | Register / Login / Logout (Bcrypt, JWT HttpOnly, RBAC) | Student / Chung | Đã hoàn thành |
| **F02** | Student Dashboard (Tổng bài đã nộp, điểm AI, phân bố lỗi) | Student | Đã hoàn thành |
| **F03** | Translation Practice Bank (Bộ lọc đa chiều, tìm kiếm) | Student | Đã hoàn thành |
| **F04** | CEFR Level Selection (B1, B2, C1) | Student | Đã hoàn thành |
| **F05** | Genre Selection (Du lịch, Học thuật, Kinh doanh, Kỹ thuật...) | Student | Đã hoàn thành |
| **F06** | Training Mode (Bộ đếm thời gian, kiểm soát clipboard) | Student | Đã hoàn thành |
| **F07** | Translation Editor (Autosave, đếm từ/ký tự, Unicode an toàn) | Student | Đã hoàn thành |
| **F08** | Submit Translation (Bản dịch gốc v1 bất biến, chống ghi đè) | Student | Đã hoàn thành |
| **F09** | AI Feedback (Structured JSON schema, điểm ước tính MQM) | Student / AI | Đã hoàn thành |
| **F10** | MQM Error Highlighting (Neo vị trí Unicode, mã màu trực quan) | Student / AI | Đã hoàn thành |
| **F11** | Error Explanation (Giải thích lý do, đối chiếu văn bản nguồn) | Student / AI | Đã hoàn thành |
| **F12** | Suggested Corrections (Gợi ý sửa đổi có thể chấp nhận) | Student / AI | Đã hoàn thành |
| **F13** | Translation Comparison (Đối chiếu Nguồn, Sinh viên, AI) | Student / AI | Đã hoàn thành |
| **F14** | Post-editing Mode (Lưu version mới, Diff Viewer, Re-eval) | Student | Đã hoàn thành |
| **F15** | Translation History (Xem lại lịch sử, điểm số và các phiên bản) | Student | Đã hoàn thành |
| **F16** | Progress Tracking (Đo lường tiến bộ, phân tích lỗi MQM) | Student | Đã hoàn thành |
| **F17** | Admin Dashboard (Thống kê người dùng, tokens AI, chi phí) | Admin | Đã hoàn thành |
| **F18** | Source Text Management (CRUD văn bản nguồn, phiên bản hóa) | Teacher | Đã hoàn thành |
| **F19** | Text Selection Criteria (Bộ 8 tiêu chí đánh giá học liệu) | Teacher / Admin | Đã hoàn thành |
| **F20** | CEFR Level Management (Quản lý và thẩm định cấp độ) | Teacher / Admin | Đã hoàn thành |
| **F21** | Translation Task Management (CRUD bài tập, chính sách dán) | Teacher | Đã hoàn thành |
| **F22** | Prompt Management (Quản lý phiên bản Hidden Prompts, Rollback) | Admin | Đã hoàn thành |
| **F23** | MQM Configuration (Quản lý taxonomy lỗi, trọng số điểm phạt) | Admin | Đã hoàn thành |
| **F24** | Student Management (Danh sách sinh viên, khóa/mở tài khoản) | Teacher / Admin | Đã hoàn thành |
| **F25** | Translation Memory (Kho cặp câu ngữ liệu đã được thẩm định) | Teacher / Admin | Đã hoàn thành |
| **F26** | Pre-test / Post-test (Kiểm tra đầu vào / đầu ra, phân nhóm) | Research | Đã hoàn thành |
| **F27** | Translation Corpus (Tập ngữ liệu đối gióng song ngữ có cấu trúc) | Research | Đã hoàn thành |
| **F28** | Comparative Analysis (Đối sánh Thực nghiệm AI vs Đối chứng) | Research | Đã hoàn thành |
| **F29** | Learning Analytics (Thống kê mô tả, mức độ cải thiện) | Research | Đã hoàn thành |
| **F30** | SUS Questionnaire (Thang đo SUS 10 câu theo John Brooke 1996) | Research / Student | Đã hoàn thành |
| **F31** | Data Export (Xuất CSV có UTF-8 BOM, chống CSV injection) | Research | Đã hoàn thành |

---

## 3. Tài khoản Trải nghiệm Nhanh (Demo Credentials)

Hệ thống cung cấp sẵn các tài khoản mẫu cho 4 vai trò (có thể bấm đăng nhập 1-click ngay tại Trang chủ hoặc Trang Đăng nhập):

| Vai trò | Email đăng nhập | Mật khẩu | Phân quyền truy cập |
|---|---|---|---|
| **STUDENT** | `student@huflit.edu.vn` | `student123` | Dashboard, Kho bài tập, Workspace, AI Feedback, Post-edit, History, Progress, Khảo sát SUS |
| **TEACHER** | `teacher@huflit.edu.vn` | `teacher123` | Toàn quyền Student + Quản lý bài tập, Văn bản nguồn, Thẩm định CEFR, Danh sách sinh viên |
| **RESEARCHER** | `researcher@huflit.edu.vn` | `researcher123` | Toàn quyền Teacher + Cổng nghiên cứu, Đề tài, Corpus, Đối sánh, Phân tích SUS, Xuất CSV |
| **ADMIN** | `admin@huflit.edu.vn` | `admin123` | Toàn quyền hệ thống + Quản trị tài khoản, System Prompts, Cấu hình Rubric MQM, Audit Logs |

---

## 4. Công nghệ Sử dụng (Tech Stack)

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Lucide Icons
- **Backend:** Next.js Server Route Handlers + Service Layer + Database Access Layer
- **Cơ sở dữ liệu:** PostgreSQL 16 (chạy trong Docker container cổng 5433)
- **ORM:** Prisma Client 5.22.0
- **Xác thực:** JWT (Jose) + Bcrypt Password Hashing + HttpOnly SameSite Cookies + RBAC Guards
- **Bộ máy AI:** Pluggable `AIProvider` (Mock Provider chạy offline không tốn phí + Live Provider hỗ trợ Gemini / OpenAI)
- **Thuật toán cốt lõi:**
  - Thuật toán so khớp Unicode Span (`matchSpan`) an toàn với tiếng Việt có dấu
  - Công thức tính điểm MQM: `clamp(100 - 100 * penalty / max(words, 20), 0, 100)`
  - Thuật toán chuẩn hóa thang đo SUS (0 – 100)
  - Bộ khử độc chống CSV Formula Injection (CWE-1236)
- **Kiểm thử tự động:** Vitest (20 bài test pass 100% bao gồm cả Unit tests và Integration tests với DB).

---

## 5. Hướng dẫn Khởi chạy Toàn diện với Docker Compose (Khuyến nghị)

Toàn bộ hệ thống đã được **đóng gói trọn gói (All-In-One)** vào một file `docker-compose.yml` duy nhất gồm 4 dịch vụ:
1. **`postgres`**: Cơ sở dữ liệu PostgreSQL 16 (Healthcheck kiểm tra sẵn sàng).
2. **`redis`**: Bộ đệm và điều phối hàng đợi tác vụ BullMQ Redis 7.
3. **`web`**: Nền tảng Next.js 14 Portal (tự động đợi DB, tự động chạy `prisma db push` và `prisma db:seed`, lắng nghe cổng `3001` hoặc cấu hình qua `WEB_PORT`).
4. **`worker`**: Background Worker độc lập xử lý hàng đợi đánh giá bản dịch AI bất đồng bộ.

### 🚀 Khởi chạy toàn bộ hệ thống chỉ với 1 câu lệnh duy nhất:
```bash
docker compose up -d
```

Sau khi khởi chạy, truy cập ứng dụng ngay tại:
👉 **`http://localhost:3001`** (hoặc `http://localhost:3000` tùy cấu hình `WEB_PORT`).

Kiểm tra trạng thái các container:
```bash
docker compose ps
docker compose logs -f web
```

Dừng toàn bộ hệ thống:
```bash
docker compose down
```

---

## 6. Khởi chạy Thủ công Dành cho Lập trình viên (Local Development)

Nếu bạn muốn phát triển code cục bộ với Hot-reload:

### Bước 1: Khởi động CSDL & Redis qua Docker
```bash
docker compose up -d postgres redis
```

### Bước 2: Cài đặt dependencies và đồng bộ schema
```bash
pnpm install
pnpm prisma db push
pnpm db:seed
```

### Bước 3: Chạy ứng dụng web và worker
```bash
# Terminal 1: Chạy Web App
pnpm dev

# Terminal 2: Chạy Worker (tùy chọn)
pnpm worker
```
Truy cập tại: `http://localhost:3000`

### Bước 4: Chạy kiểm thử tự động
```bash
pnpm test
```

---

## 7. Cấu trúc Tài liệu Dự án

- `docs/architecture.md`: Chi tiết kiến trúc phân tầng, luồng xử lý và sơ đồ hệ thống.
- `docs/api.md`: Toàn bộ đặc tả các endpoint API (Student, Teacher, Admin, Research).
- `docs/database.md`: Từ điển thực thể cơ sở dữ liệu và sơ đồ quan hệ ERD.
- `docs/research.md`: Giao thức nghiên cứu, phương pháp tính điểm SUS và đạo đức dữ liệu.
- `docs/decisions.md`: Báo cáo các quyết định kỹ thuật và danh sách 14 nội dung cần Hội đồng Nghiên cứu HUFLIT phê chuẩn [CẦN DUYỆT].
- `docs/deployment.md`: Hướng dẫn triển khai Docker, biến môi trường và vận hành production.
