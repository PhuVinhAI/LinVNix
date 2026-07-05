# Đề xuất làm lại nội dung slide báo cáo Đồ án tốt nghiệp

Bản rút gọn cho thời lượng trình bày 10 phút. Bỏ hẳn phần ảnh giao diện (Chương 4) ra khỏi slide chính vì phần demo trực tiếp sẽ nói sâu phần này. Cơ sở lý thuyết (Chương 2) chỉ giữ lại phần trực tiếp phục vụ Chương 3, cộng một slide ngắn về đặc trưng tiếng Việt vì đây là nền tảng lý giải cho việc chia 6 cấp độ và chọn phương ngữ mà demo sẽ chiếu ra. Trọng tâm vẫn dồn vào Chương 3 (Phân tích và thiết kế hệ thống), chiếm gần một nửa số slide.

## Phát hiện quan trọng

File `kl-da22ttc-nguyenhuynhphuvinh-110122203-linvnix.pptx` mang tên đúng theo đồ án tốt nghiệp hiện tại, nhưng toàn bộ 16 trang bên trong lại là nội dung của đồ án chuyên ngành cũ (file `dcct-...`): đề tài "Phát triển Giao diện Frontend cho Nền tảng học trực tuyến có yếu tố trò chơi", GVHD ThS. Nguyễn Ngọc Đan Thanh, công nghệ Next.js/Phaser.js/Socket.IO/Tailwind CSS, sản phẩm demo tên "Synlearnia". Đây là đề tài khác hoàn toàn so với đồ án đang bảo vệ: "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo", GVHD TS. Nguyễn Bảo Ân. Nhiều khả năng file pptx bị copy nhầm từ bản cũ lúc đổi tên và chưa từng được cập nhật nội dung.

Hệ thống trình bày của bản cũ (nền sáng, tiêu đề chữ than đậm, dải màu chàm chân trang, logo trường góc phải trên, thẻ bo góc viền màu, khung thiết bị bọc ảnh chụp màn hình) vẫn dùng tốt cho đề tài mới, không cần đổi.

## Quy tắc áp dụng cho bản 10 phút

- Mỗi slide tối đa 4-5 gạch đầu dòng, mỗi dòng khoảng 6-12 từ. Không viết câu văn đầy đủ như trong báo cáo, chỉ viết cụm từ chính để người nói tự diễn giải bằng lời.
- Không có slide nào chứa ảnh giao diện ứng dụng hoặc trang quản trị. Phần này để dành cho demo trực tiếp.
- Bỏ các slide chuyển phần (divider) độc lập để tiết kiệm thời gian. Thay bằng một dòng nhãn nhỏ phía trên tiêu đề mỗi slide, ví dụ "01 · TỔNG QUAN" đặt nhỏ, màu nhạt hơn tiêu đề chính, giữ vai trò định vị mà không tốn cả một trang riêng.
- Tổng 14 slide, có mốc thời gian gợi ý cho từng slide, cộng lại khoảng 9 phút, chừa 1 phút dự phòng cho nói chậm hơn dự kiến hoặc chuyển máy lúc demo.

## Các chỗ cần sửa trên mọi trang

- Dòng chữ nhỏ lặp lại trên dải màu chân trang: đổi "Phát triển Giao diện Frontend cho Nền tảng học trực tuyến có yếu tố trò chơi" thành "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo".
- Trang bìa: loại báo cáo đổi từ "BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH" thành "BÁO CÁO ĐỒ ÁN TỐT NGHIỆP" (đúng tên gọi trên bìa file docx). GVHD đổi từ ThS. Nguyễn Ngọc Đan Thanh thành TS. Nguyễn Bảo Ân. Giữ nguyên tên sinh viên, lớp, MSSV, logo trường.
- Không cần đổi màu, phông chữ, khung số trang.

## Cấu trúc 14 slide

| # | Tên slide | Thời lượng | Ghi chú |
|---|-----------|:---:|---------|
| 1 | Trang bìa | 15s | |
| 2 | Mục lục (3 phần) | 20s | |
| 3 | Tổng quan đề tài | 50s | Gộp cả Chương 1 |
| 4 | Đặc trưng tiếng Việt và khung CEFR | 40s | Chương 2, phần nền cho việc chia cấp độ/phương ngữ |
| 5 | Nền tảng AI: từ chatbot đến Agent | 45s | Chương 2, phần nền cho Chương 3 |
| 6 | Kiến trúc tổng thể hệ thống | 60s | Chương 3, trọng tâm |
| 7 | Tác nhân và ca sử dụng | 50s | Chương 3, trọng tâm |
| 8 | Quy trình Trợ lý AI | 55s | Chương 3, trọng tâm |
| 9 | Quy trình Hội thoại mô phỏng | 50s | Chương 3, trọng tâm |
| 10 | Thiết kế cơ sở dữ liệu | 55s | Chương 3, trọng tâm |
| 11 | Triển khai hệ thống | 45s | Chương 3, trọng tâm |
| 12 | Kết quả và hướng phát triển | 45s | Gộp Chương 5, không có ảnh giao diện |
| 13 | Demo | 5s | Chuyển sang demo trực tiếp |
| 14 | Cảm ơn | 5s | |

Slide 6 đến 11 (Chương 3) chiếm 6 trên 14 slide, khoảng 5 phút 15 giây trên tổng 9 phút nội dung, vẫn là phần dồn trọng tâm nhiều nhất.

---

## Chi tiết từng slide

**Slide 1 - Trang bìa**

BÁO CÁO ĐỒ ÁN TỐT NGHIỆP, tên đề tài "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo", GVHD TS. Nguyễn Bảo Ân, sinh viên Nguyễn Huỳnh Phú Vinh, lớp DA22TTC, MSSV 110122203.

Hình ảnh: khung điện thoại hiển thị màn hình Trang chủ hoặc Trợ lý AI, thay cho ảnh laptop chạy minigame HTML hiện tại.

**Slide 2 - Mục lục**

3 thẻ đánh số, giữ đúng kiểu 3 thẻ một hàng như bản cũ, không cần đổi layout:

- 01 Tổng quan: Lý do chọn đề tài, mục tiêu, đặc trưng tiếng Việt, nền tảng AI sử dụng.
- 02 Thiết kế hệ thống: Kiến trúc, cơ sở dữ liệu, quy trình AI.
- 03 Kết quả và Demo: Kết quả đạt được, hướng phát triển, demo trực tiếp.

**Slide 3 - Tổng quan đề tài** (nhãn nhỏ "01 · TỔNG QUAN")

- Học liệu số cho tiếng Việt còn ít, học viên khó luyện giao tiếp thật ngoài từ vựng rời rạc.
- Mục tiêu: nền tảng học tiếng Việt theo cấp độ A1-C2, có AI hỗ trợ đúng ngữ cảnh.
- 3 thành phần: Ứng dụng di động (Học viên), Trang quản trị (Quản trị viên), Backend dùng chung.
- Công nghệ: Flutter, React, NestJS, PostgreSQL, Redis.

Hình ảnh: không cần, dùng chữ lớn rõ ràng là đủ, hoặc một icon nhỏ minh họa cho mỗi bullet.

Nguồn: Mục 1.1-1.5. Toàn bộ Chương 1 dồn vào một slide duy nhất.

**Slide 4 - Đặc trưng tiếng Việt và khung CEFR** (nhãn nhỏ "01 · TỔNG QUAN")

- CEFR chia 6 bậc A1-C2; Việt Nam có Thông tư 17/2015/TT-BGDĐT quy định Khung năng lực tiếng Việt cho người nước ngoài theo đúng 6 bậc này.
- 6 thanh điệu: ngang, huyền, sắc, hỏi, ngã, nặng. Đổi thanh là đổi nghĩa, ví dụ "vở" và "vợ".
- 3 vùng phương ngữ Bắc, Trung, Nam, khác nhau chủ yếu ở ngữ âm và một phần từ vựng.
- Lỗi thường gặp: thanh điệu, phụ âm đầu/cuối, danh từ phân loại, trật tự từ.

Hình ảnh: bảng 6 thanh điệu kèm ví dụ "ma, má, mà, mả, mã, mạ", hoặc bản đồ 3 vùng phương ngữ.

Nguồn: Mục 2.1.1-2.1.3. Slide này lý giải trực tiếp cho màn hình chọn cấp độ và chọn phương ngữ mà demo sẽ chiếu, nên không bỏ hẳn như bản trước dù thời lượng ngắn.

**Slide 5 - Nền tảng AI: từ chatbot đến Agent** (nhãn nhỏ "01 · TỔNG QUAN")

- Chatbot thường chỉ trả lời từ dữ liệu đã huấn luyện, không biết tiến trình học của từng học viên.
- Agent được phép gọi công cụ (tool) để đọc dữ liệu thật trước khi trả lời.
- Cơ sở lý thuyết: ReAct (suy luận, hành động, quan sát), function calling của Gemini và OpenAI.
- Nguyên tắc an toàn: userId lấy từ phiên đăng nhập, tool chỉ đọc, không tự sửa hoặc xóa dữ liệu.

Hình ảnh: sơ đồ vòng lặp 3 bước, Suy luận → Gọi công cụ → Quan sát, vẽ đơn giản chữ to.

Nguồn: Mục 2.6, 2.7. Cùng với Slide 4, đây là toàn bộ những gì giữ lại của Chương 2. Phần 4 logo công nghệ liệt kê riêng (Mục 2.2-2.5) vẫn bỏ khỏi slide chính vì đã nhắc tên công nghệ ở Slide 3.

**Slide 6 - Kiến trúc tổng thể hệ thống** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Mô hình client-server, 3 tầng: Client, Server, Data và dịch vụ ngoài.
- Client: mobile Flutter (Riverpod), admin React (Zustand, TanStack Query).
- Server: NestJS chạy trên Bun, guard/pipe/interceptor xử lý xác thực và phân quyền.
- Data và dịch vụ ngoài: PostgreSQL, Redis, Google OAuth, nhà cung cấp AI.
- Điểm khác ứng dụng CRUD thường: mọi request AI đều qua backend kiểm soát.

Hình ảnh: Hình 3.1 (media/image6.png), sơ đồ kiến trúc toàn cảnh hệ thống, chiếm phần lớn slide.

Nguồn: Mục 3.2.2.

**Slide 7 - Tác nhân và ca sử dụng** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- 2 tác nhân: Học viên (ứng dụng di động), Quản trị viên (trang quản trị).
- 12 ca sử dụng chính, tiêu biểu: đăng ký/đăng nhập, học Bài học, hỏi Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, soạn học liệu.

Hình ảnh: Hình 3.2 (media/image7.jpeg), sơ đồ Use-case, đặt giữa hoặc lệch trái, chữ chú thích tối giản.

Nguồn: Mục 3.2.3, Bảng 3.1, Bảng 3.2.

**Slide 8 - Quy trình Trợ lý AI** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Học viên hỏi kèm ngữ cảnh màn hình hiện tại (bài đang xem, câu đang làm).
- Cần dữ liệu hệ thống thì mô hình gọi công cụ, backend kiểm tra tham số rồi chạy.
- Giới hạn tối đa 10 lượt gọi mô hình mỗi turn, học viên bấm Dừng được bất cứ lúc nào.

Hình ảnh: Hình 3.3 (media/image8.jpeg), sơ đồ tuần tự một lượt hỏi Trợ lý AI.

Nguồn: Mục 3.2.4.

**Slide 9 - Quy trình Hội thoại mô phỏng** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Học viên chọn Tình huống, chọn Nhân vật nhập vai, phiên bắt đầu ở trạng thái ACTIVE.
- nextTurnCharacterId xác định lượt tiếp theo thuộc Học viên hay Nhân vật AI.
- Kết thúc phiên: AI chấm điểm theo tiêu chí đã khai báo, backend lưu kết quả.

Hình ảnh: Hình 3.4 (media/image9.jpeg), sơ đồ tuần tự Hội thoại mô phỏng.

Nguồn: Mục 3.2.4.

**Slide 10 - Thiết kế cơ sở dữ liệu** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- PostgreSQL, 27 bảng chia 6 nhóm nghiệp vụ.
- 6 nhóm: Tài khoản & Xác thực, Học liệu, Luyện tập & Bài tập, Tiến trình & Mục tiêu, Tương tác AI, Hội thoại mô phỏng.
- Mọi bảng kế thừa BaseEntity: id uuid, created_at, updated_at, deleted_at (xóa mềm).
- Dữ liệu linh hoạt như cấu hình bài tập, kết quả AI lưu bằng JSONB.

Hình ảnh: Hình 3.5 (media/image10.jpeg), ERD toàn bộ hệ thống, làm nền lớn, chú thích màu theo 6 nhóm.

Nguồn: Mục 3.3, 3.3.1. Chi tiết 27 bảng để ở Phụ lục A, không đưa vào slide chính.

**Slide 11 - Triển khai hệ thống** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Cục bộ: Docker Compose gồm PostgreSQL 16, Redis 7, Backend.
- Production: Backend trên Hugging Face Spaces (Docker Space, HTTPS).
- CSDL chuyển sang CockroachDB Serverless, cache/queue dùng Aiven for Valkey.
- Admin build web tĩnh, di động biên dịch .apk cho Android.

Hình ảnh: Hình 3.6 (media/image11.png), sơ đồ triển khai hạ tầng Production.

Nguồn: Mục 3.4.1, 3.4.2.

**Slide 12 - Kết quả và hướng phát triển** (nhãn nhỏ "03 · KẾT QUẢ VÀ DEMO")

Chia 2 cột, không dùng ảnh giao diện.

Cột trái, Kết quả đạt được:
- Hoàn thiện 3 thành phần: di động, quản trị, backend.
- Học liệu đầy đủ 6 cấp độ A1-C2.
- Tích hợp 4 tính năng AI: Trợ lý AI, Khám phá ảnh, Hội thoại mô phỏng, Sinh bài tập tùy chỉnh.

Cột phải, Hướng phát triển:
- Mở rộng học liệu B1-C2, thêm tình huống mô phỏng gắn đời sống Việt Nam.
- Đánh giá phát âm, tổng hợp giọng nói, gợi ý lộ trình học theo điểm yếu.
- Học ngoại tuyến, biểu đồ thống kê cho quản trị, chuẩn bị phát hành lên kho ứng dụng.

Nguồn: Mục 5.1, 5.2.

**Slide 13 - Demo**

Giữ nguyên bản cũ, chỉ là trang chuyển tiếp. Đây là lúc nói sâu phần giao diện: đăng nhập, học bài, làm bài tập 7 dạng câu hỏi, Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, và các màn hình quản trị tương ứng.

**Slide 14 - Cảm ơn**

Giữ nguyên layout. Đổi "Cảm ơn Cô và các bạn đã lắng nghe" thành "Cảm ơn Thầy và các bạn đã lắng nghe", vì GVHD hiện tại là thầy Nguyễn Bảo Ân.

---

## Phụ lục, dùng khi hội đồng hỏi thêm

Không tính vào 14 slide chính, không thuyết trình mặc định, chỉ mở khi có câu hỏi.

**Phụ lục A - Chi tiết thực thể CSDL tiêu biểu.** Bảng 3.3 (users), Bảng 3.13 (exercises), Bảng 3.21 (conversations), Bảng 3.26 (scenarios).

**Phụ lục B - Nguồn tham khảo nền tảng.** Thông tư 17/2015/TT-BGDĐT, CEFR (Council of Europe, 2001), ReAct (Yao và cộng sự, 2023), CLIP (Radford và cộng sự, 2021), ViT (Dosovitskiy và cộng sự, 2020).

**Phụ lục C - Lưới ảnh giao diện tổng hợp.** Một slide duy nhất ghép nhỏ khoảng 8-10 ảnh tiêu biểu (mobile: trang chủ, bài học, Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh; admin: danh sách khóa học, ngân hàng câu hỏi, cấu hình mô phỏng). Dùng khi hội đồng muốn xem lại nhanh một màn hình cụ thể mà không cần mở lại ứng dụng demo. Nguồn ảnh: các Hình 4.1.x và 4.2.x, đường dẫn media đã liệt kê trong bản đề xuất đầy đủ trước đó (dùng cho bản trên 10 phút).

## Việc cần chuẩn bị

- 6 sơ đồ Hình 3.1 đến 3.6 lấy trực tiếp từ file docx (giải nén hoặc mở file rồi lưu ảnh ra).
- Khung điện thoại cho Slide 1 và Phụ lục C.
- Tập nói thử có bấm giờ theo cột "Thời lượng" ở bảng cấu trúc. 9 phút nội dung chỉ còn dư 1 phút so với mốc 10 phút, nên cần canh nhịp nói sát hơn bản trước, nhất là ở các slide Chương 3.
