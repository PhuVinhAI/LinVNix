# Đề xuất làm lại nội dung slide báo cáo Đồ án tốt nghiệp

Bản rút gọn cho thời lượng trình bày 10 phút. Bỏ hẳn phần ảnh giao diện (Chương 4) ra khỏi slide chính vì phần demo trực tiếp sẽ nói sâu phần này. Cơ sở lý thuyết (Chương 2) chỉ giữ lại phần trực tiếp phục vụ Chương 3, cộng một slide ngắn về đặc trưng tiếng Việt vì đây là nền tảng lý giải cho việc chia 6 cấp độ và chọn phương ngữ mà demo sẽ chiếu ra. Trọng tâm dồn vào Chương 3 (Phân tích và thiết kế hệ thống): sau khi phân tích thêm code 2 tính năng AI còn thiếu (Khám phá ảnh, Sinh bài tập tùy chỉnh), toàn bộ 4 tính năng AI của hệ thống giờ đều có slide quy trình riêng, đưa Chương 3 lên 8 trên 16 slide.

## Phát hiện quan trọng

File `kl-da22ttc-nguyenhuynhphuvinh-110122203-linvnix.pptx` mang tên đúng theo đồ án tốt nghiệp hiện tại, nhưng toàn bộ 16 trang bên trong lại là nội dung của đồ án chuyên ngành cũ (file `dcct-...`): đề tài "Phát triển Giao diện Frontend cho Nền tảng học trực tuyến có yếu tố trò chơi", GVHD ThS. Nguyễn Ngọc Đan Thanh, công nghệ Next.js/Phaser.js/Socket.IO/Tailwind CSS, sản phẩm demo tên "Synlearnia". Đây là đề tài khác hoàn toàn so với đồ án đang bảo vệ: "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo", GVHD TS. Nguyễn Bảo Ân. Nhiều khả năng file pptx bị copy nhầm từ bản cũ lúc đổi tên và chưa từng được cập nhật nội dung.

Hệ thống trình bày của bản cũ (nền sáng, tiêu đề chữ than đậm, dải màu chàm chân trang, logo trường góc phải trên, thẻ bo góc viền màu, khung thiết bị bọc ảnh chụp màn hình) vẫn dùng tốt cho đề tài mới, không cần đổi.

## Quy tắc áp dụng cho bản 10 phút

- Mỗi slide tối đa 4-5 gạch đầu dòng, mỗi dòng khoảng 6-15 từ. Không viết câu văn đầy đủ như trong báo cáo, chỉ viết cụm ý chính để người nói tự diễn giải bằng lời.
- Không có slide nào chứa ảnh giao diện ứng dụng hoặc trang quản trị. Phần này để dành cho demo trực tiếp.
- Bỏ các slide chuyển phần (divider) độc lập để tiết kiệm thời gian. Thay bằng một dòng nhãn nhỏ phía trên tiêu đề mỗi slide, ví dụ "01 · TỔNG QUAN" đặt nhỏ, màu nhạt hơn tiêu đề chính, giữ vai trò định vị mà không tốn cả một trang riêng.
- Tổng 16 slide, có mốc thời gian gợi ý cho từng slide, cộng lại khoảng 9 phút 30 giây, chừa 30 giây dự phòng cho nói chậm hơn dự kiến hoặc chuyển máy lúc demo.

## Các chỗ cần sửa trên mọi trang

- Dòng chữ nhỏ lặp lại trên dải màu chân trang: đổi "Phát triển Giao diện Frontend cho Nền tảng học trực tuyến có yếu tố trò chơi" thành "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo".
- Trang bìa: loại báo cáo đổi từ "BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH" thành "BÁO CÁO ĐỒ ÁN TỐT NGHIỆP" (đúng tên gọi trên bìa file docx). GVHD đổi từ ThS. Nguyễn Ngọc Đan Thanh thành TS. Nguyễn Bảo Ân. Giữ nguyên tên sinh viên, lớp, MSSV, logo trường.
- Không cần đổi màu, phông chữ, khung số trang.

## Cấu trúc 16 slide

| # | Tên slide | Thời lượng | Ghi chú |
|---|-----------|:---:|---------|
| 1 | Trang bìa | 15s | |
| 2 | Mục lục (3 phần) | 20s | |
| 3 | Tổng quan đề tài | 45s | Gộp cả Chương 1 |
| 4 | Đặc trưng tiếng Việt và khung CEFR | 35s | Chương 2, phần nền cho việc chia cấp độ/phương ngữ |
| 5 | Nền tảng AI: từ chatbot đến Agent | 40s | Chương 2, phần nền cho Chương 3 |
| 6 | Kiến trúc tổng thể hệ thống | 55s | Chương 3, trọng tâm |
| 7 | Tác nhân và ca sử dụng | 45s | Chương 3, trọng tâm |
| 8 | Quy trình Trợ lý AI | 50s | Chương 3, trọng tâm |
| 9 | Quy trình Hội thoại mô phỏng | 45s | Chương 3, trọng tâm |
| 10 | Quy trình Khám phá ảnh | 40s | Chương 3, trọng tâm, mới thêm, phân tích trực tiếp từ code backend |
| 11 | Quy trình Sinh bài tập tùy chỉnh | 40s | Chương 3, trọng tâm, mới thêm, phân tích trực tiếp từ code backend |
| 12 | Thiết kế cơ sở dữ liệu | 50s | Chương 3, trọng tâm |
| 13 | Triển khai hệ thống | 40s | Chương 3, trọng tâm |
| 14 | Kết quả và hướng phát triển | 40s | Gộp Chương 5, không có ảnh giao diện |
| 15 | Demo | 5s | Chuyển sang demo trực tiếp |
| 16 | Cảm ơn | 5s | |

Slide 6 đến 13 (Chương 3) chiếm 8 trên 16 slide, khoảng 6 phút 05 giây trên tổng 9 phút 30 giây nội dung: đúng nửa số slide và phần lớn thời lượng, dồn hẳn trọng tâm vào chương này. 4 tính năng AI của hệ thống (Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, Sinh bài tập tùy chỉnh) nay đều có slide quy trình riêng, thay vì chỉ 2/4 như bản trước.

---

## Chi tiết từng slide

**Slide 1 - Trang bìa**

BÁO CÁO ĐỒ ÁN TỐT NGHIỆP, tên đề tài "Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo", GVHD TS. Nguyễn Bảo Ân, sinh viên Nguyễn Huỳnh Phú Vinh, lớp DA22TTC, MSSV 110122203.

**Slide 2 - Mục lục**

3 thẻ đánh số, giữ đúng kiểu 3 thẻ một hàng như bản cũ, không cần đổi layout:

- 01 Tổng quan: Đề tài, tiếng Việt và CEFR, nền tảng AI.
- 02 Thiết kế hệ thống: Kiến trúc, đối tượng sử dụng, 4 tính năng AI, CSDL, triển khai.
- 03 Kết quả và Demo: Kết quả, hướng phát triển, demo.

**Slide 3 - Tổng quan đề tài** (nhãn nhỏ "01 · TỔNG QUAN")

Học liệu số tiếng Việt hiện nay còn ít, phần lớn tập trung ở trình độ nhập môn, và học viên khó tìm được môi trường luyện giao tiếp thật ngoài lớp học. Đề tài xây dựng một nền tảng học tiếng Việt chia theo cấp độ từ A1 đến C2, có AI hỗ trợ bám sát ngữ cảnh học viên, kèm tính năng Hội thoại mô phỏng tái hiện các tình huống giao tiếp thật, gồm ứng dụng di động cho học viên và trang quản trị cho người soạn nội dung, cả hai dùng chung một backend. Công nghệ chính: Flutter cho di động, React cho quản trị, NestJS cho backend, PostgreSQL và Redis cho dữ liệu.


Nguồn: Mục 1.1-1.5. Toàn bộ Chương 1 dồn vào một slide duy nhất.

**Slide 4 - Đặc trưng tiếng Việt và khung CEFR** (nhãn nhỏ "01 · TỔNG QUAN")

Khung CEFR chia năng lực ngoại ngữ theo 6 bậc A1 đến C2, và Việt Nam có Thông tư 17/2015 quy định 6 bậc tương ứng để đối chiếu. Tiếng Việt có 6 thanh điệu, đổi thanh là đổi nghĩa (ví dụ chỉ với âm "ma" đã ra sáu từ khác nhau: ma, má, mà, mả, mã, mạ), cùng ba vùng phương ngữ Bắc, Trung, Nam khác nhau chủ yếu ở phát âm nên cùng một câu ba miền nghe không giống nhau; người học hay vấp ở bốn chỗ quen thuộc là thanh điệu, phụ âm cuối, loại từ và trật tự từ. Đây là cơ sở trực tiếp cho việc hệ thống chia học liệu thành 6 cấp độ và cho học viên chọn phương ngữ ngay từ đầu, đúng phần demo sẽ chiếu.

Hình ảnh: bản đồ 3 vùng phương ngữ, hoặc bảng 6 thanh gọn.

Nguồn: Mục 2.1.1-2.1.3. Slide này lý giải trực tiếp cho màn hình chọn cấp độ và chọn phương ngữ mà demo sẽ chiếu, nên không bỏ hẳn dù thời lượng ngắn.

**Slide 5 - AI Agent và vòng ReAct** (nhãn nhỏ "01 · TỔNG QUAN")

- Chatbot chỉ trả lời bằng dữ liệu đã học, không đọc được dữ liệu người dùng.
- Agent được cấp công cụ, tự chọn gọi công cụ khi cần dữ liệu thật.
- ReAct: Suy luận → Gọi công cụ → Quan sát kết quả → lặp cho tới khi trả lời.
- Là nền cho Trợ lý AI, biết tra đúng tiến độ của từng học viên.

Hình ảnh: sơ đồ vòng ReAct 3 khối nối tiếp, Suy luận → Gọi công cụ → Quan sát, chữ to.

Nguồn: Mục 2.6, 2.7. Cùng với Slide 4, đây là toàn bộ những gì giữ lại của Chương 2. Phần 4 logo công nghệ liệt kê riêng (Mục 2.2-2.5) vẫn bỏ khỏi slide chính vì đã nhắc tên công nghệ ở Slide 3.

**Slide 6 - Kiến trúc tổng thể hệ thống** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Mô hình client-server, 3 tầng: Client, Server, Data và dịch vụ ngoài.
- Client: mobile Flutter, admin React, đều có thư viện quản lý trạng thái và bộ nhớ đệm dữ liệu.
- Server: NestJS chạy trên Bun, các lớp trung gian lo xác thực, kiểm tra dữ liệu vào, gắn log.
- Data và dịch vụ ngoài: PostgreSQL, Redis, Google OAuth, nhà cung cấp AI.

Hình ảnh: Hình 3.1 (media/image6.png), sơ đồ kiến trúc toàn cảnh hệ thống, chiếm phần lớn slide.

Nguồn: Mục 3.2.2.

**Slide 7 - Tác nhân và ca sử dụng** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- 2 tác nhân: Học viên (ứng dụng di động), Quản trị viên (trang quản trị).
- 9 ca của Học viên: đăng ký/đăng nhập, đặt mục tiêu ngày, học bài, hỏi Trợ lý AI, làm bài tập, sinh bài tập tùy chỉnh, khám phá ảnh, lưu từ vựng cá nhân, hội thoại mô phỏng.
- 3 ca của Quản trị viên: soạn khóa học/chủ đề/bài học, soạn từ vựng/ngữ pháp/bài tập, quản lý tình huống mô phỏng.

Hình ảnh: Hình 3.2 (media/image7.jpeg), sơ đồ Use-case, đặt giữa hoặc lệch trái, chữ chú thích tối giản.

Nguồn: Mục 3.2.3, Bảng 3.1, Bảng 3.2.

**Slide 8 - Hệ thống Trợ lý AI** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Học viên gõ câu hỏi, hệ thống gắn kèm ngữ cảnh màn hình đang xem vào AI.
- Lượt AI đầu tiên tự quyết có gọi công cụ hay không, tối đa gọi liên tục 10 lượt.
- 9 công cụ chỉ đọc, tự khóa theo đúng người đang hỏi: Báo trạng thái, Hồ sơ học viên, Tiến độ học, Kết quả bài tập gần đây, Từ đã lưu, Tra từ vựng, Tra ngữ pháp, Tìm bài học, Chi tiết bài học.
- Nhiều công cụ chạy lần lượt, gộp hết kết quả rồi AI mới viết trả lời.
- Đang làm bài tập, AI nhìn trạng thái để chọn cách hướng dẫn: chưa trả lời thì gợi ý cách nghĩ, trả lời sai thì nhận xét góp ý, không nói thẳng đáp án.

Hình ảnh: Hình 3.3 (media/image8.jpeg), sơ đồ tuần tự một lượt hỏi Trợ lý AI, đặt bên phải hoặc bên dưới khối 9 thẻ.

Nguồn: Mục 3.2.4, cộng đọc trực tiếp mã nguồn phần xử lý Trợ lý AI ở backend.

**Slide 9 - Hệ thống Hội thoại mô phỏng** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Mỗi lượt học viên nói, hệ thống gọi AI đúng một lần, AI tự chọn nhân vật nào cần trả lời theo đúng thứ tự hội thoại.
- Ngay sau câu học viên, AI chấm lỗi chính tả và ngữ pháp ngay trong câu, ghi đoạn sai, đoạn sửa, loại lỗi và góp ý.
- Phiên kết thúc vì 1 trong 4 lý do, mỗi lý do có hướng dẫn chấm điểm riêng: hoàn thành trọn vẹn, sai quá nhiều liên tục, dùng lời không phù hợp, dùng lời xúc phạm.
- Điểm từng tiêu chí do AI chấm theo thang 0 đến 100, hệ thống đối chiếu lại tên tiêu chí rồi tính tổng theo trọng số.

Hình ảnh: Hình 3.4 (media/image9.jpeg), sơ đồ tuần tự Hội thoại mô phỏng.

Nguồn: Mục 3.2.4, cộng đọc trực tiếp mã nguồn phần xử lý Hội thoại mô phỏng ở backend.

**Slide 10 - Hệ thống Khám phá ảnh** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Học viên gửi 1 đến 5 ảnh kèm một câu hỏi, định dạng jpeg, png hoặc webp.
- Ảnh chỉ đưa cho AI đọc và không lưu vào hệ thống.
- Câu trả lời của AI đúng theo một khuôn định sẵn là buộc phải có danh sách từ vựng thấy được trong ảnh đi kèm và hiển thị ra giao diện cho học viên.
- Từ vựng không tự lưu, học viên bấm chọn từng từ để lưu.

Hình ảnh: sơ đồ luồng đơn giản tự vẽ, 3 khối nối tiếp: Ảnh và câu hỏi, AI đọc hiểu ảnh (Gemini), Câu trả lời và danh sách từ vựng.

Nguồn: đọc trực tiếp mã nguồn phần xử lý ảnh ở backend, không suy đoán. Đây là slide mới, báo cáo docx không có sơ đồ tuần tự riêng cho tính năng này.

**Slide 11 - Hệ thống Sinh bài tập tùy chỉnh** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Học viên chọn tối đa 30 câu, chọn 1 hoặc nhiều dạng trong 5 dạng: trắc nghiệm, điền vào chỗ trống, ghép cặp, sắp xếp, dịch câu (không có dạng nghe và nói), chọn ôn từ vựng, ngữ pháp hay cả hai, ghi thêm yêu cầu riêng không quá 500 chữ.
- Bắt buộc chọn đúng một phạm vi: một bài học, một chủ đề, hoặc cả một khóa học. Ôn theo chủ đề hoặc khóa học thì phải học xong ít nhất một phần trong đó.
- Hệ thống tự gom từ vựng, ngữ pháp và nội dung học viên đã hoàn thành trong phạm vi đó, AI chỉ được ra đề trong phần này.
- Mỗi câu AI soạn ra phải kiểm tra đủ đáp án và đúng định dạng trước khi lưu, sai thì tự tạo lại.

Hình ảnh: sơ đồ luồng tự vẽ, 4 khối nối tiếp: Học viên chọn phạm vi và yêu cầu, Hệ thống gom nội dung đã học, AI soạn câu hỏi, Lưu vào ngân hàng câu hỏi.

Nguồn: đọc trực tiếp mã nguồn phần sinh bài tập ở backend, không suy đoán. Slide mới, cùng lý do với Slide 10.

**Slide 12 - Thiết kế cơ sở dữ liệu** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- PostgreSQL, 27 bảng, gom theo 6 nhóm nghiệp vụ.
- 6 nhóm: Tài khoản và Xác thực, Học liệu, Luyện tập, Tiến trình và Mục tiêu, Tương tác AI, Hội thoại mô phỏng.
- Bảng nào cũng có id, thời điểm tạo, sửa và cờ xóa mềm.
- Cấu hình bài tập và kết quả AI lưu dạng JSON để thêm dạng câu hỏi mới mà không phải sửa lại cấu trúc bảng.

Hình ảnh: Hình 3.5 (media/image10.jpeg), ERD toàn bộ hệ thống, các bảng bôi màu theo 6 nhóm ở trên.

Nguồn: Mục 3.3, 3.3.1. Chi tiết 27 bảng để ở Phụ lục A, không đưa vào slide chính.

**Slide 13 - Triển khai hệ thống** (nhãn nhỏ "02 · THIẾT KẾ HỆ THỐNG")

- Cục bộ: Docker Compose gồm PostgreSQL 16, Redis 7, Backend.
- Production: Backend trên Hugging Face Spaces (Docker Space, HTTPS).
- CSDL chuyển sang CockroachDB Serverless, cache/queue dùng Aiven for Valkey.
- Admin build web tĩnh deloy lên Cloudflare Pages, di động biên dịch file .apk cho Android.


Hình ảnh: Hình 3.6 (media/image11.png), sơ đồ triển khai hạ tầng Production.

Nguồn: Mục 3.4.1, 3.4.2.

**Slide 14 - Kết quả và hướng phát triển** (nhãn nhỏ "03 · KẾT QUẢ VÀ DEMO")

Chia 2 cột, không dùng ảnh giao diện.

Cột trái, Kết quả đạt được:
- Hoàn thiện 3 thành phần: di động, quản trị, backend.
- Học liệu đầy đủ 6 cấp độ A1-C2.
- Tích hợp 4 tính năng AI: Trợ lý AI, Khám phá ảnh, Hội thoại mô phỏng, Sinh bài tập tùy chỉnh.

Cột phải, Hướng phát triển:
- Mở rộng học liệu B1-C2, thêm tình huống mô phỏng gắn đời sống Việt Nam.
- Đánh giá phát âm, tổng hợp lỗi sai, gợi ý lộ trình học theo điểm yếu.
- Học ngoại tuyến, biểu đồ thống kê cho quản trị.


Nguồn: Mục 5.1, 5.2.

**Slide 15 - Demo**

Giữ nguyên bản cũ, chỉ là trang chuyển tiếp. Đây là lúc nói sâu phần giao diện: đăng nhập, học bài, làm bài tập 7 dạng câu hỏi, Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh, Sinh bài tập tùy chỉnh, và các màn hình quản trị tương ứng.

**Slide 16 - Cảm ơn**

Giữ nguyên layout. Đổi "Cảm ơn Cô và các bạn đã lắng nghe" thành "Cảm ơn Thầy và các bạn đã lắng nghe", vì GVHD hiện tại là thầy Nguyễn Bảo Ân.

---

## Giải thích thêm cho Slide 8, 9, 10 và 11 (đọc từ mã nguồn thật, không suy đoán)

**Trợ lý AI:**
- Có 9 công cụ hỗ trợ đã đăng ký, toàn bộ chỉ đọc dữ liệu, không công cụ nào tự thêm, sửa hay xóa được gì. Các công cụ gồm: xem hồ sơ và tiến độ học, xem lịch sử làm bài và từ đã lưu, tra từ vựng, tra ngữ pháp, tìm bài học và xem chi tiết bài học.
- Mỗi công cụ luôn tự lấy đúng dữ liệu của người đang hỏi, không thể bị dẫn dắt để đọc dữ liệu người khác.
- AI chỉ được chọn dùng công cụ ở đúng lượt gọi mô hình đầu tiên của mỗi câu hỏi. Từ lượt thứ hai trở đi, AI chỉ đọc lại kết quả công cụ rồi viết câu trả lời, không đề xuất dùng thêm công cụ mới nữa. Giới hạn 10 lượt gọi vì vậy là một mốc dừng an toàn, hơn là một quy trình suy luận nhiều bước thật sự.
- Nếu một câu hỏi cần dùng nhiều công cụ, hệ thống chạy lần lượt từng công cụ một, không chạy song song, rồi gộp hết kết quả để AI đọc trong một lượt.
- Câu trả lời hiện dần từng chữ ngay khi AI vừa sinh ra, kèm thông báo riêng mỗi khi AI bắt đầu dùng một công cụ và công cụ đó chạy thành công hay thất bại.
- Ngữ cảnh màn hình học viên đang xem được đưa thẳng vào lời nhắc mở đầu mỗi cuộc trò chuyện. Nếu học viên đang làm bài tập, AI chỉ được gợi ý cách suy nghĩ, không được nói thẳng đáp án.
- Toàn bộ lịch sử trò chuyện được gửi lại cho mô hình ở mọi câu hỏi, chưa giới hạn số tin nhắn cũ, và hệ thống cũng chưa đặt thời gian chờ tối đa cho một lần gọi mô hình.
- Bấm nút Dừng hủy thẳng yêu cầu đang gửi tới AI ở tầng mạng, không chỉ ngừng hiển thị phía học viên. Phần chữ đã kịp trả lời được giữ lại và đánh dấu là câu trả lời bị ngắt giữa chừng.
- Mặc định Trợ lý AI dùng chung một mô hình Gemini của Google với Khám phá ảnh và Sinh bài tập tùy chỉnh. Có thể đổi sang mô hình khác, nhưng mô hình thay thế bắt buộc phải hỗ trợ gọi công cụ thì Trợ lý AI mới hoạt động đúng.

**Hội thoại mô phỏng:**
- Khi học viên mở một phiên mới, hệ thống chưa gọi AI ngay. Nếu tình huống có sẵn câu mở đầu do người soạn viết trước, hệ thống hiển thị luôn câu đó, AI chỉ thật sự vào việc từ câu đầu tiên học viên gõ.
- Lời nhắc gửi cho AI mỗi lượt được ghép từ: kịch bản tình huống, mô tả toàn bộ nhân vật kèm tính cách và phong cách nói chuyện, nhân vật học viên đang đóng, tiêu chí chấm điểm kèm trọng số phần trăm, và hồ sơ học viên gồm ngôn ngữ mẹ đẻ, trình độ, phương ngữ quen dùng.
- Nếu người soạn tình huống chèn sẵn các chỗ trống kiểu tên hay tính cách nhân vật ngay trong kịch bản, hệ thống tự thay đúng thông tin nhân vật vào những chỗ trống đó trước khi gửi cho AI.
- Mỗi lượt học viên nói, hệ thống chỉ gọi AI đúng một lần. AI tự chọn nhân vật nào lên tiếng và trả lời hết trong cùng một lượt, theo đúng thứ tự hội thoại, không tách thành nhiều lần gọi AI cho từng nhân vật.
- Lượt kế tiếp gần như luôn được hệ thống đưa về đúng phía học viên, kể cả khi AI gợi ý khác. Hệ thống chỉ thật sự phân biệt lượt của học viên và lượt của AI nói chung, còn nhiều nhân vật AI ai nói trước ai nói sau là do AI tự quyết định trong nội dung trả lời.
- Ngay sau mỗi câu học viên gõ, AI chấm lỗi chính tả và ngữ pháp: đoạn sai, đoạn sửa, loại lỗi, mức độ nặng nhẹ, vị trí lỗi trong câu. Toàn bộ nhận xét này lưu thẳng vào chính tin nhắn đó của học viên.
- Khi kết thúc phiên, AI chấm từng tiêu chí đã khai báo theo thang điểm 0 đến 100 kèm nhận xét. Hệ thống đối chiếu lại đúng tên tiêu chí trước khi tự tính điểm tổng theo trọng số, tránh trường hợp AI đặt sai tên tiêu chí. Kết quả lưu ngay vào chính phiên đó, không tách ra một nơi lưu riêng.
- Phiên kết thúc vì một trong bốn lý do: hoàn thành trọn vẹn, học viên sai quá nhiều liên tục, dùng lời không phù hợp, hoặc dùng lời xúc phạm. Mỗi lý do có hướng dẫn chấm điểm và viết nhận xét riêng cho AI.
- Giới hạn số lượt tối đa của một tình huống là giới hạn mềm: hệ thống chỉ nhắc AI nên kết thúc khi chạm giới hạn, còn việc kết thúc thật sự vẫn do AI quyết định.
- Mỗi lượt AI trả lời trọn vẹn một lần, không hiện dần từng chữ như Trợ lý AI, giống cách Khám phá ảnh hoạt động. Mô hình AI dùng cho tính năng này được cấu hình tách riêng, hiện đang khác với mô hình dùng cho ba tính năng AI còn lại.

**Khám phá ảnh:**
- Học viên gửi tối thiểu 1 và tối đa 5 ảnh mỗi lần, định dạng ảnh phổ biến như jpeg, png, webp. Chỉ tài khoản đã đăng nhập và có quyền dùng tính năng AI mới gửi được.
- Ảnh chỉ dùng để phân tích ngay lúc đó rồi bỏ đi, hệ thống không lưu file ảnh lại, cũng không chỉnh sửa hay nén ảnh trước khi đưa cho AI xem.
- Mô hình AI mặc định là Gemini của Google, có thể đổi sang mô hình khác miễn mô hình đó đọc được ảnh, ví dụ GPT-4o. Ảnh và câu hỏi gửi cùng lúc, AI trả lời trọn vẹn một lần chứ không hiện dần từng chữ.
- Câu trả lời của AI phải theo đúng một khuôn dữ liệu định sẵn, gồm phần giải thích và danh sách từ vựng. Nếu AI trả sai khuôn, hệ thống tự yêu cầu trả lời lại cho đúng.
- Danh sách từ vựng không tự lưu vào hồ sơ học viên. Muốn giữ lại, học viên phải bấm lưu từng từ, lúc đó hệ thống mới ghi vào Yêu sách.
- Số lượt dùng tính năng này tính chung vào giới hạn của toàn hệ thống, không có giới hạn riêng.

**Sinh bài tập tùy chỉnh:**
- Học viên chọn số câu, tối đa 30 câu, chọn dạng câu hỏi (không cho chọn dạng nghe và dạng nói ở tính năng này), chọn ôn từ vựng, ngữ pháp hay cả hai, và có thể ghi thêm một yêu cầu riêng không quá 500 chữ.
- Bắt buộc chọn đúng một phạm vi ôn tập: một bài học, một chủ đề, hoặc cả một khóa học, không được chọn nhiều hơn một lúc. Nếu ôn theo chủ đề hoặc khóa học, học viên phải học xong ít nhất một phần trong đó trước.
- Hệ thống tự gom từ vựng, ngữ pháp và nội dung bài trong đúng phạm vi đã hoàn thành để làm căn cứ ra đề, tránh hỏi phần học viên chưa học tới.
- Quá trình soạn đề chạy ngay khi học viên bấm tạo, không phải xếp hàng chờ. Màn hình báo đang tạo, xong thì chuyển sang sẵn sàng làm bài, lỗi thì báo thất bại và tự xóa phần dở dang.
- Mỗi câu hỏi AI soạn ra được kiểm tra đủ đáp án và đúng định dạng trước khi lưu lại.
- Muốn đổi bộ đề, học viên bấm tạo lại: hệ thống soạn xong bộ mới rồi mới thay cho bộ cũ, không làm mất bộ đang dùng giữa chừng.
- Dùng chung mô hình Gemini như các tính năng AI khác trong hệ thống.

---

## Phụ lục, dùng khi hội đồng hỏi thêm

Không tính vào 16 slide chính, không thuyết trình mặc định, chỉ mở khi có câu hỏi.

**Phụ lục A - Chi tiết thực thể CSDL tiêu biểu.** Bảng 3.3 (users), Bảng 3.13 (exercises), Bảng 3.21 (conversations), Bảng 3.26 (scenarios).

**Phụ lục B - Nguồn tham khảo nền tảng.** Thông tư 17/2015/TT-BGDĐT, CEFR (Council of Europe, 2001), ReAct (Yao và cộng sự, 2023), CLIP (Radford và cộng sự, 2021), ViT (Dosovitskiy và cộng sự, 2020).

**Phụ lục C - Lưới ảnh giao diện tổng hợp.** Một slide duy nhất ghép nhỏ khoảng 8-10 ảnh tiêu biểu (mobile: trang chủ, bài học, Trợ lý AI, Hội thoại mô phỏng, Khám phá ảnh; admin: danh sách khóa học, ngân hàng câu hỏi, cấu hình mô phỏng). Dùng khi hội đồng muốn xem lại nhanh một màn hình cụ thể mà không cần mở lại ứng dụng demo. Nguồn ảnh: các Hình 4.1.x và 4.2.x trong docx.

**Phụ lục D - Giải thích thêm về cả 4 tính năng AI.** Toàn bộ nội dung ở mục "Giải thích thêm cho Slide 8, 9, 10 và 11" phía trên, dùng khi hội đồng hỏi sâu về cách Trợ lý AI dùng công cụ, cách Hội thoại mô phỏng chấm điểm, cách kiểm tra dữ liệu đầu ra, hoặc cách tạo lại bài tập.

## Việc cần chuẩn bị

- 6 sơ đồ Hình 3.1 đến 3.6 lấy trực tiếp từ file docx (giải nén hoặc mở file rồi lưu ảnh ra).
- 2 sơ đồ luồng tự vẽ cho Slide 10 và 11 (Khám phá ảnh, Sinh bài tập tùy chỉnh). Báo cáo docx không có sẵn, cần vẽ mới dạng khối nối tiếp đơn giản, giữ cùng phong cách với Hình 3.3/3.4.
- Khung điện thoại cho Slide 1 và Phụ lục C.
- Tập nói thử có bấm giờ theo cột "Thời lượng" ở bảng cấu trúc. 9 phút 30 giây nội dung chỉ còn dư 30 giây so với mốc 10 phút, cần canh nhịp nói sát, nhất là ở 8 slide Chương 3.
