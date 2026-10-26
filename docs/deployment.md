# Hướng dẫn Triển khai & Vận hành (Deployment Guide)

## 1. Yêu cầu Hệ thống
- Hệ điều hành: Linux (Ubuntu 22.04 LTS khuyến nghị), macOS hoặc Windows (WSL2).
- Node.js: >= v20.15.0
- Quản lý gói: `pnpm` >= 10.x hoặc `npm` >= 10.x
- Docker & Docker Compose: Khuyến nghị để chạy PostgreSQL và Redis.

---

## 2. Các Biến Môi trường (Environment Variables)

Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Nội dung cấu hình chính:
```env
# Database kết nối PostgreSQL (Container cổng 5433 hoặc cổng mặc định 5432)
DATABASE_URL="postgresql://huflit_user:huflit_password@localhost:5433/huflit_translation_db?schema=public"

# Redis (Hỗ trợ hàng đợi bất đồng bộ BullMQ)
REDIS_URL="redis://localhost:6379"

# Khóa bí mật JWT (tối thiểu 32 ký tự)
AUTH_SECRET="huflit-ai-assisted-translation-practice-secret-key-super-secure-2026"
NEXTAUTH_URL="http://localhost:3000"

# Bộ máy AI (Mặc định "mock" chạy offline, hoặc "gemini", "openai")
AI_PROVIDER="mock"
AI_MODEL_ID="mock-mqm-evaluator-v1"

# Khóa API khi kích hoạt AI trực tiếp (Live Provider)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
AI_DAILY_BUDGET_USD="50.0"

NODE_ENV="production"
PORT=3000
WEB_PORT=3001
```

---

## 3. Khởi chạy Trọn gói All-in-One với Docker Compose (Phương pháp Khuyến nghị)

Toàn bộ hệ thống được đóng gói hoàn chỉnh trong file [docker-compose.yml](file:///home/dinhvankhoa/Documents/Git/English/docker-compose.yml) bao gồm:
- **`huflit_postgres`**: CSDL PostgreSQL 16 có healthcheck `pg_isready` (cổng host 5433).
- **`huflit_redis`**: Message broker Redis 7 có healthcheck `redis-cli ping` (cổng host 6380).
- **`huflit_web_app`**: Web Application Next.js 14 có script [docker-entrypoint.sh](file:///home/dinhvankhoa/Documents/Git/English/docker-entrypoint.sh) tự động đợi DB sẵn sàng, tự động thực thi `prisma db push` và `pnpm db:seed` trước khi khởi động web server (cổng host 3001 hoặc `${WEB_PORT}`).
- **`huflit_ai_worker`**: Standalone AI Worker phụ trách xử lý hàng đợi BullMQ ngầm định.

### Khởi động toàn bộ cụm:
```bash
docker compose up -d
```

### Xem nhật ký khởi động và trạng thái:
```bash
# Xem trạng thái các container
docker compose ps

# Xem nhật ký khởi động, quá trình di chuyển CSDL và nạp seed
docker compose logs -f web

# Xem nhật ký xử lý của AI Worker
docker compose logs -f worker
```

Sau khi khởi chạy thành công, truy cập hệ thống tại:
👉 **`http://localhost:3001`** (hoặc cổng được định nghĩa trong `WEB_PORT`).

---

## 4. Dữ liệu Mẫu và Tài khoản Đăng nhập (Seeded Accounts)

Hệ thống đã tự động kích hoạt tài khoản mẫu cho 4 vai trò chính:
- **Sinh viên:** `student@huflit.edu.vn` / Mật khẩu: `student123`
- **Giảng viên:** `teacher@huflit.edu.vn` / Mật khẩu: `teacher123`
- **Nghiên cứu viên:** `researcher@huflit.edu.vn` / Mật khẩu: `researcher123`
- **Quản trị viên:** `admin@huflit.edu.vn` / Mật khẩu: `admin123`

---

## 5. Khởi chạy Cục bộ Dành cho Lập trình viên (Local Development)

Nếu muốn phát triển tính năng mới với Next.js hot-reload:

1. Chỉ khởi động PostgreSQL và Redis container:
```bash
docker compose up -d postgres redis
```

2. Đồng bộ CSDL và nạp dữ liệu:
```bash
pnpm prisma db push
pnpm db:seed
```

3. Chạy giao diện phát triển:
```bash
pnpm dev
```
Truy cập tại: `http://localhost:3000`

4. Chạy background worker (tùy chọn):
```bash
pnpm worker
```

---

## 6. Chạy Kiểm thử Tự động (Testing Suite)

Chạy toàn bộ Unit & Integration tests bằng Vitest:
```bash
pnpm test
```
