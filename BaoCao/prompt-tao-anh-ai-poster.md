# Prompt tạo ảnh AI cho poster

Prompt viết bằng tiếng Anh vẫn là lựa chọn an toàn cho đa số công cụ (Midjourney, SDXL, Adobe Firefly). Riêng GPT Image 2 của OpenAI (phát hành 21/4/2026, tên hiển thị trong ChatGPT là Images 2.0) đọc hiểu câu văn tự nhiên tốt, không cần xếp chuỗi từ khóa như trước.

Cập nhật so với bản trước: giới hạn "AI vẽ chữ tệ" không còn đúng với GPT Image 2. Model này đạt khoảng 99% độ chính xác ở cấp ký tự cho chữ Latin cùng nhiều bảng chữ khác (Nhật, Hàn, Hindi, Bengal, Ả Rập), nhờ cơ chế suy luận trước khi vẽ mà OpenAI gọi là "thinking mode". Tiếng Việt dùng bảng chữ Latin nên nhiều khả năng ăn theo mức cải thiện này, dù chưa thấy số liệu kiểm tra riêng cho dấu thanh tiếng Việt, nên vẫn nên tạo thử một câu có dấu trước khi tin dùng cho phần chữ quan trọng.

Vì vậy file này có 2 cách. Cách A dùng prompt từ khóa kiểu cũ, ảnh trừu tượng không chữ, chạy tốt trên mọi công cụ kể cả các bản cũ hơn. Cách B dùng câu văn tự nhiên có chữ Việt thật, cần GPT Image 2 hoặc model tương đương ra sau nó. Lưới ảnh giao diện chính ở Cột 3 của poster vẫn nên ưu tiên ảnh chụp màn hình thật, vì đó là phần hội đồng sẽ đối chiếu trực tiếp với demo, còn các minh họa phụ khác giờ có thể dùng Cách B mà không còn lo chữ bị méo.

Nguồn: [OpenAI, Introducing ChatGPT Images 2.0](https://openai.com/index/introducing-chatgpt-images-2-0/), [TechCrunch, 21/4/2026](https://techcrunch.com/2026/04/21/chatgpts-new-images-2-0-model-is-surprisingly-good-at-generating-text/), [MacRumors, 22/4/2026](https://www.macrumors.com/2026/04/22/openai-chatgpt-images-2-0/).

## Cách A: prompt từ khóa, ảnh trừu tượng không chữ

Dùng được trên mọi công cụ, kể cả các bản cũ hơn GPT Image 2. Toàn bộ mục 1 đến 9 bên dưới thuộc cách này.

## Khối phong cách dùng chung

Dán đoạn này vào cuối mọi prompt bên dưới để giữ đồng bộ hình:

```
Flat 2D vector illustration style, minimalist modern SaaS/EdTech product illustration similar to Notion or Linear marketing graphics. Solid flat color fills only, no gradients, no drop shadows, no 3D rendering, no photorealism. Thin 1.5px outlines. Generously rounded corners. Color palette strictly limited to indigo #4F46E5, violet #7C3AED, cyan #0891B2, slate-900 #0F172A, slate-600 #475569, slate-200 #E2E8F0, white #FFFFFF, off-white background #F8FAFC. Clean geometric shapes, generous white space, crisp vector edges, high resolution for large print.
```

## Cụm nên tránh, dán vào ô negative prompt hoặc thêm "avoid:" cuối câu

```
readable text, real words, garbled text, distorted letters, photorealistic, 3D render, drop shadow, gradient background, human hands, human faces, stock photo look, conical hat, ao dai dress, lotus flower, bronze drum, generic Vietnam tourism imagery, watermark, logo, clutter
```

---

## 1. Khung chính, hero visual cho header poster

```
A smartphone and a laptop floating together at a slight 3/4 angle, both displaying an abstract flat-design chat interface for a language-learning app: colored rounded-rectangle placeholders representing chat bubbles and buttons, one small AI sparkle icon glowing near the phone screen, a subtle circular progress ring overlapping the two devices.
[dán Khối phong cách dùng chung]
Wide landscape composition, empty space on the left third of the frame for a title to be placed later.
avoid: [dán Cụm nên tránh]
```

## 2. Bộ 4 icon tính năng AI

```
A set of 4 flat 2D icon illustrations in a row, each inside a rounded square badge with a different flat color (indigo, violet, cyan, violet): badge 1 an AI chat assistant, a speech bubble with a small sparkle; badge 2 image vocabulary discovery, a camera with a small magnifying glass; badge 3 roleplay conversation practice, two overlapping speech bubbles with simple dot faces; badge 4 custom exercise generation, a pencil with a small sparkle over a checklist.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

## 3. Minh họa UI di động trừu tượng, theo từng nhóm màn hình

Dùng một prompt khung sau, thay phần `{MÔ TẢ MÀN HÌNH}` theo bảng bên dưới. Chỉ dùng cho vị trí trang trí, không thay được ảnh chụp thật ở Cột 3.

```
A flat 2D illustration of a smartphone screen mockup for a language-learning app, showing {MÔ TẢ MÀN HÌNH}. All text shown as abstract rounded-rectangle and line placeholders, no real readable words.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

| Nhóm màn hình | Thay vào {MÔ TẢ MÀN HÌNH} |
|---|---|
| Đăng nhập và thiết lập ban đầu | a login form with two input fields and a button, below it a grid of 6 rounded level-selection cards |
| Trang chủ và bài học | a home screen with a greeting header, a continue-learning card, and a bottom navigation bar with 4 icons plus a floating camera button in the middle |
| Trợ lý AI | a full-screen chat interface with message bubbles alternating left and right, a text input bar at the bottom, one bubble glowing softly |
| Hội thoại mô phỏng | a roleplay chat interface with two character avatars at the top and a short translated subtitle line under one message bubble |
| Khám phá ảnh | a screen with a large photo placeholder area on top and a list of small vocabulary word cards below it |

## 4. Minh họa UI quản trị trừu tượng, theo từng nhóm màn hình

```
A flat 2D illustration of a laptop screen mockup showing an admin dashboard web interface, {MÔ TẢ MÀN HÌNH}. Left sidebar navigation with 4 to 5 icon items, abstract placeholder text and UI elements only, no real readable words.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

| Nhóm màn hình | Thay vào {MÔ TẢ MÀN HÌNH} |
|---|---|
| Quản lý khóa học | a grid of course cards with colored level tags and a search bar on top |
| Ngân hàng câu hỏi | a form layout with multiple-choice options, radio buttons, and a right-side preview panel |
| Cấu hình hội thoại mô phỏng | a two-column layout with a character list on the right and a system-prompt text area on the left |

## 5. Sơ đồ kiến trúc hệ thống, vẽ lại phong cách flat

```
A flat 2D system architecture diagram with 3 horizontal layers stacked vertically: top layer with a smartphone icon and a browser-window icon (client layer), middle layer with a server icon (backend layer), bottom layer with a database cylinder icon and a small cloud icon (data and external services layer). Simple rounded rectangle boxes connected by thin arrows flowing top to bottom.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

## 6. Vòng lặp Agent dạng cung tròn khép kín

```
A flat 2D circular loop diagram with exactly 3 nodes placed around a circle, connected by curved arrows flowing clockwise: node 1 with a small brain icon for "reasoning", node 2 with a small wrench icon for "tool call", node 3 with a small eye icon for "observation". Center of the circle left empty.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

## 7. Bản đồ 3 vùng phương ngữ Việt Nam cách điệu

```
A flat 2D simplified silhouette map of Vietnam divided into 3 horizontal regions by soft flat color blocks: north region indigo #4F46E5, central region violet #7C3AED, south region cyan #0891B2. Minimal border lines, no text labels, no city markers, clean geometric coastline.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

## 8. Dải bậc thang 6 cấp độ CEFR

```
A flat 2D side-view illustration of 6 ascending staircase steps, each step slightly taller than the previous one, each step a flat rounded block shifting gradually from indigo to cyan, a small flag icon standing on the top step.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

## 9. Vòng tròn điểm số dùng cho số liệu nổi bật

```
A flat 2D circular progress ring icon, thick rounded ring stroke in indigo #4F46E5 over a very light gray track, empty center reserved for a number to be added later in design software.
[dán Khối phong cách dùng chung]
avoid: [dán Cụm nên tránh]
```

---

## Cách B: prompt câu văn tự nhiên, có chữ Việt thật (GPT Image 2 trở lên)

Viết như mô tả cho người, đặt đúng chữ cần hiện trong dấu ngoặc kép, nói rõ chữ nằm ở đâu, và luôn thêm câu dặn "render the text exactly as written, no extra words, no duplicate text" để model không tự bịa thêm chữ khác. Ba ví dụ dưới đây theo đúng nội dung thật của app, có thể áp dụng cách viết này cho các màn hình khác trong bảng ở mục 3 và 4.

**Khung chính, có chữ thật:**

```
A flat 2D illustration showing a smartphone and a laptop side by side. The phone screen shows a chat interface with the header text "Trợ lý AI" at the top and one message bubble below it. The laptop screen shows an admin dashboard with a sidebar item labeled "Quản lý khóa học". Render the Vietnamese text exactly as written, with correct diacritics, no extra words, no duplicate text.
Flat, minimal, shadow-free design in indigo #4F46E5, violet #7C3AED, cyan #0891B2, and white, rounded corners, clean geometric shapes, no gradients.
```

**Trang chủ di động, có chữ thật:**

```
A flat 2D mobile app screen mockup for a Vietnamese language-learning app. A greeting header at the top. Below it, a card with the text "Tiếp tục học" and a button labeled "Continue". A bottom navigation bar with four labels in order: "Home", "Courses", "Chat", "Profile", with a floating camera button in the middle. Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, indigo #4F46E5 accent, white background, rounded corners, no shadows, no gradients.
```

**Đăng nhập và thiết lập ban đầu, có chữ thật:**

```
A flat 2D mobile app login screen mockup. Two input fields labeled "Email" and "Mật khẩu", a button labeled "Đăng nhập" below them, and a smaller text link "Quên mật khẩu?" underneath. Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, indigo #4F46E5 accent, white background, rounded corners, no shadows, no gradients.
```

**Trợ lý AI, có chữ thật:**

```
A flat 2D mobile app full-screen chat interface. Header text "Trợ lý AI" at the top. A chat bubble on the right with the text "Từ này nghĩa là gì?", and a chat bubble on the left with the text "Đây là câu hỏi hay, để mình giải thích." A text input bar at the bottom with placeholder text "Nhập câu hỏi...". Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, indigo #4F46E5 accent, white background, rounded corners, no shadows, no gradients.
```

**Hội thoại mô phỏng, có chữ thật:**

```
A flat 2D mobile app roleplay chat screen. Header showing a character name "Cô bán rau". A chat bubble on the left with the Vietnamese text "Em muốn mua gì?" and a smaller translated line below it in gray "What would you like to buy?", and a chat bubble on the right with the text "Cho em một kí cà chua." Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, violet #7C3AED accent, white background, rounded corners, no shadows, no gradients.
```

**Khám phá ảnh, có chữ thật:**

```
A flat 2D mobile app screen with a photo placeholder area at the top showing a simple flat illustration of a market stall, and below it a header text "Từ vựng tìm được" followed by a small vocabulary card containing the Vietnamese word "cà chua" and its English meaning "tomato". Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, cyan #0891B2 accent, white background, rounded corners, no shadows, no gradients.
```

**Quản lý khóa học (admin), có chữ thật:**

```
A flat 2D admin dashboard screen mockup, laptop view. A left sidebar with a navigation item labeled "Khóa học". Main content area with a page title "Danh sách khóa học" and a button labeled "Thêm khóa học" in the top right. Below, a grid of course cards, each with a small colored level tag such as "A1" or "B1". Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, violet #7C3AED accent, white background, rounded corners, no shadows, no gradients.
```

**Ngân hàng câu hỏi (admin), có chữ thật:**

```
A flat 2D admin dashboard screen mockup, laptop view. Page title "Ngân hàng câu hỏi" at the top with a button labeled "Thêm câu hỏi" on the right. Below, a multiple-choice question form with the question text "Chọn từ đúng: Một ___ chó" and four answer options "con", "cái", "chiếc", "quyển", one marked correct with a small checkmark. Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, violet #7C3AED accent, white background, rounded corners, no shadows, no gradients.
```

**Cấu hình hội thoại mô phỏng (admin), có chữ thật:**

```
A flat 2D admin dashboard screen mockup, laptop view, two-column layout. Left column has a text area labeled "Lời nhắc hệ thống" with placeholder text containing a variable tag "{{cấp_độ_học_viên}}". Right column shows a character list with one card labeled "Cô bán rau" and a small tag "Có thể chọn nhập vai". Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, cyan #0891B2 accent, white background, rounded corners, no shadows, no gradients.
```

**Bộ 4 icon tính năng AI, có chữ thật:**

```
A set of 4 flat 2D icon illustrations in a row, each inside a rounded square badge with a different flat color (indigo, violet, cyan, violet), with a short Vietnamese caption below each badge. Badge 1: a speech bubble with a small sparkle, caption "Trợ lý AI". Badge 2: a camera with a small magnifying glass, caption "Khám phá ảnh". Badge 3: two overlapping speech bubbles with simple dot faces, caption "Hội thoại mô phỏng". Badge 4: a pencil with a small sparkle over a checklist, caption "Sinh bài tập". Render all captions exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, no shadows, no gradients, rounded corners.
```

**Kiến trúc hệ thống, có chữ thật:**

```
A flat 2D system architecture diagram with 3 horizontal layers stacked vertically, each layer a labeled rounded rectangle box. Top layer labeled "Ứng dụng di động và Trang quản trị" with a smartphone icon and a browser-window icon. Middle layer labeled "Backend NestJS" with a server icon. Bottom layer labeled "PostgreSQL và Redis" with a database cylinder icon and a small cloud icon. Thin arrows flowing top to bottom between layers. Render all text exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, indigo #4F46E5, violet #7C3AED, cyan #0891B2, white background, no shadows, no gradients, rounded corners.
```

**Vòng lặp Agent, có chữ thật:**

```
A flat 2D circular loop diagram with exactly 3 labeled nodes placed around a circle, connected by curved arrows flowing clockwise: node 1 with a small brain icon and the label "Suy luận", node 2 with a small wrench icon and the label "Gọi công cụ", node 3 with a small eye icon and the label "Quan sát". Render all labels exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, indigo #4F46E5 accent, white background, no shadows, no gradients, rounded corners.
```

**Bản đồ 3 vùng phương ngữ, có chữ thật:**

```
A flat 2D simplified silhouette map of Vietnam divided into 3 horizontal regions by soft flat color blocks, each region with a small centered text label: north region indigo #4F46E5 labeled "Bắc", central region violet #7C3AED labeled "Trung", south region cyan #0891B2 labeled "Nam". Render all labels exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, no shadows, no gradients, clean geometric coastline.
```

**Dải bậc thang 6 cấp độ CEFR, có chữ thật:**

```
A flat 2D side-view illustration of 6 ascending staircase steps, each step slightly taller than the previous one, each step a flat rounded block shifting gradually from indigo to cyan, with one label on each step in order from lowest to highest: "A1", "A2", "B1", "B2", "C1", "C2". A small flag icon standing on the top step. Render all labels exactly as written, no extra words, no duplicate text.
Flat minimal design, no shadows, no gradients, rounded corners.
```

**Vòng tròn điểm số, có chữ thật (số liệu thật của đề tài):**

```
A row of 3 flat 2D circular progress ring icons, each a thick rounded ring stroke in indigo #4F46E5 over a light gray track, each with a bold number centered inside the ring and a short caption below it. Ring 1: number "27", caption "bảng dữ liệu". Ring 2: number "6", caption "cấp độ CEFR". Ring 3: number "4", caption "tính năng AI". Render all numbers and captions exactly as written, no extra words, no duplicate text, correct Vietnamese diacritics.
Flat minimal design, white background, no shadows, no gradients, rounded corners.
```

Giờ Cách B đã phủ đủ toàn bộ 9 mục của Cách A cộng bộ icon và vòng tròn điểm số, tất cả có sẵn chữ Việt thật lấy đúng từ nội dung đề tài. Phần ảnh giao diện thật (chụp trực tiếp từ app và trang quản trị đang chạy) không cần prompt, tự thêm sau như dự định.

## Lưu ý khi dùng

- Với mỗi prompt, tạo vài phương án rồi chọn bản đẹp nhất, ảnh AI hiếm khi đúng ý ngay lần đầu.
- Ảnh ra vẫn nên xem lại chữ thật kỹ trước khi ghép vào poster, dù model khai báo 99% chính xác, sai một dấu thanh vẫn có thể lọt.
- Giữ đúng bộ mã màu ở mọi lần tạo để các ảnh không bị lệch tông khi đặt cạnh nhau trên cùng một poster.
- Ảnh giao diện thật (chụp trực tiếp từ app và trang quản trị) không nằm trong phạm vi các prompt này, tự chụp và thêm sau như đã tính.
- Nếu dùng GPT Image 2, tạo thử một câu tiếng Việt có đủ dấu thanh (ví dụ "vở, vợ, thanh điệu") trước để kiểm tra độ chính xác thật trên tài khoản đang dùng, vì số liệu 99% là trung bình nhiều ngôn ngữ, không phải cam kết riêng cho tiếng Việt.
