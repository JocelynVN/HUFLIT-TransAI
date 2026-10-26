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
```

---

## 3. Khởi động Cơ sở dữ liệu với Docker Compose

Khởi động PostgreSQL 16 container:
```bash
docker compose up -d postgres
```

Kiểm tra trạng thái container:
```bash
docker ps
```

---

## 4. Đồng bộ CSDL & Dữ liệu Mẫu (Seeding)

Đẩy schema Prisma vào PostgreSQL:
```bash
pnpm prisma db push
```

Chạy script tạo dữ liệu mẫu ban đầu:
```bash
pnpm db:seed
```

Tài khoản mẫu được tạo tự động:
- **Sinh viên:** `student@huflit.edu.vn` / Mật khẩu: `student123`
- **Giảng viên:** `teacher@huflit.edu.vn` / Mật khẩu: `teacher123`
- **Nghiên cứu viên:** `researcher@huflit.edu.vn` / Mật khẩu: `researcher123`
- **Quản trị viên:** `admin@huflit.edu.vn` / Mật khẩu: `admin123`

---

## 5. Build và Chạy Ứng dụng

### Chế độ Development (Nhà phát triển):
```bash
pnpm dev
```
Truy cập tại: `http://localhost:3000`

### Chế độ Production:
```bash
pnpm build
pnpm start
```

### Chạy Standalone AI Evaluation Worker (Tùy chọn):
Nếu sử dụng Redis và BullMQ để tách worker độc lập:
```bash
pnpm worker
```

---

## 6. Chạy Kiểm thử Tự động (Testing Suite)

Chạy toàn bộ Unit & Integration tests bằng Vitest:
```bash
pnpm test
```
