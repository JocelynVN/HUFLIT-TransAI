# Hướng dẫn Phân hệ Nghiên cứu Khoa học (Research Module)

## 1. Mục đích Nghiên cứu
Phân hệ nghiên cứu được thiết kế nhằm hỗ trợ các nhà nghiên cứu và giảng viên tại HUFLIT thu thập dữ liệu thực nghiệm có cấu trúc để đánh giá tác động của AI Feedback theo khung phân loại lỗi MQM (Multidimensional Quality Metrics) đến năng lực dịch thuật của sinh viên.

---

## 2. Thiết kế Thực nghiệm (Experimental Design)

### 2.1. Phân nhóm Đối tượng
1. **Nhóm Thực nghiệm (AI-Assisted Group):**
   - Sinh viên dịch văn bản độc lập.
   - Nhận phản hồi AI chi tiết: Tô màu lỗi MQM, giải thích nguyên nhân, gợi ý cách sửa.
   - Tiến hành hậu hiệu đính (Post-editing) với sự hỗ trợ của AI.
2. **Nhóm Đối chứng (Control Group):**
   - Sinh viên dịch văn bản độc lập.
   - Không nhận phản hồi AI tức thì, áp dụng phương pháp học truyền thống.

### 2.2. Quy trình Pre-test / Post-test
- **Pre-test (Kiểm tra đầu vào):** Đo lường năng lực dịch ban đầu trước khi can thiệp công cụ.
- **Intervention (Giai đoạn can thiệp):** Chuỗi các bài tập dịch hai chiều Anh–Việt theo lộ trình B1, B2, C1.
- **Post-test (Kiểm tra đầu ra):** Đánh giá mức độ cải thiện về độ chính xác, ngữ pháp, thuật ngữ và văn phong.
- **Lưu ý nghiên cứu:** Hệ thống lưu vết cụ thể tình trạng bài kiểm tra có cho phép AI hỗ trợ hay không.

---

## 3. Thang đo Trải nghiệm SUS (System Usability Scale)

Hệ thống tích hợp 10 câu hỏi chuẩn SUS (John Brooke, 1996) được chuyển ngữ phù hợp với sinh viên Việt Nam:

1. Tôi nghĩ rằng tôi muốn sử dụng hệ thống này thường xuyên.
2. Tôi thấy hệ thống này phức tạp một cách không cần thiết.
3. Tôi nghĩ rằng hệ thống này rất dễ sử dụng.
4. Tôi nghĩ rằng tôi sẽ cần sự hỗ trợ của một chuyên viên kỹ thuật để có thể sử dụng hệ thống này.
5. Tôi nhận thấy các chức năng khác nhau trong hệ thống này được tích hợp rất tốt.
6. Tôi nghĩ rằng có quá nhiều điểm thiếu nhất quán trong hệ thống này.
7. Tôi tưởng tượng rằng hầu hết mọi người sẽ học cách sử dụng hệ thống này rất nhanh.
8. Tôi cảm thấy hệ thống này rất rườm rà, khó thao tác khi sử dụng.
9. Tôi cảm thấy rất tự tin khi sử dụng hệ thống này.
10. Tôi cần phải học rất nhiều điều trước khi có thể bắt đầu sử dụng hệ thống này.

### Phương pháp tính điểm chuẩn:
- Câu hỏi lẻ (1, 3, 5, 7, 9): $\text{Score}_i = \text{Trả lời} - 1$
- Câu hỏi chẵn (2, 4, 6, 8, 10): $\text{Score}_i = 5 - \text{Trả lời}$
- Tổng điểm SUS: $\text{SUS} = \sum_{i=1}^{10} \text{Score}_i \times 2.5$ (Thang điểm 0 – 100).

### Thang xếp loại học thuật:
- $\ge 85$: Hạng A+ (Xuất sắc)
- $80 - 84.9$: Hạng A (Rất tốt)
- $68 - 79.9$: Hạng B/C (Đạt yêu cầu benchmark quốc tế)
- $50 - 67.9$: Hạng D (Kém)
- $< 50$: Hạng F (Không chấp nhận được)

---

## 4. Translation Corpus & Giảm nhận dạng (Pseudonymization)

- Mỗi sinh viên tham gia nghiên cứu được gán một mã định danh giả danh duy nhất (ví dụ: `P-HUFLIT-001`).
- Khi xuất dữ liệu ra CSV/Excel cho mục đích công bố khoa học, toàn bộ tên thật và địa chỉ email sinh viên được thay thế bằng mã giả danh.
- Dữ liệu Corpus đối gióng song ngữ gồm:
  - Câu/đoạn nguồn
  - Bản dịch sinh viên v1.0
  - Bản dịch sau hậu hiệu đính
  - Gợi ý AI
  - Các lỗi MQM (Category, Subtype, Severity, Explanation)
  - Điểm AI ước tính.

---

## 5. Phòng chống CSV Formula Injection (CWE-1236)
Toàn bộ dữ liệu xuất sang định dạng bảng tính (.csv) được làm sạch tự động:
- Các ô dữ liệu bắt đầu bằng các ký tự nguy hiểm (`=`, `+`, `-`, `@`, `\t`, `\r`) được thêm ký tự nháy đơn `'` ở đầu để ngăn Microsoft Excel thực thi lệnh DDE độc hại.
- Thêm tiền tố UTF-8 Byte Order Mark (`\uFEFF`) để đảm bảo tiếng Việt có dấu hiển thị chính xác trên mọi phiên bản Excel.
