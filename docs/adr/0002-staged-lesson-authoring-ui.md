# 0002 — UI soạn bài theo giai đoạn thay vì danh sách phẳng

**Status**: Accepted
**Date**: 2026-06-10

## Context

Trang quản trị quản lý nội dung **Bài học** bằng một trang 4 tab phẳng (Nội dung / Từ vựng / Ngữ pháp / Bài tập) — mỗi tab show toàn bộ danh sách và cho tạo/sửa inline ngay lập tức. Trang **Bài tập** cũng show phẳng toàn bộ **Câu hỏi** mọi loại, lọc bằng pill, chọn loại câu hỏi bằng dropdown ngay trong form.

Chuyên gia sư phạm (giảng viên hướng dẫn đồ án) đánh giá cách tổ chức này **không tốt cho sư phạm**: người soạn học liệu cần đi theo một cấu trúc — soạn nội dung kiến thức trước (từ vựng, ngữ pháp, tài liệu), rồi mới xây bài tập luyện tập trên nền kiến thức đó; trong từng phần phải **chọn loại trước, đi vào trong rồi mới tạo**, thay vì thấy mọi thứ cùng lúc.

Hai hướng chính:

1. **Giữ tab phẳng** — hiệu quả cho thao tác hàng loạt, ít click, mọi thứ một màn hình.
2. **Tổ chức theo Giai đoạn soạn bài** — trang Bài học thành hub 2 giai đoạn; mỗi loại mục có Khu soạn riêng, phải chọn cổng rồi mới vào tạo/quản lý.

Một biến thể của hướng 2 là wizard one-shot (stepper tuyến tính chỉ chạy lúc tạo mới, sửa vẫn dùng tab phẳng) — bị loại vì soạn học liệu là việc quay lại chỉnh sửa liên tục, và cái bị chê là chính cấu trúc màn hình phẳng.

## Decision

**Chọn: Tổ chức theo Giai đoạn soạn bài, drill-down thường trực** (xem `CONTEXT.md` — **Giai đoạn soạn bài**, **Khu soạn**):

- Trang Bài học là hub hiển thị **Giai đoạn 1 · Nội dung bài học** (3 cổng: Nội dung bài / Từ vựng / Quy tắc ngữ pháp) và **Giai đoạn 2 · Bài tập**, kèm trạng thái hoàn thành từng phần.
- Mỗi cổng dẫn vào một Khu soạn riêng (route riêng) — chỉ trong đó mới có nút tạo/sửa/xóa. Các editor inline hiện có (spreadsheet từ vựng, import Excel, kéo thả) giữ nguyên bên trong Khu soạn.
- Trong từng giai đoạn có **bước con tuần tự** hiển thị bằng thanh trình tự (WizardSteps) trên mọi trang con: Giai đoạn 1 — Bước 1.1 Nội dung bài → 1.2 Từ vựng → 1.3 Quy tắc ngữ pháp (kèm nút Bước trước/Bước tiếp theo); Giai đoạn 2 — Bước 2.1 Bài tập → 2.2 Chọn loại câu hỏi → 2.3 Soạn câu hỏi. Bước con điều hướng tự do (trừ 2.3 — khóa cho tới khi chọn loại ở 2.2), trạng thái done/current/upcoming tính theo dữ liệu thực.
- Trang Bài tập thành hub cổng theo **loại câu hỏi** (7 loại, kèm số lượng). Chọn loại → vào Khu soạn của loại đó → mới được tạo câu hỏi. Form câu hỏi **khóa loại** (loại quyết định ở cổng, không còn dropdown đổi loại trong form).
- Gating giữa 2 giai đoạn là **gating mềm**: Giai đoạn 2 hiện cảnh báo khi Giai đoạn 1 trống, nhưng không khóa cứng (admin có thể cần soạn nháp bài tập trước).
- Thứ tự câu hỏi toàn bài tập (orderIndex xuyên loại) quản lý bằng một khu "Thứ tự câu hỏi" thu gọn trên hub bài tập — vì các Khu soạn theo loại không thể hiện thứ tự toàn cục.

**Trade-off chấp nhận**: nhiều click hơn cho power-user, không còn nhìn toàn bộ nội dung một màn hình. Đây là trade-off có ý thức theo yêu cầu chuyên gia sư phạm: cấu trúc soạn bài phản ánh phương pháp thiết kế giảng dạy (kiến thức trước → luyện tập sau, chọn loại trước → soạn sau). Không "tối ưu" ngược về tab phẳng khi chưa có quyết định sư phạm mới.

## Consequences

- Mọi UI quản lý học liệu mới trên Trang quản trị phải theo mô hình cổng/Khu soạn, không thêm danh sách phẳng đa loại.
- Đổi loại một Câu hỏi = xóa và tạo lại trong Khu soạn khác (loại bị khóa sau khi tạo).
- Luồng tạo nối mạch wizard: tạo Bài học → đáp xuống hub Giai đoạn 1; tạo Bài tập → đáp thẳng vào hub chọn loại câu hỏi.
