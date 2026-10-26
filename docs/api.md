# Đặc tả API Hệ thống HUFLIT TransAI

## Quy ước chung
- Định dạng dữ liệu: JSON (UTF-8).
- Header xác thực: Cookie phiên `huflit_auth_token` (HttpOnly, SameSite=Lax).
- Chuẩn response thành công:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- Chuẩn response lỗi:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Thông điệp lỗi chi tiết"
    }
  }
  ```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Mô tả:** Đăng ký tài khoản sinh viên mới (chỉ cấp vai trò `STUDENT`).
- **Body:** `{ email: string, password: string, name: string }`
- **Response:** `{ success: true, data: { user } }` + Set Cookie.

### `POST /api/auth/login`
- **Mô tả:** Đăng nhập hệ thống bằng email và mật khẩu.
- **Body:** `{ email: string, password: string }`
- **Response:** `{ success: true, data: { user } }` + Set Cookie.

### `GET /api/auth/me`
- **Mô tả:** Lấy thông tin người dùng và vai trò hiện tại từ cookie phiên.
- **Response:** `{ success: true, data: { user: { id, email, name, roles } } }`

### `POST /api/auth/logout`
- **Mô tả:** Đăng xuất và xóa cookie phiên đăng nhập.

---

## 2. Student Practice Endpoints

### `GET /api/tasks`
- **Mô tả:** Lấy danh sách bài tập dịch đã xuất bản (Practice Bank).
- **Query params:** `cefr` (B1, B2, C1), `direction` (en-vi, vi-en), `genre`, `search`.
- **Response:** `{ success: true, data: { tasks: [...] } }`

### `GET /api/tasks/:id`
- **Mô tả:** Chi tiết bài tập, văn bản nguồn và bài làm đang dở (nếu có).

### `POST /api/attempts`
- **Mô tả:** Bắt đầu hoặc tiếp tục bài dịch (tạo `TranslationAttempt` ở trạng thái `DRAFT`).
- **Body:** `{ taskId: string }`

### `PATCH /api/attempts/:id/draft`
- **Mô tả:** Tự động lưu bản nháp của sinh viên (Autosave).
- **Body:** `{ draftText: string, durationSeconds?: number }`

### `POST /api/attempts/:id/submit`
- **Mô tả:** Nộp bài dịch. Tạo phiên bản bất biến v1 (`ORIGINAL`), kích hoạt AI Evaluation Job.
- **Body:** `{ text: string, durationSeconds?: number }`

### `GET /api/attempts/:id`
- **Mô tả:** Lấy toàn bộ thông tin bài làm, các phiên bản dịch, feedback AI và error annotations.

### `POST /api/attempts/:id/revisions`
- **Mô tả:** Lưu phiên bản hậu hiệu đính mới (`kind: POST_EDIT`, `versionNumber: n+1`).
- **Body:** `{ text: string }`

### `POST /api/attempts/:id/reevaluate`
- **Mô tả:** Yêu cầu AI đánh giá lại bản dịch mới sau khi sửa (chịu giới hạn `maxReevaluations`).

### `POST /api/attempts/:id/complete`
- **Mô tả:** Đánh dấu hoàn thành toàn bộ bài tập.

### `GET /api/me/history`
- **Mô tả:** Lịch sử toàn bộ các bài dịch cá nhân của sinh viên.

### `GET /api/me/progress`
- **Mô tả:** Thống kê tiến độ thực tế, điểm trung bình và phân bố lỗi MQM.

---

## 3. Teacher & Admin Endpoints

### `GET /api/teacher/tasks` & `POST /api/teacher/tasks`
- **Quyền:** `TEACHER`, `ADMIN`
- **Mô tả:** Quản lý bài tập dịch, gán CEFR, văn bản nguồn, chính sách clipboard.

### `GET /api/teacher/source-texts` & `POST /api/teacher/source-texts`
- **Quyền:** `TEACHER`, `ADMIN`
- **Mô tả:** Quản lý văn bản nguồn và phiên bản học liệu.

### `GET /api/admin/dashboard`
- **Quyền:** `ADMIN`, `TEACHER`
- **Mô tả:** Thống kê tổng số tài khoản, bài dịch, lượng token AI và chi phí vận hành.

### `GET /api/admin/prompts` & `POST /api/admin/prompts`
- **Quyền:** `ADMIN`
- **Mô tả:** Quản lý các phiên bản Hidden Prompts cho AI.

### `POST /api/admin/prompts/:id/activate`
- **Quyền:** `ADMIN`
- **Mô tả:** Kích hoạt phiên bản prompt mới (tự động lưu trữ phiên bản cũ).

### `GET /api/admin/mqm-rubrics` & `POST /api/admin/mqm-rubrics`
- **Quyền:** `ADMIN`, `TEACHER`, `RESEARCHER`
- **Mô tả:** Quản lý phiên bản Rubric MQM, taxonomy và trọng số điểm phạt.

### `GET /api/admin/users` & `PATCH /api/admin/users/:id/status`
- **Quyền:** `ADMIN`
- **Mô tả:** Quản lý người dùng, tìm kiếm và khóa/mở khóa tài khoản.

### `GET /api/admin/translation-memory` & `POST /api/admin/translation-memory`
- **Quyền:** Đọc (`ALL`), Thêm/Duyệt (`TEACHER`, `ADMIN`).
- **Mô tả:** Kho cặp câu ngữ liệu song ngữ đã thẩm định.

### `GET /api/admin/audit-logs`
- **Quyền:** `ADMIN`
- **Mô tả:** Xem nhật ký audit hệ thống.

---

## 4. Research Endpoints

### `GET /api/research/studies`
- **Quyền:** `RESEARCHER`, `ADMIN`
- **Mô tả:** Danh sách đề tài nghiên cứu, phân nhóm thực nghiệm vs đối chứng.

### `GET /api/research/corpus`
- **Quyền:** `RESEARCHER`, `ADMIN`
- **Mô tả:** Truy xuất Translation Corpus đối gióng song ngữ có giảm nhận dạng.
- **Query params:** `cefr`, `pseudonymize` (`true`/`false`).

### `GET /api/research/comparison`
- **Quyền:** `RESEARCHER`, `ADMIN`
- **Mô tả:** Thống kê đối sánh giữa nhóm có AI hỗ trợ vs đối chứng, và hiệu quả Pre/Post-editing.

### `GET /api/research/sus`
- **Quyền:** `ALL` (xem câu hỏi), `RESEARCHER`/`ADMIN` (xem dữ liệu đầy đủ).
- **Mô tả:** Điểm SUS tổng thể, xếp loại và chi tiết câu trả lời.

### `POST /api/research/surveys/:id/responses`
- **Quyền:** `STUDENT`, `ALL`
- **Mô tả:** Nộp phiếu khảo sát SUS 10 câu (thang đo 1-5).

### `POST /api/research/exports`
- **Quyền:** `RESEARCHER`, `ADMIN`
- **Mô tả:** Xuất file CSV (CORPUS, ATTEMPTS, SUS) có UTF-8 BOM và chống CSV injection.
