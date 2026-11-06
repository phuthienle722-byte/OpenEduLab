# OPENLAB 3D --- PHƯƠNG ÁN CẢI THIỆN GIAO DIỆN MOBILE

**Mã tài liệu:** `OPENLAB3D_MOBILE_UX_IMPROVEMENT_SPEC.md`\
**Phiên bản:** 1.0\
**Trạng thái:** Đề xuất triển khai\
**Phạm vi:** Giao diện điện thoại cho ứng dụng phòng thí nghiệm 3D
OpenLab 3D

------------------------------------------------------------------------

## 1. Mục tiêu

Cải thiện trải nghiệm OpenLab 3D trên điện thoại, đặc biệt ở các tình
huống:

-   Quan sát và thao tác với thiết bị 3D.
-   Thêm thiết bị vào bàn thí nghiệm.
-   Điều khiển thiết bị đang chọn.
-   Theo dõi kết quả đo và công thức.
-   Sử dụng các công cụ camera, tọa độ và quản lý cảnh.
-   Chuyển đổi giữa chế độ quan sát, thao tác và xem kết quả.

**Định hướng bắt buộc:** Không thu nhỏ giao diện Desktop để nhét vào màn
hình điện thoại. Xây dựng cách trình bày Mobile phù hợp với màn hình
nhỏ, nhưng tái sử dụng cùng mô hình 3D, trạng thái thiết bị, dữ liệu và
logic thí nghiệm hiện có.

## 2. Hiện trạng và vấn đề

Dựa trên các ảnh giao diện được cung cấp, các vấn đề cần kiểm tra và
khắc phục gồm:

### 2.1. Vùng mô phỏng 3D bị chiếm dụng

-   Các thanh tọa độ, chế độ lưới/3D, bộ đếm thời gian và các nút điều
    khiển xuất hiện đồng thời.
-   Bảng điều khiển thiết bị phủ lên một phần cảnh 3D.
-   Thanh công cụ dọc chiếm thêm chiều rộng.
-   Nhãn thông số có nguy cơ chồng lên nhau hoặc che thiết bị.

### 2.2. Bảng điều khiển thiết bị quá lớn

Bảng điều khiển cân điện tử đang hiển thị đồng thời nhiều chức năng như
trừ bì, đặt vật mẫu, xoay, chi tiết, cập nhật HTML và xóa. Trên điện
thoại, bảng này chiếm diện tích lớn và làm giảm khả năng quan sát thí
nghiệm.

### 2.3. Danh mục thiết bị chưa phù hợp với điện thoại

Khi mở danh mục, giao diện vẫn cố giữ cả danh mục và cảnh 3D bên cạnh
nhau. Trên màn hình hẹp, cả hai vùng đều bị thu nhỏ.

### 2.4. Chưa phân cấp rõ chức năng học sinh và chức năng quản trị

Các thao tác thường dùng trong thí nghiệm đang xuất hiện cùng những chức
năng có tính kỹ thuật/quản trị như cập nhật HTML. Cần xác minh quyền và
mục đích thực tế của từng nút trước khi thay đổi.

### 2.5. Các bảng chức năng có thể cạnh tranh không gian

Danh mục thiết bị, bảng điều khiển, kết quả đo và công thức cần được tổ
chức theo trạng thái rõ ràng, tránh mở nhiều bảng lớn cùng lúc.

> Các nhận định trên là đánh giá giao diện từ ảnh chụp. Trước khi sửa
> mã, cần kiểm tra DOM/component, CSS, thư viện 3D và logic trạng thái
> thực tế để xác định nguyên nhân chính xác.

## 3. Nguyên tắc thiết kế

1.  **3D-first:** Cảnh mô phỏng là vùng làm việc chính.
2.  **Mobile-first:** Thiết kế cho thao tác cảm ứng và chiều rộng nhỏ.
3.  **Progressive disclosure:** Chỉ hiển thị chức năng cần thiết ở từng
    thời điểm; chức năng nâng cao mở khi được yêu cầu.
4.  **Không phá vỡ nghiệp vụ:** Giữ nguyên hành vi, phép tính, dữ liệu,
    mã định danh thiết bị và logic thí nghiệm.
5.  **Một nguồn trạng thái:** Desktop và Mobile sử dụng chung trạng thái
    thiết bị và logic nghiệp vụ.
6.  **Không chồng bảng:** Các bảng lớn phải có cơ chế thay thế, đóng
    hoặc chuyển tab; không cộng dồn vô hạn.
7.  **Có thể hoàn tác:** Mỗi thay đổi cần nhỏ, kiểm thử được và dễ
    rollback.
8.  **Tương thích:** Không làm giảm trải nghiệm Desktop và Tablet.
9.  **An toàn thao tác:** Xóa thiết bị hoặc thay đổi quan trọng cần có
    xác nhận phù hợp.
10. **Khả năng tiếp cận:** Nút dễ chạm, nhãn rõ ràng, tương phản đủ và
    trạng thái được thông báo trực quan.

## 4. Bố cục Mobile mục tiêu

### 4.1. Các vùng giao diện

  -----------------------------------------------------------------------
  Vùng                    Thành phần              Hành vi mong muốn
  ----------------------- ----------------------- -----------------------
  A. Header               Logo, tên ứng dụng,     Gọn; không chiếm chiều
                          thêm thiết bị, menu     cao quá mức
                          công cụ                 

  B. Viewport 3D          Bàn thí nghiệm và thiết Nhận phần diện tích lớn
                          bị                      nhất có thể

  C. Floating tools       Di chuyển camera, đặt   Có thể thu gọn/mở rộng
                          lại góc nhìn, zoom,     
                          hiển thị                

  D. Device bottom sheet  Điều khiển thiết bị     Trượt từ dưới lên, có
                          đang chọn               chế độ gọn và chi tiết

  E. Bottom navigation    Kết quả đo, công thức,  Chuyển giữa các mục
                          hướng dẫn nếu có        trong một vùng nội dung
                                                  thống nhất
  -----------------------------------------------------------------------

### 4.2. Quy tắc bố cục

-   Màn hình hẹp: chỉ dùng một cột chính; không ép danh mục và viewport
    nằm cạnh nhau.
-   Danh mục thiết bị: mở dạng màn hình phủ hoặc drawer gần toàn màn
    hình.
-   Bảng điều khiển: dùng bottom sheet; không để bảng che toàn bộ vùng
    3D khi ở chế độ gọn.
-   Kết quả đo/công thức: dùng một panel có tab hoặc chuyển chế độ,
    tránh mở nhiều panel độc lập.
-   Header và thanh điều hướng cần tính đến vùng an toàn của thiết bị.
-   Không dùng chiều rộng cố định theo desktop cho các vùng chính trên
    Mobile.
-   Khi bảng đóng, viewport phải tự nhận lại phần diện tích khả dụng.

## 5. Luồng tương tác bắt buộc

### 5.1. Trạng thái A --- Quan sát thí nghiệm

Hiển thị: - Header gọn. - Viewport 3D. - Một nút mở công cụ camera hoặc
thanh công cụ đã thu gọn. - Thanh chức năng dưới ở trạng thái gọn.

Ẩn hoặc thu gọn: - Bảng điều khiển thiết bị. - Thông tin tọa độ nâng
cao. - Các nhãn không cần thiết. - Công cụ quản trị thiết bị.

### 5.2. Trạng thái B --- Thêm thiết bị

1.  Người dùng nhấn **Thêm thiết bị**.
2.  Danh mục mở gần toàn màn hình.
3.  Hiển thị ô tìm kiếm, nhóm thiết bị và lưới thẻ thiết bị.
4.  Người dùng chọn một thiết bị.
5.  Hiển thị hành động rõ ràng **Đặt lên bàn**; nếu thiết kế hiện tại hỗ
    trợ kéo-thả, vẫn phải có phương án chạm để thêm.
6.  Sau khi thêm thành công, danh mục đóng và thiết bị mới được nhìn
    thấy trong viewport.
7.  Hiển thị phản hồi thành công; không tự mở bảng chi tiết nếu không
    cần thiết.

### 5.3. Trạng thái C --- Chọn thiết bị

-   Chạm vào thiết bị sẽ chọn thiết bị đó.
-   Thiết bị được đánh dấu trực quan, nhưng không làm biến dạng mô hình
    3D.
-   Mở bảng điều khiển nhanh ở cạnh dưới.
-   Bảng phải thể hiện tên thiết bị, trạng thái chính và một số hành
    động phổ biến.
-   Chỉ một thiết bị được xem là thiết bị đang chọn tại một thời điểm,
    trừ khi nghiệp vụ hiện có quy định khác.

### 5.4. Trạng thái D --- Điều khiển nhanh

Đối với cân điện tử, nội dung gợi ý:

-   Tên thiết bị: Cân điện tử.
-   Trạng thái/giá trị hiện tại: ví dụ `0,00 g`.
-   Hành động chính: `Trừ bì (TARE)`, `Đặt vật mẫu lên cân`.
-   Hành động phụ: `Chi tiết`, `Xoay`.
-   Hành động quản trị như `Cập nhật HTML` không đặt cùng cấp với thao
    tác thí nghiệm thông thường.

Không được giả định rằng giá trị ví dụ là giá trị mặc định của hệ thống.
Giá trị phải lấy từ trạng thái thực tế.

### 5.5. Trạng thái E --- Chi tiết thiết bị

-   Nhấn `Chi tiết` sẽ mở rộng bottom sheet.
-   Có thể cuộn nội dung bên trong bảng mà không làm cuộn toàn bộ trang.
-   Có nút đóng hoặc thu gọn rõ ràng.
-   Khi thu gọn, lựa chọn thiết bị và trạng thái thí nghiệm phải được
    giữ nguyên.
-   Không tạo thêm nhiều bản sao bảng điều khiển.

### 5.6. Trạng thái F --- Kết quả đo và công thức

-   `Kết quả đo`, `Công thức` và các mục liên quan được trình bày như
    các tab/chế độ trong cùng một panel.
-   Bảng kết quả có tiêu đề cột dễ đọc trên màn hình nhỏ.
-   Nếu bảng rộng, cho phép cuộn ngang có chủ đích hoặc chuyển từng hàng
    thành thẻ; không làm tràn toàn bộ ứng dụng.
-   Đơn vị đo và ký hiệu vật lý phải được giữ nguyên.
-   Mở kết quả không được làm mất trạng thái thiết bị hoặc thay đổi số
    đo.

## 6. Thiết kế thanh công cụ nổi

### 6.1. Chế độ thu gọn

Chỉ hiển thị một nút mở công cụ hoặc một nhóm rất nhỏ các hành động
thiết yếu.

### 6.2. Chế độ mở rộng

Có thể bao gồm: - Di chuyển/pan camera. - Đặt lại góc nhìn. - Phóng
to/thu nhỏ. - Hiện/ẩn nhãn. - Hiện/ẩn lưới hoặc trục tọa độ. - Các hành
động quản lý cảnh nếu đang được hỗ trợ.

### 6.3. Quy tắc

-   Không che các nút điều khiển thiết bị đang mở.
-   Vị trí phải tính đến vùng an toàn và kích thước màn hình.
-   Hành động xóa không được đặt sát các hành động thường dùng.
-   Nếu có thao tác kéo trực tiếp trên canvas, phải phân biệt rõ kéo
    camera với chạm chọn thiết bị.
-   Không tự thêm hành vi mới nếu hệ thống hiện tại chưa hỗ trợ; trước
    hết xác định hành vi tương ứng.

## 7. Quản lý nhãn và thông số trong cảnh 3D

### 7.1. Phân loại

  -----------------------------------------------------------------------
  Nhóm                    Ví dụ                   Mặc định trên Mobile
  ----------------------- ----------------------- -----------------------
  Trạng thái quan trọng   Số đo đang hoạt động    Hiển thị khi cần cho
                                                  thí nghiệm

  Thông số của thiết bị   Khối lượng, thể tích,   Ưu tiên hiển thị
  được chọn               nhiệt độ                

  Thông số của thiết bị   Giá trị phụ, trạng thái Ẩn hoặc rút gọn
  không được chọn         phụ                     

  Thông tin không gian    Tọa độ X/Y/Z, lưới,     Có thể bật/tắt
                          trục                    

  Thông tin gỡ lỗi        ID nội bộ, dữ liệu kỹ   Không hiển thị cho học
                          thuật                   sinh nếu không cần
  -----------------------------------------------------------------------

### 7.2. Quy tắc hiển thị nhãn

-   Nhãn gắn đúng với vật thể và cập nhật theo camera.
-   Nhãn ngoài vùng nhìn không được nằm lại ở vị trí sai.
-   Tránh chồng lấn bằng cách ưu tiên nhãn thiết bị đang chọn.
-   Không để nhãn phủ lên các nút tương tác quan trọng.
-   Khi mở bảng chi tiết, có thể ẩn nhãn phụ trong vùng bị che.
-   Có một điều khiển để bật/tắt lớp nhãn.
-   Giữ nguyên dữ liệu đo; chỉ thay đổi cách trình bày.

### 7.3. Kiểm tra kỹ thuật

Nếu dùng Three.js: - Kiểm tra cách chuyển tọa độ thế giới sang tọa độ
màn hình cho nhãn HTML. - Cập nhật kích thước renderer và camera khi
viewport đổi kích thước. - Cập nhật projection matrix sau khi đổi aspect
ratio. - Kiểm tra `pointer-events`, thứ tự lớp và xử lý nhãn ngoài
viewport.

Nếu dùng Babylon.js: - Kiểm tra resize của engine và camera. - Kiểm tra
cơ chế gắn nhãn GUI/HTML vào đối tượng. - Kiểm tra thứ tự lớp và xử lý
vùng tương tác.

Không thay đổi thư viện 3D chỉ để giải quyết lỗi bố cục nếu không có
bằng chứng kỹ thuật cho thấy cần thay đổi.

## 8. Quy chuẩn responsive và cảm ứng

Các ngưỡng dưới đây là điểm khởi đầu để kiểm thử, có thể điều chỉnh theo
thiết kế hiện hữu.

  -----------------------------------------------------------------------
  Chiều rộng viewport                 Bố cục đề xuất
  ----------------------------------- -----------------------------------
  Dưới 400 px                         Một cột; danh mục phủ gần toàn màn
                                      hình; bottom sheet gọn

  400--599 px                         Một cột; tăng khoảng cách thao tác
                                      khi có đủ chỗ

  600--767 px                         Ưu tiên một cột; chỉ dùng bố cục
                                      chia vùng nếu viewport vẫn đủ rộng

  Từ 768 px                           Có thể dùng bố cục nhiều cột tùy
                                      không gian thực tế
  -----------------------------------------------------------------------

Yêu cầu: - Vùng chạm mục tiêu khoảng 44--48 CSS px trở lên cho các thao
tác chính. - Các nút không đặt quá sát nhau. - Hỗ trợ hướng dọc và
ngang. - Xử lý `safe-area-inset-*` nếu cần. - Kiểm tra `100dvh` và hành
vi thanh địa chỉ trình duyệt di động. - Không dùng `min-width` cố định
khiến trang tràn ngang. - Các vùng grid/flex quan trọng cần cho phép co
lại (`min-width: 0`, `min-height: 0`) khi phù hợp. - Có trạng thái
focus/pressed/selected rõ ràng. - Các thao tác quan trọng không phụ
thuộc vào hover.

## 9. Gợi ý CSS tham khảo

Đây là ví dụ định hướng, **không phải đoạn mã thay thế trực tiếp**. Cần
đối chiếu với component và stylesheet thực tế trước khi áp dụng.

``` css
.app-shell {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-header {
  flex: 0 0 auto;
}

.main-layout {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
}

.viewport-3d {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
}

.mobile-bottom-sheet {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  max-height: min(72dvh, 640px);
  overflow: auto;
  overscroll-behavior: contain;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.device-catalog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

@media (min-width: 768px) {
  .main-layout {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .mobile-bottom-sheet {
    /* Chỉ dùng quy tắc Desktop/Tablet sau khi kiểm tra layout hiện tại. */
  }
}
```

Lưu ý: - `touch-action: none` chỉ nên đặt trên vùng canvas cần nhận thao
tác kéo/zoom; không áp dụng tùy tiện lên toàn bộ ứng dụng. - Không đặt
`z-index` cao hơn một cách đại trà. Cần thiết lập thứ tự lớp có chủ
đích. - Nếu ứng dụng đã có hệ thống breakpoint hoặc modal/bottom sheet,
ưu tiên mở rộng hệ thống đó thay vì tạo hệ thống song song.

## 10. Yêu cầu bảo toàn chức năng

Không được tự ý xóa, đổi tên hoặc làm thay đổi hành vi của:

-   Các thiết bị đã có trong thư viện.
-   Logic thêm thiết bị và đặt lên bàn.
-   Chọn, di chuyển, xoay và quản lý thiết bị.
-   Trạng thái thiết bị và các phép tính vật lý.
-   Chức năng cân điện tử, trừ bì và đặt vật mẫu.
-   Kết quả đo, công thức, ký hiệu và đơn vị.
-   Lưu/tải cảnh hoặc dữ liệu thí nghiệm nếu hiện có.
-   Chức năng cập nhật HTML và các công cụ quản trị đang được sử dụng.

Nếu một chức năng không phù hợp để hiển thị thường xuyên trên Mobile,
chỉ thay đổi vị trí trình bày hoặc điều kiện hiển thị; không xóa logic
nghiệp vụ.

**Kiến trúc khuyến nghị:** dùng chung domain logic/state giữa Desktop và
Mobile; chỉ phân nhánh lớp trình bày theo viewport hoặc chế độ giao
diện.

## 11. Kế hoạch triển khai

### Phase 0 --- Khảo sát và lập baseline

1.  Xác định framework giao diện, cấu trúc component và thư viện 3D.
2.  Tìm component của header, viewport, danh mục, bảng điều khiển, thanh
    công cụ và kết quả đo.
3.  Xác định state quản lý thiết bị đang chọn và các panel đang mở.
4.  Ghi lại hành vi hiện tại trên Desktop để tránh hồi quy.
5.  Chụp ảnh baseline trên ít nhất một điện thoại nhỏ và một điện thoại
    lớn.
6.  Không sửa nghiệp vụ trong giai đoạn khảo sát.

**Đầu ra:** danh sách file/component liên quan, sơ đồ trạng thái hiện
tại, danh sách lỗi tái hiện được.

### Phase 1 --- Bố cục Mobile

1.  Tạo breakpoint và bố cục Mobile phù hợp.
2.  Sửa overflow và kích thước viewport.
3.  Chuyển danh mục sang chế độ phủ gần toàn màn hình.
4.  Xây dựng bottom sheet cho điều khiển thiết bị.
5.  Tổ chức kết quả đo/công thức thành một panel có chuyển tab.
6.  Thu gọn thanh công cụ.

**Đầu ra:** bố cục Mobile hoạt động, chưa thay đổi logic thí nghiệm.

### Phase 2 --- Tương tác và nhãn

1.  Chuẩn hóa chọn thiết bị và đóng/mở panel.
2.  Kiểm tra xung đột giữa thao tác camera và thao tác chọn thiết bị.
3.  Ưu tiên nhãn của thiết bị đang chọn.
4.  Bổ sung bật/tắt nhãn, tọa độ và lưới nếu các tính năng đã tồn tại.
5.  Kiểm tra nút xóa và chức năng quản trị.

**Đầu ra:** thao tác cảm ứng rõ ràng, nhãn không che khuất nội dung
chính.

### Phase 3 --- Kiểm thử và hoàn thiện

1.  Kiểm thử chức năng.
2.  Kiểm thử responsive và xoay màn hình.
3.  Kiểm tra hiệu năng cảnh 3D.
4.  Chạy kiểm thử hồi quy Desktop.
5.  Sửa các lỗi phát hiện được trước khi phát hành.

**Đầu ra:** báo cáo kiểm thử và danh sách lỗi còn tồn tại (nếu có).

## 12. Acceptance tests --- Tiêu chí nghiệm thu

### A. Bố cục

-   [ ] Không xuất hiện cuộn ngang toàn trang ở các viewport điện thoại
    được hỗ trợ.
-   [ ] Header không đè lên vùng mô phỏng.
-   [ ] Khi mở danh mục, danh mục không bị ép thành một dải hẹp.
-   [ ] Khi đóng danh mục, viewport trở lại kích thước phù hợp.
-   [ ] Bottom sheet không vượt quá chiều cao khả dụng và có thể
    đóng/thu gọn.
-   [ ] Không có hai bảng lớn che nhau ngoài chủ đích thiết kế.
-   [ ] Xoay dọc/ngang không làm mất nội dung hoặc khóa giao diện.

### B. Thiết bị và thí nghiệm

-   [ ] Có thể tìm và thêm thiết bị bằng cảm ứng.
-   [ ] Có thể chọn thiết bị trong cảnh 3D.
-   [ ] Có thể mở, thu gọn và đóng bảng điều khiển.
-   [ ] Chức năng trừ bì của cân vẫn hoạt động như trước.
-   [ ] Chức năng đặt vật mẫu vẫn hoạt động như trước.
-   [ ] Số đo, đơn vị và công thức không bị thay đổi bởi việc sửa UI.
-   [ ] Đóng/mở panel không làm mất trạng thái thiết bị.
-   [ ] Xóa thiết bị không thể bị kích hoạt nhầm một cách dễ dàng.

### C. Công cụ và nhãn

-   [ ] Camera có thể di chuyển/đặt lại góc nhìn bằng thao tác được hỗ
    trợ.
-   [ ] Phóng to/thu nhỏ không làm giao diện bị vỡ.
-   [ ] Nhãn cập nhật theo vị trí camera.
-   [ ] Nhãn phụ có thể được ẩn hoặc giảm bớt khi cần.
-   [ ] Nút không bị nhãn hoặc panel che khuất.

### D. Hồi quy và hiệu năng

-   [ ] Desktop vẫn giữ các chức năng cốt lõi.
-   [ ] Tablet không bị áp dụng bố cục điện thoại quá hẹp.
-   [ ] Không phát sinh lỗi console nghiêm trọng.
-   [ ] Không tạo thêm renderer/canvas hoặc listener trùng lặp ngoài
    thiết kế.
-   [ ] Hiệu năng không giảm đáng kể so với baseline; mọi suy giảm phải
    được đo và giải thích.

## 13. Ma trận kiểm thử tối thiểu

  Thiết bị/viewport       Kiểm tra
  ----------------------- ------------------------------------------------
  320--360 px             Bố cục hẹp, nút và bảng không tràn
  375--390 px             Danh mục, bottom sheet, kết quả đo
  412--430 px             Khoảng cách, kích thước cảnh, thao tác cảm ứng
  Điện thoại xoay ngang   Chiều cao khả dụng và bảng điều khiển
  Tablet                  Không ép dùng bố cục điện thoại
  Desktop                 Hồi quy chức năng và bố cục

Các kích thước là nhóm viewport kiểm thử gợi ý; cần kiểm tra thêm thiết
bị và trình duyệt thực tế đang được người dùng sử dụng.

## 14. Ràng buộc khi giao AI lập trình

AI lập trình phải tuân thủ:

1.  Khảo sát mã nguồn trước khi chỉnh sửa.
2.  Không giả định tên file, component hoặc framework khi chưa xác minh.
3.  Không viết lại toàn bộ ứng dụng.
4.  Không thay đổi logic mô phỏng, công thức, đơn vị hoặc dữ liệu thiết
    bị để giải quyết vấn đề CSS.
5.  Ưu tiên sửa component hiện có và tái sử dụng style/token hiện có.
6.  Không thêm thư viện mới nếu CSS hoặc công cụ hiện tại có thể đáp
    ứng.
7.  Tách thay đổi thành các bước nhỏ, có thể kiểm tra và rollback.
8.  Sau mỗi giai đoạn, chạy build, lint/test nếu dự án có cấu hình và
    kiểm tra console.
9.  Báo cáo rõ file đã sửa, lý do, chức năng được kiểm tra và lỗi còn
    lại.
10. Không tuyên bố hoàn tất nếu chưa chạy được các kiểm thử liên quan.

### Quy trình đề nghị cho AI

**Bước 1 --- Audit only:** Chỉ phân tích mã nguồn và báo cáo component,
CSS, state và nguyên nhân. Chưa sửa file.

**Bước 2 --- Plan:** Đề xuất danh sách file cần thay đổi, cách sửa và
rủi ro hồi quy.

**Bước 3 --- Implement Phase 1:** Chỉ sửa bố cục Mobile, không đổi logic
nghiệp vụ.

**Bước 4 --- Verify:** Chạy build/test và kiểm tra các acceptance tests
có thể tự động hóa.

**Bước 5 --- Implement Phase 2:** Hoàn thiện thao tác, nhãn và công cụ
sau khi Phase 1 ổn định.

**Bước 6 --- Report:** Nêu rõ kết quả thật; đánh dấu các bài kiểm thử
chưa thể chạy thay vì tự nhận đã đạt.

## 15. Những điều không được làm

-   Không thu nhỏ toàn bộ giao diện Desktop bằng `transform: scale(...)`
    để giả lập Mobile.
-   Không ẩn tùy tiện các nút chỉ để làm ảnh chụp đẹp hơn nếu chức năng
    đó vẫn cần thiết.
-   Không xóa chức năng quản trị trước khi xác minh quyền và mục đích sử
    dụng.
-   Không đặt `overflow: hidden` lên mọi phần tử để che lỗi tràn nội
    dung.
-   Không dùng `z-index` lớn hơn như giải pháp duy nhất cho mọi trường
    hợp chồng lấn.
-   Không sửa logic vật lý hoặc số đo để làm giao diện có vẻ đúng.
-   Không thay đổi thư viện 3D nếu chưa có bằng chứng cần thiết.
-   Không gộp toàn bộ mã vào một component lớn.
-   Không tuyên bố đã kiểm thử trên thiết bị thật nếu chỉ kiểm tra bằng
    ảnh hoặc trình giả lập.

## 16. Kết quả mong đợi

Sau khi hoàn thành:

1.  Cảnh 3D là vùng làm việc trung tâm trên điện thoại.
2.  Danh mục thiết bị mở rộng dễ dùng, không làm cảnh bị ép thành dải
    hẹp.
3.  Bảng điều khiển có chế độ gọn và chi tiết.
4.  Thanh công cụ không che thiết bị hoặc nút thao tác chính.
5.  Kết quả đo và công thức dễ truy cập, không làm vỡ bố cục.
6.  Nhãn và thông số có thứ bậc rõ ràng, giảm chồng lấn.
7.  Thao tác cảm ứng ổn định.
8.  Desktop và Mobile sử dụng chung logic thí nghiệm.
9.  Có kiểm thử hồi quy và báo cáo kết quả thực tế.

------------------------------------------------------------------------

## 17. Prompt triển khai ngắn gọn

> Hãy đọc toàn bộ tài liệu `OPENLAB3D_MOBILE_UX_IMPROVEMENT_SPEC.md` và
> khảo sát mã nguồn OpenLab 3D trước khi sửa. Trước tiên chỉ thực hiện
> audit: xác định framework, component, stylesheet, viewport 3D, danh
> mục thiết bị, bảng điều khiển, thanh công cụ, kết quả đo và state liên
> quan; báo cáo nguyên nhân cụ thể của các vấn đề giao diện Mobile.
>
> Sau khi audit, lập kế hoạch sửa theo Phase 1, Phase 2 và Phase 3.
> Không viết lại toàn bộ ứng dụng, không đổi logic vật lý, trạng thái
> thiết bị, công thức, đơn vị hoặc dữ liệu. Ưu tiên bố cục Mobile một
> cột, danh mục thiết bị dạng phủ gần toàn màn hình, bảng điều khiển
> dạng bottom sheet có chế độ gọn/chi tiết, thanh công cụ có thể thu gọn
> và panel kết quả đo/công thức thống nhất.
>
> Chỉ sửa những file cần thiết. Sau mỗi phase, chạy build/test phù hợp,
> kiểm tra hồi quy Desktop và báo cáo file đã thay đổi, kết quả kiểm
> thử, lỗi còn tồn tại. Không tuyên bố đạt tiêu chí nếu chưa có bằng
> chứng kiểm tra.

**Kết thúc tài liệu.**
