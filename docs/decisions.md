# Báo cáo Quyết định Kiến trúc & Những Điểm Cần Nhóm Nghiên Cứu Xác Nhận

Tài liệu này ghi nhận các quyết định thiết kế kỹ thuật đã được triển khai, cùng danh sách 14 nội dung nghiên cứu cần Giảng viên và Hội đồng Nghiên cứu HUFLIT thẩm định và phê duyệt chính thức trước khi nghiệm thu đề tài.

---

## 1. Danh sách 14 Điểm Cần Nhóm Nghiên Cứu Xác Nhận [CẦN DUYỆT]

Theo quy định tại Phần XVI của Master Product Blueprint, các nội dung sau đây được triển khai dưới dạng **cấu hình dự thảo có thể tùy biến (Configurable Draft)** và **không được xem là đã được phê chuẩn chính thức** cho đến khi có biên bản họp của Hội đồng:

| STT | Nội dung cần phê duyệt | Trạng thái hiện tại trong hệ thống | Ghi chú kỹ thuật |
|---|---|---|---|
| 1 | **Bộ 8 tiêu chí lựa chọn văn bản nguồn** | Đã cấu hình bộ 8 tiêu chí dự thảo trong `CriteriaConfig v1.0` | Giảng viên có thể sửa đổi tiêu chí, mô tả và thang điểm trong quản trị |
| 2 | **Rubric MQM và các trọng số lỗi** | Taxonomy 4 nhóm (Accuracy, Fluency, Terminology, Style); Minor=1, Major=5, Critical=10 | Rubric được phiên bản hóa trong `MQMRubricVersion`. Thay đổi không làm sai lệch bài chấm cũ |
| 3 | **Cách tính điểm chất lượng dịch (AI Score)** | Công thức: `clamp(100 - 100 * penalty / max(words, 20), 0, 100)` | Điểm luôn được gắn nhãn minh bạch: "AI Estimated Quality Score" |
| 4 | **Định nghĩa độ khó CEFR (B1, B2, C1)** | Bảng CEFRLevel trong DB gắn với từng bài tập do giảng viên phê duyệt | Không dùng suy đoán tự động của AI làm căn cứ cấp độ duy nhất |
| 5 | **Chính sách Copy-Paste trong Training Mode** | Hỗ trợ 3 tùy chọn: `OFF`, `WARN`, `BLOCK_IN_EDITOR` | Giảng viên chủ động chọn chính sách phù hợp cho từng bài tập cụ thể |
| 6 | **Số lượt AI Feedback / Re-evaluation tối đa** | Mặc định 2-3 lượt đánh giá lại cho mỗi bài tập | Có thể cấu hình trường `maxReevaluations` tại từng TranslationTask |
| 7 | **Thiết kế phân nhóm và kiểm soát điều kiện** | Bảng `ResearchGroup` với 2 nhóm: `AI_ASSISTED` và `CONTROL` | Nhà nghiên cứu phân bổ sinh viên vào nhóm theo đề cương IRB |
| 8 | **Quy trình giảng viên chấm bản dịch & làm mù** | Đã tạo thực thể `HumanEvaluation` độc lập với `FeedbackRun` | Cho phép giảng viên chấm độc lập không bị thiên kiến bởi điểm AI |
| 9 | **Bản dịch bảng câu hỏi SUS tiếng Việt** | Áp dụng bản dịch 10 câu SUS thông dụng trong các nghiên cứu HCI | Cần đối chiếu với bản dịch chính thức được Hội đồng chấp thuận |
| 10 | **Cỡ mẫu & Phương pháp phân tích thống kê** | Cung cấp thống kê mô tả (Descriptive Statistics) | Không tự động kết luận có ý nghĩa thống kê ($p < 0.05$) khi chưa chạy t-test/ANOVA |
| 11 | **Chính sách Đồng ý Tham gia (Consent) & Lưu trữ** | Bảng `ResearchParticipant` lưu `consentStatus` và `consentVersion` | Sinh viên phải xác nhận đồng ý tham gia trước khi ghi nhận vào Corpus |
| 12 | **Nhà cung cấp AI (Provider) & Ngân sách vận hành** | Kiến trúc đa nhà cung cấp (`AIProvider`): Mock, Gemini 1.5 Pro, OpenAI | Mặc định chạy `MockAIProvider` an toàn, chuyển sang live khi cấp API key |
| 13 | **Quy trình quản lý tài khoản Giảng viên / Researcher** | Đăng ký công khai chỉ tạo vai trò `STUDENT`; vai trò cao do Admin cấp | Tránh rò rỉ quyền hạn hệ thống |
| 14 | **Chính sách bản quyền và nguồn học liệu** | Lưu trường `sourceReference` và `licenseInformation` | Bảo đảm văn bản nguồn tuân thủ nguyên tắc giáo dục hợp lệ (Fair Use) |

---

## 2. Các Quyết định Kỹ thuật Đã Chọn (Architectural Rulings)

1. **Kiến trúc Monolith Modulized (Next.js 14 App Router):**
   - *Quyết định:* Sử dụng cấu trúc thư mục module hóa (`src/features`, `src/lib`, `src/workers`, `prisma/`) trong cùng một repository thay vì monorepo đa packages phức tạp.
   - *Lý do:* Giảm thiểu lỗi hoisting dependencies của pnpm, tăng tốc độ chạy CI/CD và đơn giản hóa việc triển khai Docker Compose.

2. **Thuật toán Neo Vị trí Lỗi Unicode (Unicode Span Matcher):**
   - *Quyết định:* Không yêu cầu LLM sinh chỉ số offset số nguyên trực tiếp (do LLM thường tính lệch offset đối với các ký tự tiếng Việt đa byte). Server nhận `targetQuote` và `occurrenceIndex`, sau đó tự so khớp chuỗi Unicode an toàn. Nếu không khớp, chuyển thành `UNANCHORED` thay vì highlight sai lệch.

3. **Tính Bất biến của Bản dịch Ban đầu (Immutable Version 1):**
   - *Quyết định:* Khi sinh viên bấm Submit lần đầu, hệ thống tạo bản ghi `TranslationVersion` với `versionNumber: 1` và `kind: ORIGINAL`. Mọi lần sửa đổi tiếp theo bắt buộc tạo phiên bản mới (`kind: POST_EDIT`), ngăn chặn triệt để hành vi ghi đè dữ liệu nghiên cứu ban đầu.

4. **Phòng vệ Chống CSV Injection & Hiển thị Tiếng Việt trên Excel:**
   - *Quyết định:* Mọi ô dữ liệu xuất CSV có ký tự đầu là `=`, `+`, `-`, `@`, `\t`, `\r` đều được tự động thêm dấu nháy đơn `'`. Đầu file CSV luôn chứa ký tự UTF-8 BOM (`\uFEFF`) để Microsoft Excel hiển thị tiếng Việt hoàn hảo mà không bị lỗi font (mojibake).
