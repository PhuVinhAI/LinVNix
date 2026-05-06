# ĐỀ CƯƠNG CHI TIẾT

## ĐỒ ÁN TỐT NGHIỆP NGÀNH CÔNG NGHỆ THÔNG TIN

**TRƯỜNG KỸ THUẬT VÀ CÔNG NGHỆ**  
**KHOA CÔNG NGHỆ THÔNG TIN**

**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**  
**Độc lập – Tự do – Hạnh phúc**

**Họ tên sinh viên:** Nguyễn Huỳnh Phú Vinh  
**MSSV:** 110122203  
**Lớp:** DA22TTC  
**Khóa:** 22  
**Tên đề tài:** Ứng dụng hỗ trợ dạy học tiếng Việt với trí tuệ nhân tạo.

## 1. Mục tiêu của đề tài

Xây dựng ứng dụng di động hỗ trợ người nước ngoài học tiếng Việt tích hợp trí tuệ nhân tạo đa phương thức, giúp người học rèn luyện từ vựng, ngữ pháp, phát âm và giao tiếp thông qua các tính năng sinh bài tập, nhận diện hình ảnh và phân tích giọng nói.

## 2. Nội dung thực hiện

### 2.1. Phân tích hệ thống

- Tìm hiểu nhu cầu thực tế học tiếng Việt của người nước ngoài để xác định các khó khăn phổ biến về thanh điệu, từ vựng, ngữ pháp và xây dựng cấu trúc bài học hợp lý;
- Nghiên cứu và phân tích các ứng dụng hỗ trợ học tiếng Việt hoặc học ngoại ngữ có tích hợp trí tuệ nhân tạo để xác định yêu cầu chức năng cho hệ thống;
- Nghiên cứu mô hình trí tuệ nhân tạo đa phương thức để lựa chọn hướng tích hợp xử lý văn bản, hình ảnh và âm thanh phù hợp.

### 2.2. Thiết kế hệ thống

- Thiết kế cấu trúc cơ sở dữ liệu quan hệ bằng PostgreSQL;
- Thiết kế kiến trúc tổng thể theo mô hình client-server và phác thảo giao diện người dùng trực quan theo nguyên tắc HCI;
- Phát triển hệ thống máy chủ;
- Xây dựng hệ thống máy chủ bằng NestJS, đảm nhận vai trò lưu trữ thông tin người dùng, quản lý tiến trình học tập và làm trạm kết nối với API trí tuệ nhân tạo đa phương thức.

### 2.3. Phát triển logic trí tuệ nhân tạo tại tầng máy chủ

- Xây dựng logic xử lý tương tác văn bản để tự động sinh bài tập ngữ pháp, bài tập trắc nghiệm và hỗ trợ sửa lỗi câu văn cho người học;
- Xây dựng logic xử lý tương tác hình ảnh, cho phép hệ thống nhận diện đồ vật qua máy ảnh để truy xuất từ vựng tiếng Việt trực quan;
- Xây dựng logic xử lý tương tác âm thanh theo thời gian thực để phân tích giọng nói, chấm điểm phát âm và hỗ trợ người học luyện hệ thống thanh điệu tiếng Việt;
- Tổ chức luồng kết nối giữa máy chủ và mô hình trí tuệ nhân tạo đa phương thức để cá nhân hóa nội dung học tập.

### 2.4. Phát triển giao diện ứng dụng di động

- Phát triển giao diện ứng dụng bằng Flutter, tối ưu trải nghiệm người dùng trên đa thiết bị;
- Xây dựng các màn hình chính như đăng nhập, trang chủ, danh sách bài học, tiến trình học tập và giao diện luyện nghe, nói, đọc, viết;
- Khai thác các tiện ích phần cứng của thiết bị như máy ảnh và micro thu âm để triển khai các tính năng nhận diện hình ảnh và luyện phát âm;
- Kết nối giao diện ứng dụng với máy chủ NestJS để đồng bộ dữ liệu bài học, kết quả luyện tập và phản hồi từ hệ thống AI.

### 2.5. Kiểm thử và đánh giá

- Tiến hành kiểm thử chức năng ở cấp độ đơn vị và tích hợp để đảm bảo hệ thống vận hành ổn định;
- Kiểm thử hiệu năng phần mềm trên thiết bị di động thực tế, đặc biệt với các tác vụ xử lý văn bản, hình ảnh và âm thanh;
- Đánh giá độ chính xác của mô hình AI trong việc sinh bài tập, nhận diện hình ảnh và phân tích phát âm tiếng Việt;
- Tối ưu hóa luồng truyền tải dữ liệu giữa ứng dụng, máy chủ và mô hình trí tuệ nhân tạo đa phương thức.

## 3. Phương pháp thực hiện

- **Phương pháp nghiên cứu lý thuyết:** Tìm hiểu tài liệu học thuật và tài liệu trực tuyến về phương pháp giảng dạy tiếng Việt cho người nước ngoài, các lỗi ngôn ngữ phổ biến khi học tiếng Việt, hệ thống thanh điệu tiếng Việt, mô hình trí tuệ nhân tạo đa phương thức và các công nghệ được sử dụng trong đề tài như Flutter, NestJS, PostgreSQL.

- **Phương pháp thực nghiệm:** Phân tích và thiết kế hệ thống bằng các biểu đồ mô hình hóa thống nhất, phát triển ứng dụng di động bằng Flutter, xây dựng máy chủ bằng NestJS, quản lý dữ liệu bằng PostgreSQL, tích hợp trí tuệ nhân tạo để xử lý văn bản, hình ảnh và âm thanh, sau đó triển khai kiểm thử trên thiết bị thực tế để đánh giá tốc độ phản hồi, độ ổn định và độ chính xác của hệ thống.

## 4. Bố cục đề tài

Quyển báo cáo bố cục đề tài gồm các nội dung sau:

- Chương 1: Tổng quan
- Chương 2: Nghiên cứu lý thuyết
- Chương 3: Hiện thực hóa nghiên cứu
- Chương 4: Kết quả nghiên cứu
- Chương 5: Kết luận và hướng phát triển

## 5. Tài liệu tham khảo

[1] N. V. Huệ, T. T. M. Giới, N. T. N. Hân và T. N. Minh, *Giáo trình tiếng Việt cho người nước ngoài tập 1*. Thành phố Hồ Chí Minh: Nhà xuất bản Đại học Quốc gia Thành phố Hồ Chí Minh, 2019.

[2] L. T. Hiệp, *Tiếng Việt cho người nước ngoài chương trình trung cấp*. Hà Nội: Nhà xuất bản Thế Giới, 2022.

[3] N. T. Nam, "Lỗi sử dụng từ loại trong tiếng Việt của người nước ngoài," *Kỷ yếu hội thảo khoa học Giảng dạy Tiếng Việt như một ngoại ngữ*, tr. 15-25, 2008.

[4] N. T. Nam, "Vấn đề dạy ngữ pháp trong giáo trình dạy tiếng Việt cho người nước ngoài," *Tạp chí Ngôn ngữ*, số 6, tr. 10-18, 2010.

[5] B. T. H. Nga, "Văn hóa trong giảng dạy ngoại ngữ," *Kỷ yếu hội thảo khoa học Trường Đại học Ngoại ngữ, Đại học Quốc gia Hà Nội*, 2012.

[6] T. Bailey và A. Biessek, *Flutter for Beginners*, 3rd ed. Birmingham: Packt Publishing, 2023.

[7] R. Payne, *Beginning App Development with Flutter*. New York: Apress, 2022.

[8] K. Mysliwiec, "NestJS framework documentation," NestJS, 2024. [Online]. Available: https://docs.nestjs.com.

[9] D. V. Nguyen, N. L. Quang, T. T. Hien, N. N. Huyen, T. T. Huong và P. N. Nam, "Modeling user quality of experience in adaptive point cloud video streaming," *International Symposium on Multimedia*, tr. 49-54, 2024.

[10] J. Borenstein và A. Howard, "Emerging challenges in AI and the need for AI ethics education," *AI and Ethics*, vol. 1, tr. 61-65, 2021.

## 6. Kế hoạch thực hiện đề tài

| Tuần | Từ ngày đến ngày | Công việc thực hiện | Ghi chú |
|---|---|---|---|
| 1 | 20/04/2026 đến 26/04/2026 | - Nghiên cứu cơ sở lý thuyết về dạy tiếng Việt cho người nước ngoài, các lỗi ngôn ngữ thường gặp và đặc điểm thanh điệu tiếng Việt;<br>- Nghiên cứu tổng quan về mô hình trí tuệ nhân tạo đa phương thức và các công nghệ sử dụng trong đề tài;<br>- Viết đề cương chi tiết. | |
| 2 | 27/04/2026 đến 03/05/2026 | - Phân tích nhu cầu người học và các nghiệp vụ chính của hệ thống;<br>- Xác định yêu cầu chức năng, phi chức năng;<br>- Thiết kế mô hình dữ liệu mức quan niệm (ERD), mô hình dữ liệu mức logic bằng PostgreSQL và phác thảo giao diện người dùng. | |
| 3 | 04/05/2026 đến 10/05/2026 | - Thiết lập cơ sở dữ liệu PostgreSQL;<br>- Khởi tạo dự án Backend bằng NestJS;<br>- Lập trình các API cốt lõi để quản lý tài khoản người dùng và nội dung khóa học. | |
| 4 | 11/05/2026 đến 17/05/2026 | - Khởi tạo dự án ứng dụng di động bằng Flutter;<br>- Xây dựng giao diện đăng ký, đăng nhập và màn hình trang chủ;<br>- Xây dựng cấu trúc quản lý trạng thái;<br>- Viết dự thảo Chương 1. | |
| 5 | 18/05/2026 đến 24/05/2026 | - Lập trình tính năng hiển thị danh sách bài học từ vựng và ngữ pháp trên ứng dụng di động;<br>- Đồng bộ dữ liệu bài học với máy chủ;<br>- Viết dự thảo Chương 2. | |
| 6 | 25/05/2026 đến 31/05/2026 | - Tích hợp năng lực xử lý văn bản của mô hình trí tuệ nhân tạo đa phương thức;<br>- Xây dựng chức năng tự động tạo bài tập trắc nghiệm và sửa lỗi ngữ pháp cho người học;<br>- Viết dự thảo Chương 3. | |
| 7 | 01/06/2026 đến 07/06/2026 | - Tích hợp năng lực thị giác máy tính của mô hình trí tuệ nhân tạo đa phương thức;<br>- Lập trình chức năng chụp ảnh đồ vật thực tế để tự động truy xuất từ vựng;<br>- Viết dự thảo Chương 4. | |
| 8 | 08/06/2026 đến 14/06/2026 | - Tích hợp năng lực xử lý âm thanh trực tiếp của mô hình trí tuệ nhân tạo đa phương thức;<br>- Xây dựng chức năng phân tích giọng đọc và luyện phát âm;<br>- Viết dự thảo Chương 5. | |
| 9 | 15/06/2026 đến 21/06/2026 | - Kiểm thử tổng thể phần mềm nhằm phát hiện và khắc phục lỗi mã nguồn;<br>- Tối ưu hiệu năng, giao diện và luồng truyền tải dữ liệu. | |
| 10 | 22/06/2026 đến 28/06/2026 | - Hoàn thiện báo cáo khóa luận. | |

---

*Vĩnh Long, ngày tháng năm 2026*

**GIẢNG VIÊN HƯỚNG DẪN**  
Nguyễn Bảo Ân

**SINH VIÊN THỰC HIỆN**  
Nguyễn Huỳnh Phú Vinh
