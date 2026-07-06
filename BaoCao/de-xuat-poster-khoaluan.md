# Đề xuất thiết kế poster báo cáo Đồ án tốt nghiệp

Giả định: khổ A0 dọc (84,1 x 118,9 cm), dùng để trưng bày cạnh buổi bảo vệ. Nếu trường quy định khổ A1 thì giữ nguyên bố cục 3 cột dưới đây, chỉ co tỷ lệ lại. Nếu trường đã có mẫu poster riêng, bỏ qua phần khung/màu, chỉ lấy phần nội dung từng vùng.

Poster khác slide 10 phút ở một điểm quan trọng: không có người thuyết trình đứng cạnh giải thích, nên phải tự đứng được một mình. Vì vậy bản này đưa ảnh giao diện trở lại (khác với bản slide đã cắt hết phần này vì có demo trực tiếp), và phủ đều cả 5 chương thay vì dồn hết vào Chương 3.

Toàn bộ mã màu và font ở dưới lấy trực tiếp từ mã nguồn thật, không tự chọn: `mobile/lib/core/theme/app_theme.dart` (bảng `AppColors.light`) và `admin/app/styles/globals.css` (khối `:root`). Hai file này dùng chung một bộ token, comment ngay trong code Flutter còn ghi "Mirrors admin/app/styles/globals.css", nên lấy nguyên bộ này cho poster để ba thứ, app, trang quản trị, poster, nhìn cùng một hệ nhận diện.

## Bố cục tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo TVU]      TÊN ĐỀ TÀI (chữ lớn nhất poster)      [QR demo]  │
│ ══●═══════●═══════●═══════●═══════●═══════●══  (dải 6 màu thanh) │
│                 SV · Lớp · MSSV · GVHD                            │
├────────────────┬──────────────────────────┬──────────────────────┤
│ 01 ĐẶT VẤN ĐỀ  │ 02 KIẾN TRÚC VÀ THIẾT KẾ │ 03 KẾT QUẢ NGHIÊN CỨU│
│    VÀ MỤC TIÊU │    HỆ THỐNG              │                      │
│  (badge Indigo)│   (badge Violet)         │   (badge Cyan)       │
│                │                          │                      │
│ - Thực trạng   │  [Sơ đồ kiến trúc lớn]   │ [Lưới 4-6 ảnh chụp   │
│ - Mục tiêu     │                          │  màn hình: mobile +  │
│ - Đối tượng    │  [CSDL: 27 bảng/6 nhóm]  │  quản trị]           │
│ - Đặc trưng    │                          │                      │
│   tiếng Việt   │  [4 ô tính năng AI]      │ - Kết quả đạt được   │
│ - Công nghệ    │                          │ - Hướng phát triển   │
│   (hàng icon)  │  [Vòng lặp Agent, mini]  │                      │
├────────────────┴──────────────────────────┴──────────────────────┤
│  Tài liệu tham khảo chọn lọc · Lời cảm ơn · Liên hệ               │
└──────────────────────────────────────────────────────────────────┘
```

Cột giữa rộng hơn hai cột hai bên (khoảng 40% so với 30% mỗi bên), vì đây là phần kỹ thuật cốt lõi cần nhìn rõ từ xa. Mỗi cột gắn với đúng một màu vai trò trong hệ thống token thật: cột 1 Indigo (primary), cột 2 Violet (secondary), cột 3 Cyan (accent), không phải chọn màu tùy hứng.

## Nội dung từng vùng

### Header (dải trên cùng, toàn chiều rộng)

- Trái: logo Đại học Trà Vinh và logo Trường Kỹ thuật và Công nghệ.
- Giữa: "ỨNG DỤNG HỖ TRỢ DẠY HỌC TIẾNG VIỆT VỚI TRÍ TUỆ NHÂN TẠO", cỡ chữ lớn nhất trên poster. Dòng phụ bên dưới: "Đồ án tốt nghiệp - Ngành Công nghệ thông tin".
- Dưới dòng phụ: Nguyễn Huỳnh Phú Vinh - Lớp DA22TTC - MSSV 110122203 - GVHD TS. Nguyễn Bảo Ân.
- Phải: khung QR nhỏ dẫn tới video demo hoặc bản .apk, nếu chưa có thì để trống, đừng chèn placeholder kiểu "[link ở đây]" lên bản in thật.
- Ngay dưới header, trước khi vào 3 cột: một dải mỏng chạy hết chiều ngang, lặp lại 6 chấm hoặc vạch màu theo đúng bộ màu thanh điệu của app (chi tiết ở phần "Điểm nhấn sáng tạo" bên dưới). Đây là chữ ký hình ảnh riêng cho đề tài, thay cho một dải màu đặc vô nghĩa.

### Cột 1 - Đặt vấn đề và mục tiêu (nền tint Indigo nhạt)

- Thực trạng: học liệu số cho tiếng Việt còn ít, học viên khó luyện giao tiếp thật ngoài từ vựng rời rạc.
- Mục tiêu: nền tảng học tiếng Việt theo cấp độ, có AI hỗ trợ đúng ngữ cảnh.
- Đối tượng và phạm vi: người nước ngoài học tiếng Việt; 2 vai trò Học viên và Quản trị viên.
- Đặc trưng tiếng Việt: 6 thanh điệu (ngang, huyền, sắc, hỏi, ngã, nặng), 3 vùng phương ngữ Bắc/Trung/Nam, khung CEFR 6 bậc A1-C2 theo Thông tư 17/2015/TT-BGDĐT. Ví dụ "ma, má, mà, mả, mã, mạ" tô màu theo đúng bộ màu thanh điệu của app, xem phần điểm nhấn sáng tạo.
- Công nghệ nền: hàng icon Flutter, React, NestJS, PostgreSQL, Redis.

Hình ảnh: 6 âm tiết ví dụ tô màu theo thanh, hoặc bản đồ nhỏ 3 vùng phương ngữ.

Nguồn: Mục 1.1-1.5, 2.1.1-2.1.3.

### Cột 2 - Kiến trúc và thiết kế hệ thống (nền tint Violet nhạt, cột rộng nhất)

- Sơ đồ kiến trúc tổng thể hệ thống, đây là hình ảnh lớn nhất trên toàn poster. 3 tầng: Client (Flutter, React), Server (NestJS/Bun), Data và dịch vụ ngoài (PostgreSQL, Redis, AI).
- Cơ sở dữ liệu: 27 bảng chia 6 nhóm nghiệp vụ. Nếu ERD gốc quá nhiều chi tiết để đọc được khi in, thay bằng số liệu lớn "27 bảng · 6 nhóm nghiệp vụ" kèm sơ đồ khối 6 ô, không nhất thiết phải nhét cả Hình 3.5 nguyên bản.
- 4 tính năng AI dạng lưới icon: Trợ lý AI (hỏi đáp theo ngữ cảnh màn hình), Khám phá ảnh (học từ vựng qua ảnh), Hội thoại mô phỏng (nhập vai, chấm điểm theo tiêu chí), Sinh bài tập tùy chỉnh (AI tạo câu hỏi theo yêu cầu).
- Mini sơ đồ vòng lặp Agent: Suy luận, Gọi công cụ, Quan sát, kèm một dòng chú thích "Agent chỉ đọc dữ liệu, không tự sửa hoặc xóa".

Hình ảnh: Hình 3.1 (media/image6.png) phóng to làm trung tâm cột. Hình 3.5 (media/image10.jpeg) dùng bản rút gọn nếu còn chỗ.

Nguồn: Mục 2.6, 2.7, 3.2.2, 3.3.

### Cột 3 - Kết quả nghiên cứu (nền tint Cyan nhạt)

- Lưới 4-6 ảnh chụp màn hình tiêu biểu: 2-3 ảnh mobile trong khung điện thoại (trang chủ hoặc bài học, Trợ lý AI, Hội thoại mô phỏng) và 2-3 ảnh quản trị trong khung laptop (danh sách khóa học, ngân hàng câu hỏi).
- Kết quả đạt được: hoàn thiện 3 thành phần (di động, quản trị, backend), học liệu đủ 6 cấp độ A1-C2, tích hợp đủ 4 tính năng AI.
- Hướng phát triển: mở rộng học liệu B1-C2, đánh giá phát âm và tổng hợp giọng nói, học ngoại tuyến trên di động.

Hình ảnh: chọn từ Hình 4.1.3, 4.1.9, 4.1.11 (mobile) và Hình 4.2.2, 4.2.18 (quản trị), đường dẫn media đã liệt kê trong file đề xuất slide.

Nguồn: Mục 4.1, 4.2, 5.1, 5.2.

### Footer (dải dưới cùng, chữ nhỏ, toàn chiều rộng)

- Tài liệu tham khảo chọn lọc, không cần đủ 26 nguồn như báo cáo: Thông tư 17/2015/TT-BGDĐT; CEFR, Council of Europe 2001; ReAct, Yao và cộng sự 2023.
- Lời cảm ơn ngắn: GVHD TS. Nguyễn Bảo Ân, quý thầy cô Trường Kỹ thuật và Công nghệ, Đại học Trà Vinh.

## Bảng màu và phông chữ, lấy đúng từ mã nguồn

| Vai trò trong token | Mã màu | Dùng trên poster |
|---|---|---|
| Primary, Indigo 600 | `#4F46E5` | Màu chủ đạo: tên đề tài, badge cột 1, chi tiết nhấn chính |
| Secondary, Violet 600 | `#7C3AED` | Badge cột 2, cột trọng tâm kỹ thuật |
| Accent, Cyan 600 | `#0891B2` | Badge cột 3, chi tiết nhấn phụ |
| Background, Slate 50 | `#F8FAFC` | Nền poster, thay cho trắng thuần |
| Card, White | `#FFFFFF` | Nền các khối nội dung, khung ảnh |
| Foreground, Slate 900 | `#0F172A` | Chữ chính |
| Muted foreground, Slate 600 | `#475569` | Chữ phụ, ghi chú nguồn |
| Border, Slate 200 | `#E2E8F0` | Viền box, đường chia cột |
| Success / Warning / Error | `#16A34A` / `#D97706` / `#DC2626` | Chỉ dùng nếu có biểu đồ trạng thái |

Tint nền mỗi cột, cùng họ Tailwind với 3 màu badge ở trên: cột 1 `#EEF2FF` (Indigo 50, cũng chính là màu `sidebar-accent` đang dùng thật trong trang quản trị), cột 2 `#F5F3FF` (Violet 50), cột 3 `#ECFEFF` (Cyan 50).

Font: Inter cho toàn bộ tiêu đề và nội dung, đúng font cả admin lẫn mobile đang dùng (`--font-sans: 'Inter'` trong globals.css, `GoogleFonts.inter` trong app_theme.dart). Riêng chữ tiếng Việt minh họa, ví dụ cặp "vở/vợ" hoặc tên đề tài, đặt bằng Be Vietnam Pro, đúng font riêng mà mobile app dùng cho nội dung tiếng Việt (`GoogleFonts.beVietnamPro` trong hàm `vnStyle`). Có 2 phông vẫn nhất quán vì cùng lấy từ code thật, không phải phối ngẫu nhiên.

## Điểm nhấn sáng tạo riêng cho đề tài này

- Badge số thứ tự 3 cột tô đúng 3 màu vai trò của hệ thống token: 01 Indigo, 02 Violet, 03 Cyan. Màu không chọn tùy ý mà đi thẳng theo tên gọi primary/secondary/accent trong code, nên khớp tuyệt đối với sản phẩm thật.
- Dải màu thanh điệu dưới header và ví dụ "ma, má, mà, mả, mã, mạ" ở cột 1: tô đúng theo bộ `VietnameseAccentTokens` mà app mobile dùng để tô dấu thanh trong bài học, đỏ `#DC2626` cho thanh sắc và ngã, cam `#D97706` cho thanh hỏi, xanh lá `#16A34A` cho thanh huyền và nặng. Đây là màu có chức năng thật trong app, không phải màu trang trí thêm vào cho đẹp.
- Toàn bộ box và card giữ đúng phong cách phẳng mà cả hai app đang theo: nền trắng, viền mảnh 1px Slate 200, bo góc, không đổ bóng, không tô gradient (`elevation: 0` xuất hiện xuyên suốt `app_theme.dart`). Tránh viền một cạnh hoặc thanh màu dán lệch một bên, dùng viền đủ 4 cạnh hoặc mảng tint đầy, đúng nguyên tắc thiết kế phẳng của sản phẩm.
- Vòng tròn điểm số: màn hình kết quả Hội thoại mô phỏng thật trong app đã dùng một vòng tròn lớn để chấm điểm cuối phiên. Lấy lại đúng hình dạng này cho các con số ấn tượng trên poster, ví dụ 27 cho số bảng CSDL, 6 cho số cấp độ, 4 cho số tính năng AI, thay vì thẻ số hình chữ nhật thông thường.
- Vòng lặp Agent vẽ dạng cung tròn khép kín: 3 nút Suy luận, Gọi công cụ, Quan sát nối bằng mũi tên cong quay vòng, không phải hộp vuông nối thẳng hàng. Đúng bản chất kỹ thuật hơn vì đây thật sự là một vòng lặp, đồng thời nhìn khác hẳn kiểu flowchart quen thuộc.
- Khung bong bóng chat cho 1-2 câu trích dẫn ngắn, ví dụ một câu Trợ lý AI có thể trả lời hoặc một câu hỏi tiêu biểu của học viên, đặt trong khung hội thoại có đuôi nhọn. Gợi thẳng giao diện chat thật của Trợ lý AI và Hội thoại mô phỏng, đặt được ở đầu cột 2 hoặc ngay dưới header.
- Dấu thanh làm ký hiệu bullet riêng cho khối "Đặc trưng tiếng Việt" ở cột 1: thay chấm tròn thường bằng 5 dấu thanh thật của tiếng Việt xoay vòng, sắc, huyền, hỏi, ngã, nặng. Chi tiết nhỏ nhưng không đề tài nào khác có được vì gắn chặt với đúng nội dung đang nói.
- Dải bậc thang 6 cấp độ A1 đến C2 hình cầu thang đi lên, đặt cạnh mục Mục tiêu ở cột 1, cho thấy trực quan việc học có lộ trình tăng dần thay vì một danh sách phẳng.
- Tránh mô-típ Việt Nam chung chung kiểu nón lá, áo dài, hoa sen, trống đồng. Đây là poster kỹ thuật, chi tiết Việt Nam nên đến từ chính ứng dụng, thanh điệu, phương ngữ, cấp độ, chứ không phải hình ảnh du lịch dán vào cho có không khí.

## Hướng dẫn kích thước khi in

- Cỡ chữ tối thiểu để đọc rõ khi đứng cách 1-1,5m: tên đề tài khoảng 90-110pt, tiêu đề mỗi cột khoảng 36-40pt, nội dung khoảng 24-28pt, chú thích nguồn khoảng 16-18pt.
- Ảnh chụp màn hình mobile đặt trong khung điện thoại, ảnh quản trị đặt trong khung laptop, giữ đúng quy tắc đã áp dụng cho slide.
- Giữ khoảng trắng giữa 3 cột đủ rộng, khoảng 2-3cm ở khổ A0, để mắt không bị rối khi quét ngang.

## Việc cần chuẩn bị

- Sơ đồ Hình 3.1 (kiến trúc) cần chất lượng cao vì được phóng to nhất trên poster. Nếu ảnh gốc trong docx bị mờ khi phóng, nên vẽ lại bằng công cụ vector (Figma, draw.io) thay vì phóng trực tiếp ảnh raster, và tô lại đúng 3 màu Indigo/Violet/Cyan ở trên cho 3 tầng kiến trúc nếu muốn đồng bộ tối đa.
- QR code dẫn tới demo: quay video ngắn (1-2 phút) hoặc up bản .apk lên nơi tải được, rồi tạo QR trỏ tới đó.
- Kiểm tra kích thước in thật trước khi gửi nhà in, vì lỗi thường gặp nhất của poster A0 là chữ cột phụ quá nhỏ khi đứng xa 1-2m không đọc được.
