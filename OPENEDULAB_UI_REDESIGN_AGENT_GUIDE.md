# OPENEDULAB — HƯỚNG DẪN AI AGENT CHỈNH SỬA GIAO DIỆN
## Bảo toàn 100% tính năng, luồng xử lý và dữ liệu hiện hữu

**Mục tiêu:** Chỉnh giao diện website hiện có theo mẫu OpenEduLab đã được người dùng duyệt: bỏ banner lớn ở đầu trang, đưa thư viện mô phỏng lên ngay bên dưới thanh điều hướng, mở rộng vùng nội dung để hiển thị mô phỏng rõ ràng. Chỉ thay đổi giao diện và câu chữ hiển thị; không xây dựng lại ứng dụng.

---

## 1. Chỉ thị tối cao

Bạn đang làm việc trên **mã nguồn dự án hiện hữu**, không phải tạo dự án mới.

1. Giữ nguyên toàn bộ tính năng, hành vi, nghiệp vụ, luồng xử lý, API, cơ sở dữ liệu, xác thực, phân quyền, cấu hình và tích hợp hiện tại.
2. Chỉ chỉnh sửa lớp trình bày: bố cục, CSS, màu sắc, kích thước, khoảng cách, hình ảnh minh họa giao diện và nội dung chữ hiển thị.
3. Không xóa hoặc làm ẩn tính năng hiện có chỉ vì nó không xuất hiện trong ảnh mẫu. Những tính năng như tài nguyên, dự án STEM, cộng đồng, đăng nhập, tìm kiếm, lọc, yêu thích, lượt xem và các chức năng quản trị phải tiếp tục hoạt động theo cách hiện tại.
4. Không thay đổi tên trường dữ liệu, ID, route, endpoint, schema, tên biến được dùng như định danh nghiệp vụ, key lưu trữ, quyền truy cập hoặc định dạng dữ liệu.
5. Không giả lập dữ liệu thật, không tạo tính năng mới, không thay backend và không tự ý đổi kiến trúc.
6. Nếu không chắc một thay đổi có ảnh hưởng tới logic hay không, **không thực hiện thay đổi đó**. Ghi rõ vị trí cần xác minh trong báo cáo.
7. Không tuyên bố “giống 100%”, “đã kiểm thử” hoặc “không ảnh hưởng” nếu chưa có bằng chứng kiểm tra thực tế. Mục tiêu là bám sát tối đa ảnh mẫu và xác minh hồi quy bằng kiểm thử.

## 2. Tham chiếu thiết kế cần làm theo

Dùng ảnh giao diện OpenEduLab mới nhất mà người dùng đã cung cấp/chọn làm **nguồn tham chiếu trực quan chính**. Không quay lại mẫu có banner lớn.

### Bố cục tổng thể

- Giao diện desktop sáng, gọn, sạch; nền trắng hoặc trắng xanh rất nhạt.
- Thanh điều hướng trên cùng nằm ngang, chiều cao vừa phải.
- Thanh danh mục bên trái hẹp vừa đủ đọc; không chiếm quá nhiều chiều ngang.
- Khu vực thư viện mô phỏng chiếm phần lớn diện tích còn lại.
- Không có banner/hero lớn ở đầu nội dung.
- Phần đầu vùng nội dung là tiêu đề **“Mô phỏng nổi bật”** và liên kết **“Xem tất cả →”**.
- Thẻ mô phỏng xuất hiện ngay dưới tiêu đề; không để khoảng trống trang trí lớn.
- Bố cục mẫu desktop hiển thị 4 thẻ mỗi hàng khi chiều rộng màn hình cho phép, với hai hàng hoặc nhiều hơn tùy số dữ liệu thật hiện có.
- Không cố định số thẻ là 8. Render theo dữ liệu và quy tắc phân trang/“xem tất cả” hiện hữu của ứng dụng.

### Thanh điều hướng trên cùng

Giữ các mục điều hướng hiện có và chỉ đổi phần chữ hiển thị khi phù hợp. Mẫu tham khảo gồm:
- Logo/tên: **OpenEduLab**
- Khẩu hiệu ngắn: **Khám phá · Sáng tạo · Chia sẻ**
- Trang chủ
- Mô phỏng
- Tài nguyên
- Dự án STEM
- Cộng đồng (nếu đã có)
- Ô tìm kiếm mô phỏng/tài nguyên theo hành vi tìm kiếm hiện hữu
- Đăng nhập hoặc thông tin tài khoản theo trạng thái xác thực hiện hữu

Không xóa mục điều hướng đang có trong ứng dụng chỉ vì ảnh mẫu không thể hiện hết.

### Thanh bên trái

Thanh trái là thanh điều hướng/danh mục, không phải khu vực nội dung chính.

- Chiều rộng mục tiêu desktop: khoảng **208–224 px** ở khung nhìn rộng khoảng 1536 px.
- Có thể co giãn theo viewport; tránh để quá rộng hoặc khiến vùng thư viện bị bó hẹp.
- Padding trong khoảng 12–18 px; khoảng cách các mục đều nhau.
- Mục điều hướng có icon gọn ở bên trái, chữ ở bên phải.
- Chiều cao mỗi mục khoảng 40–46 px.
- Mục đang chọn có nền xanh dương nhạt, chữ/icon xanh dương đậm, góc bo nhẹ.
- Nhóm danh mục môn học tách bằng đường kẻ mảnh và tiêu đề nhỏ.
- Nội dung mẫu: Trang chủ, Mô phỏng, Tài nguyên, Dự án STEM, Cộng đồng; nhóm Môn học gồm Khoa học tự nhiên, Toán, Công nghệ, Tiếng Anh, Tất cả môn học.
- Chỉ hiển thị các mục tương ứng với chức năng/danh mục thực sự có trong hệ thống; không tạo route giả.

### Vùng thư viện mô phỏng

- Chiếm toàn bộ phần chiều rộng còn lại sau thanh bên trái.
- Padding vùng nội dung khoảng 16–24 px tùy breakpoint.
- Tiêu đề “Mô phỏng nổi bật” dễ thấy, màu xanh navy, có icon gamepad/mô phỏng.
- “Xem tất cả →” đặt bên phải cùng hàng và dùng route/hành vi hiện hữu.
- Khoảng cách giữa tiêu đề và lưới thẻ ngắn gọn, khoảng 12–18 px.
- Dùng CSS Grid/Flex responsive, không dùng ảnh chụp màn hình làm nền thay cho giao diện HTML thật.

### Thẻ mô phỏng

Thẻ có nền trắng, viền xanh xám rất nhạt, bo góc khoảng 12–16 px, bóng nhẹ. Nội dung gọn, có thứ bậc rõ ràng:

1. Ảnh/thumbnail của mô phỏng ở trên cùng, rộng theo thẻ; tỉ lệ mục tiêu khoảng 16:9.
2. Nhãn môn học dạng pill đặt trên ảnh hoặc ở vị trí nhãn hiện có.
3. Tên mô phỏng màu xanh navy, chữ đậm, tối đa 2 dòng trước khi cắt gọn.
4. Mô tả ngắn nếu dữ liệu và giao diện hiện có hỗ trợ; không tự sáng tác mô tả như thể là dữ liệu thật.
5. Hàng thông tin ở dưới: lượt xem, yêu thích hoặc metadata đang được hệ thống hỗ trợ.
6. Nút hành động rõ ràng: ưu tiên nhãn **“Xem mô phỏng →”** nếu hành động đó chính là mở mô phỏng hiện có.

Không tạo số lượt xem, lượt thích, tên tác giả, trường học hoặc dữ liệu mẫu giả để bắt chước ảnh. Dùng dữ liệu thật đã có. Nếu trường dữ liệu không tồn tại, không tự bổ sung vào backend.

### Số cột và responsive

- Desktop rộng (≥ 1280 px): mục tiêu 4 cột nếu thẻ còn đủ rộng để đọc.
- Desktop/trung bình (900–1279 px): 2–3 cột tùy chiều rộng thực tế.
- Tablet (600–899 px): 2 cột nếu nội dung còn đọc tốt.
- Điện thoại (< 600 px): 1 cột hoặc bố cục hiện hữu tối ưu cho màn hình nhỏ.
- Không tạo thanh cuộn ngang cho toàn trang.
- Ảnh, tiêu đề, nút và số liệu không bị tràn hoặc chồng lấn.
- Nếu ứng dụng đã có breakpoint/quy tắc responsive tốt, ưu tiên tinh chỉnh nhẹ thay vì viết lại.

## 3. Bảng màu và phong cách

Dùng bảng màu gần với mẫu tham chiếu. Đây là giá trị định hướng; nếu dự án có hệ thống design tokens thì cập nhật tokens hiện hữu, tránh tạo nhiều bộ màu trùng lặp.

| Thành phần | Màu đề xuất |
|---|---|
| Nền toàn trang | `#F8FBFF` hoặc `#FFFFFF` |
| Bề mặt thẻ/sidebar | `#FFFFFF` |
| Xanh thương hiệu chính | `#0785F9` |
| Xanh hover/nhấn | `#006FE6` |
| Xanh navy tiêu đề | `#0B3B78` |
| Chữ nội dung | `#23466F` |
| Chữ phụ | `#58779B` |
| Viền nhẹ | `#E2EDF8` |
| Nền mục đang chọn | `#E2F1FF` |
| Đỏ yêu thích | `#FF3B4E` |
| Xanh lá nhãn môn học | `#24B34B` |
| Cam nhãn Toán | `#FF8A18` |
| Tím nhãn Vật lí | `#8B5CF6` |

- Dùng xanh dương làm màu hành động chính.
- Tránh gradient đậm, nền tối, nhiều màu trang trí và shadow nặng.
- Bo góc vừa phải; không biến trang thành dashboard quản trị phức tạp.
- Font phải dễ đọc tiếng Việt. Ưu tiên font hiện có; nếu không phù hợp, chọn font sans-serif phổ biến và kiểm tra dấu tiếng Việt.
- Đảm bảo độ tương phản và trạng thái hover/focus/disabled dễ nhận biết.

## 4. Ngôn ngữ hiển thị: học sinh THCS tạo ra

OpenEduLab cần có cảm giác gần gũi, sáng tạo, do học sinh trung học cơ sở tham gia tạo nội dung. Câu chữ có thể trẻ trung, đơn giản, đôi lúc hồn nhiên, nhưng phải rõ nghĩa và tôn trọng người dùng.

### Nguyên tắc viết

- Câu ngắn, từ quen thuộc, thân thiện.
- Ưu tiên cách nói thể hiện học sinh đang khám phá, thử nghiệm và chia sẻ sản phẩm.
- Không dùng giọng quảng cáo doanh nghiệp hoặc thuật ngữ quá hàn lâm ở các nút và lời giới thiệu.
- Không cố tình viết sai chính tả, sai kiến thức hoặc dùng ngôn ngữ trẻ con quá mức.
- Không tự khẳng định mọi mô phỏng đều do học sinh tạo ra nếu dữ liệu thực tế chưa xác nhận. Có thể dùng “Mô phỏng học tập do cộng đồng cùng xây dựng” chỉ khi đúng với thực tế.
- Không sửa nội dung khoa học, tiêu đề tài nguyên hoặc tên dự án chuyên môn chỉ để làm câu chữ “non trẻ”.

### Câu chữ gợi ý cho phần thương hiệu

- Tên: **OpenEduLab**
- Khẩu hiệu: **Khám phá · Sáng tạo · Chia sẻ**
- Mô tả ngắn (chỉ dùng ở vị trí phù hợp, không tạo banner lớn): **“Cùng thử mô phỏng, khám phá điều hay và chia sẻ ý tưởng học tập!”**
- Tiêu đề thư viện: **“Mô phỏng nổi bật”**
- Tìm kiếm: **“Tìm mô phỏng, môn học, chủ đề…”**
- Nút mở mô phỏng: **“Xem mô phỏng →”**
- Nút danh mục: **“Xem tất cả →”**
- Trạng thái trống (chỉ nếu ứng dụng đã có trạng thái trống): **“Chưa tìm thấy mô phỏng phù hợp. Thử từ khóa khác nhé!”**
- Nếu có lời mời đóng góp và tính năng đó đã tồn tại: **“Bạn có mô phỏng hay? Chia sẻ cùng mọi người nhé!”**

Các câu trên là đề xuất. Chọn vị trí thay thế tương ứng với chuỗi hiện hữu; không thêm các khối mới nếu không cần thiết.

## 5. Quy trình làm việc bắt buộc

### Giai đoạn A — Khảo sát trước khi sửa

1. Xác định framework, cấu trúc thư mục, trang/route hiện đang hiển thị thư viện.
2. Xác định component thanh trên, thanh trái, thẻ mô phỏng, bộ lọc, tìm kiếm và trạng thái đăng nhập.
3. Xác định CSS/tokens, breakpoint và thư viện UI đang sử dụng.
4. Ghi lại các luồng hiện có: điều hướng, tìm kiếm, lọc, phân trang, mở mô phỏng, lượt xem, yêu thích, đăng nhập, tài nguyên và các luồng khác được tìm thấy.
5. Chụp ảnh màn hình giao diện hiện tại làm mốc so sánh.
6. Báo cáo ngắn các file dự kiến sửa; sau đó mới chỉnh sửa. Không dừng ở việc chỉ đưa ra kế hoạch nếu người dùng đã yêu cầu thực thi và môi trường cho phép sửa mã nguồn.

### Giai đoạn B — Chỉnh sửa giao diện

1. Ưu tiên chỉnh CSS và component trình bày hiện hữu.
2. Bỏ banner lớn khỏi vị trí nội dung đầu trang; không xóa chức năng hoặc nội dung cần thiết nếu banner chứa hành động quan trọng. Nếu có hành động, chuyển hành động đó sang vị trí phù hợp mà vẫn giữ nguyên hành vi.
3. Đưa thư viện mô phỏng lên đầu vùng nội dung.
4. Điều chỉnh thanh trái khoảng 208–224 px ở desktop rộng, sau đó kiểm tra vùng nội dung thực tế.
5. Áp dụng màu, khoảng cách, cỡ chữ, bo góc, viền và kích thước thẻ theo mục 2–3.
6. Đổi tên thương hiệu và câu chữ hiển thị theo mục 4.
7. Không thay đổi API calls, handlers, service functions, hooks nghiệp vụ, schema, auth logic hoặc logic điều hướng nếu không thực sự bắt buộc.
8. Không hard-code dữ liệu mô phỏng thay cho nguồn dữ liệu hiện tại.

### Giai đoạn C — Kiểm thử hồi quy

Chạy các kiểm thử sẵn có. Nếu có thể, kiểm tra cả ở viewport desktop 1536×960, tablet khoảng 768 px và mobile khoảng 390 px.

Kiểm tra tối thiểu:
- Trang tải thành công; không có lỗi console/build.
- Các mục điều hướng mở đúng trang.
- Tìm kiếm trả kết quả như trước.
- Bộ lọc môn học/danh mục hoạt động như trước.
- Nút “Xem mô phỏng” mở đúng nội dung/route hiện có.
- “Xem tất cả” hoạt động đúng.
- Đăng nhập, trạng thái người dùng và phân quyền không đổi.
- Lượt xem, yêu thích và các hành động dữ liệu khác hoạt động như trước.
- Tài nguyên, dự án STEM, cộng đồng và các chức năng khác hiện có vẫn truy cập được.
- Không phát sinh cuộn ngang ngoài ý muốn; thanh trái không quá rộng; thẻ không tràn chữ.
- Dữ liệu đến từ nguồn thật; không dùng mock data thay thế.

Nếu một chức năng không thể kiểm tra vì thiếu quyền, môi trường hoặc dữ liệu, ghi **“Chưa kiểm tra được”**, không đánh dấu đạt.

### Giai đoạn D — So sánh và nghiệm thu

- Chụp ảnh màn hình sau khi sửa tại cùng kích thước với ảnh tham chiếu.
- So sánh bố cục, độ rộng thanh trái, khoảng cách, màu sắc, kích thước thẻ và vị trí thư viện.
- Sửa những sai khác trực quan quan trọng.
- Kiểm tra diff để chắc chắn thay đổi không lan sang logic nghiệp vụ.
- Nếu có Git, tạo commit/nhánh theo quy trình dự án; không ghi đè hoặc xóa bản gốc.
- Không deploy production khi chưa được phép hoặc khi kiểm thử quan trọng còn thất bại.

## 6. Những điều tuyệt đối không được làm

- Không tạo lại ứng dụng từ đầu.
- Không thay đổi backend hoặc chuyển nhà cung cấp dữ liệu.
- Không thay Google Apps Script, Google Sheets, API endpoint hay cấu hình môi trường.
- Không đổi tên biến/field/route kỹ thuật chỉ vì tên cũ chứa “PMCA” hoặc “WebShare”.
- Không xóa tính năng không có trong ảnh tham chiếu.
- Không thay dữ liệu thật bằng dữ liệu giả hoặc số liệu minh họa.
- Không đưa toàn bộ ảnh mockup vào làm ảnh nền trang web. Phải dựng giao diện bằng component HTML/CSS thật để các nút và dữ liệu vẫn hoạt động.
- Không thêm thư viện nặng hoặc dependency mới nếu CSS/component hiện hữu đã đáp ứng được.
- Không tự tạo logo/ảnh mới hoặc thay thumbnail dữ liệu nếu chưa cần thiết.
- Không chỉnh sửa các file không liên quan chỉ để làm sạch mã nguồn.

## 7. Báo cáo kết quả cuối cùng

Trả về báo cáo ngắn theo cấu trúc:

1. **Đã chỉnh:** liệt kê file và thành phần giao diện đã sửa.
2. **Đã giữ nguyên:** xác nhận theo diff các phần API, data layer, auth, route và nghiệp vụ không bị sửa.
3. **Kiểm thử:** bảng từng chức năng với trạng thái `Đạt` / `Lỗi` / `Chưa kiểm tra được` và bằng chứng.
4. **Sai khác so với mẫu:** liệt kê những phần chưa thể giống do dữ liệu hoặc cấu trúc hiện tại.
5. **Cách chạy và hoàn tác:** lệnh chạy, build và cách quay lại phiên bản trước.

**Tiêu chí thành công:** Giao diện bám sát ảnh OpenEduLab đã chọn; thư viện mô phỏng là trọng tâm; thanh trái vừa phải; câu chữ thân thiện, gần gũi với học sinh THCS; toàn bộ tính năng, dữ liệu và luồng xử lý cũ được bảo toàn và có kiểm thử xác nhận.
