# OPENLAB 3D --- HOST ENVIRONMENT & EQUIPMENT LIBRARY INTEGRATION SPEC

**Tài liệu:** `OPENLAB3D_HOST_IMAGE_BRIDGE_SPEC.md`\
**Phiên bản:** 1.0\
**Vai trò:** Hướng dẫn AI/kỹ sư cải tiến môi trường Studio/OpenLab 3D để
tiếp nhận module thiết bị HTML và hiển thị ảnh thực tế đồng bộ.

> Tài liệu này bổ sung cho `EQUIPMENT_MODULE_STANDARD v2.4`. Không thay
> thế các yêu cầu hiện có về hình học Three.js, PBR, sandbox, đơn vị SI,
> `OL3D_EQUIPMENT_MODULE` hoặc các cổng kiểm định. Nếu có khác biệt, giữ
> nguyên các yêu cầu an toàn/runtime đã có và dùng tài liệu này cho giao
> ước thư viện ảnh thực tế cùng giao tiếp host--module.

## 1. Mục tiêu kiến trúc

Hệ thống có hai phía độc lập nhưng giao tiếp qua một hợp đồng chung:

1.  **Host / Studio Environment** --- môi trường thí nghiệm lớn,
    viewport 3D, thanh công cụ, bộ nạp module, thư viện thiết bị, quản
    lý instance và bảng xem ảnh thực tế.
2.  **Equipment HTML Module** --- mỗi file HTML là một module thiết bị
    độc lập, do AI/kỹ sư tạo; khai báo metadata, icon, ảnh thực tế, mô
    hình 3D và hành vi thiết bị.
3.  **Bridge Contract** --- giao ước metadata và API sự kiện chung, là
    nguồn dữ liệu duy nhất để Host biết module nào đang được chọn và ảnh
    nào cần hiển thị.

Luồng chính:

`HTML Module → HtmlEquipmentModuleRegistry → validate/parse manifest → Equipment Library entry → user hover/click → EquipmentImagePreviewController → ảnh thực tế 240×240`

Khi kéo module vào viewport:

`Library entry → instantiate module → buildEquipmentMesh(THREE, asset) → scene instance`

**Không** để từng module tự tạo popup ảnh riêng. Host là bên duy nhất
quản lý popup, vị trí, trạng thái hover/click và việc đóng ảnh. Module
chỉ cung cấp metadata/ảnh theo hợp đồng.

## 2. Quy tắc không được phá vỡ

-   Không thay thế hoặc che hỏng mô hình 3D hiện có.
-   Không đổi giao diện, camera, vật lý, thao tác kéo-thả, hệ tọa độ
    hoặc các chức năng mô phỏng không liên quan.
-   Không chạy script module trong DOM trang chính. Giữ sandbox hiện có
    và các giới hạn bảo mật của `EQUIPMENT_MODULE_STANDARD`.
-   Không để module gọi `document.querySelector`, `window.parent`,
    `fetch`, `localStorage` hoặc truy cập trực tiếp vào UI Host từ
    sandbox.
-   Module không tự quản lý vị trí popup ảnh.
-   Ảnh tham chiếu không được dùng làm thay thế cho icon 2D hoặc mô hình
    3D.
-   Ảnh hiển thị theo khung chuẩn **240 × 240 CSS px, tỷ lệ 1:1**,
    `object-fit: contain`; không kéo méo hoặc cắt thiết bị.
-   Không ép ảnh nguồn thành hình vuông bằng cách crop mất bộ phận. Có
    thể resize ảnh vào canvas vuông với nền trung tính và giữ nguyên tỷ
    lệ nội dung.
-   Ưu tiên ảnh WebP/PNG/JPEG được phục vụ bằng URL tương đối trong thư
    mục asset. Chấp nhận `data:image/...;base64,...` khi module phải tự
    chứa hoàn toàn. Không nhúng Base64 lặp lại vào nhiều module nếu ảnh
    có thể dùng chung.
-   Nếu không có ảnh thật hợp lệ, hiển thị trạng thái "Chưa có ảnh thực
    tế"; không tự lấy icon làm ảnh thật và không dùng ảnh của thiết bị
    khác.

## 3. Hợp đồng module tối thiểu

Host tiếp tục nhận bốn phần tử cố định trong file module theo chuẩn hiện
tại:

-   `script#ol3d-module-manifest[type="application/json"]`
-   `template#ol3d-module-icon`
-   `template#ol3d-module-real-photo` (giữ để tương thích ngược)
-   `script#ol3d-module-3d-script`

Manifest phải có định danh ổn định. Ví dụ:

``` json
{
  "schemaVersion": "1.0",
  "moduleId": "optics-converging-lens-001",
  "slug": "thau-kinh-hoi-tu",
  "name": "Thấu kính hội tụ",
  "category": "optics",
  "version": "1.0.0",
  "asset": {
    "geometry": {
      "dimensions": {
        "widthOrDiameter": { "value": 60, "unit": "mm" },
        "height": { "value": 12, "unit": "mm" },
        "depth": { "value": 60, "unit": "mm" }
      },
      "boundingBoxM": {
        "width": 0.06,
        "height": 0.012,
        "depth": 0.06
      }
    }
  },
  "realPhotoMeta": {
    "available": true,
    "src": "./assets/thau-kinh-hoi-tu.webp",
    "mimeType": "image/webp",
    "alt": "Ảnh thực tế của thấu kính hội tụ",
    "display": {
      "width": 240,
      "height": 240,
      "ratio": "1:1",
      "fit": "contain",
      "background": "#ffffff"
    },
    "sourceKind": "real-photo",
    "caption": "Thấu kính hội tụ dùng trong thí nghiệm quang học"
  }
}
```

Lưu ý: ví dụ trên chỉ minh họa cấu trúc. Thông số kích thước của module
thật phải dựa trên thiết bị cụ thể đã xác minh.

### 3.1 `realPhotoMeta` schema

Các trường:

-   `available`: boolean, bắt buộc.
-   `src`: đường dẫn ảnh hoặc data URI; bắt buộc khi `available=true`.
-   `mimeType`: `image/webp`, `image/png` hoặc `image/jpeg`.
-   `alt`: văn bản thay thế, bắt buộc.
-   `display.width`: 240.
-   `display.height`: 240.
-   `display.ratio`: `"1:1"`.
-   `display.fit`: `"contain"`.
-   `display.background`: màu nền hiển thị, mặc định `#ffffff`.
-   `sourceKind`: `"real-photo"`; không dùng `"icon"` để giả làm ảnh
    thực tế.
-   `caption`: tùy chọn.
-   `sourceCredit`: tùy chọn nếu cần ghi nguồn/giấy phép.
-   `thumbnailSrc`: tùy chọn; chỉ dùng nếu có thumbnail riêng.

Nếu module cũ chỉ có `template#ol3d-module-real-photo` chứa SVG, Host
được phép hiển thị nó như **ảnh minh họa fallback**, nhưng phải gắn nhãn
rõ "Minh họa cấu tạo", không được coi là ảnh chụp thật. Với module mới,
dùng `realPhotoMeta.src` làm nguồn ảnh thực tế chính.

## 4. Giao ước sự kiện giữa thư viện và bộ xem ảnh

Host tạo một `EquipmentImagePreviewController` duy nhất. Các mục trong
danh sách thiết bị phải mang `data-module-id` bằng chính xác
`manifest.moduleId`.

### 4.1 Chế độ Hover

-   `pointerenter` trên mục thiết bị: hiển thị ảnh module đó.
-   `pointerenter` sang mục thiết bị khác: thay ảnh ngay.
-   `pointerleave` khỏi vùng tương tác tổng hợp (mục thư viện + panel
    ảnh nếu panel cho phép hover): lên lịch ẩn ngắn 100--180 ms để tránh
    nhấp nháy.
-   Nếu pointer đi vào panel ảnh, hủy timer ẩn.
-   Khi rời cả mục thư viện và panel ảnh: ẩn ảnh.
-   Không gắn `pointerleave` chỉ trên icon nếu điều đó làm ảnh biến mất
    trước khi người dùng có thể nhìn nó.

### 4.2 Chế độ Click / Touch

-   `click` vào mục thiết bị: bật trạng thái `pinned` và giữ ảnh.
-   Click thiết bị khác: cập nhật ảnh và giữ ảnh mới.
-   Nút đóng hoặc Escape: đóng ảnh và xóa trạng thái `pinned`.
-   Click vào nền trống của viewport có thể đóng ảnh nếu đó là quy tắc
    UX đã chọn; không được làm mất thao tác đặt thiết bị.
-   Trên thiết bị cảm ứng, dùng click/tap; không phụ thuộc hover.

### 4.3 Vị trí và lớp hiển thị

-   Mặc định đặt panel sát bên phải thanh công cụ trái, bên trong vùng
    ứng dụng nếu có đủ không gian.
-   Panel phải có `position: absolute` trong một container UI có
    `position: relative`, không chiếm chỗ trong layout và không làm đổi
    kích thước viewport 3D.
-   `z-index` phải cao hơn viewport/canvas nhưng thấp hơn modal quan
    trọng của ứng dụng.
-   Không đặt panel trong canvas WebGL.
-   Nếu vùng trái không đủ chỗ, chuyển panel vào góc trên-trái của
    viewport hoặc vị trí responsive khác; tránh che thiết bị đang thao
    tác.
-   Panel desktop có thể rộng 260--300 px để chứa khung ảnh 240 px và
    khoảng đệm. **Ảnh bên trong luôn 240 × 240 px** ở cấu hình chuẩn;
    nếu màn hình nhỏ, có thể scale bằng CSS nhưng vẫn giữ tỷ lệ 1:1.
-   Panel nên có tên thiết bị và nút đóng; ảnh có `alt` đầy đủ.

## 5. API nội bộ khuyến nghị

Đây là API phía Host, không phải API mà script sandbox của module tự
gọi:

``` ts
type RealPhotoMeta = {
  available: boolean;
  src?: string;
  mimeType?: "image/webp" | "image/png" | "image/jpeg";
  alt: string;
  display?: {
    width?: 240;
    height?: 240;
    ratio?: "1:1";
    fit?: "contain";
    background?: string;
  };
  sourceKind?: "real-photo" | "illustration";
  caption?: string;
  sourceCredit?: string;
};

type EquipmentLibraryEntry = {
  moduleId: string;
  name: string;
  category: string;
  iconTemplate: string;
  realPhotoMeta: RealPhotoMeta;
  moduleVersion?: string;
};

type PreviewMode = "hover" | "pinned" | "hidden";

interface EquipmentImagePreviewController {
  preview(moduleId: string, mode: "hover" | "pinned"): void;
  hide(reason?: "pointer-leave" | "close" | "escape" | "viewport-click"): void;
  dispose(): void;
}
```

### 5.1 Tách dữ liệu khỏi UI

-   `HtmlEquipmentModuleRegistry` chịu trách nhiệm parse và validate
    module.
-   `EquipmentLibrary` lưu metadata đã parse và ánh xạ
    `moduleId → module`.
-   `EquipmentImagePreviewController` quản lý trạng thái ảnh.
-   `EquipmentPreviewPanel` chỉ render UI.
-   `SceneManager` quản lý instance 3D, không chịu trách nhiệm tạo popup
    ảnh.

Không để `moduleId`, `slug`, tên hiển thị và đường dẫn ảnh bị suy đoán
từ tên file. Định danh từ manifest là chuẩn chính.

## 6. Xử lý đường dẫn ảnh an toàn

-   Với ảnh tương đối, giải quyết URL dựa trên URL của file module hoặc
    thư mục asset đã được Registry chấp thuận; không giải quyết theo URL
    của trang Host một cách tùy tiện.
-   Chỉ chấp nhận MIME type ảnh được hỗ trợ.
-   Không cho phép `javascript:` URL.
-   Nếu Host hỗ trợ module offline, ưu tiên asset tương đối trong gói
    module hoặc data URI hợp lệ.
-   Khi ảnh lỗi tải, thay bằng placeholder và log lỗi gồm `moduleId`,
    `src`, nguyên nhân; không làm crash module hoặc scene.
-   Nếu ảnh là Base64, kiểm tra MIME prefix và giới hạn kích thước dữ
    liệu theo cấu hình ứng dụng để tránh HTML quá lớn.

## 7. Kiểm thử bắt buộc trước khi nghiệm thu

1.  Nạp một module có `realPhotoMeta.src` là WebP tương đối.
2.  Nạp một module có ảnh PNG.
3.  Nạp một module dùng data URI Base64.
4.  Nạp module cũ chỉ có SVG trong `template#ol3d-module-real-photo`.
5.  Nạp module không có ảnh thật.
6.  Rê chuột từ thiết bị A sang B: ảnh phải đổi đúng, không nhấp nháy.
7.  Rê chuột từ mục thiết bị sang panel ảnh: panel không được biến mất
    ngoài ý muốn.
8.  Rời toàn bộ vùng tương tác ở chế độ Hover: panel ẩn.
9.  Click thiết bị ở chế độ Pinned: panel giữ nguyên khi rê chuột đi nơi
    khác.
10. Click thiết bị khác: panel cập nhật đúng ảnh.
11. Escape/nút đóng: panel đóng.
12. Điện thoại/tablet: tap để mở, nút đóng hoạt động.
13. Ảnh dọc, ngang, vuông: đều nằm gọn trong khung 240 × 240, không
    méo/crop.
14. Ảnh lỗi hoặc URL hỏng: có placeholder, log rõ, scene vẫn chạy.
15. Mở/đóng panel nhiều lần: không nhân đôi event listener, không rò rỉ
    bộ nhớ.
16. Kiểm tra các thao tác kéo module, chọn module, mô phỏng vật lý và
    camera vẫn hoạt động như trước.

## 8. Tiêu chí hoàn thành

-   Có một bộ xem ảnh duy nhất ở phía Host.
-   Host đọc `realPhotoMeta` từ manifest; không cần viết code riêng cho
    từng thiết bị.
-   Mọi module mới dùng chung schema và `moduleId`.
-   Ảnh được hiển thị theo khung chuẩn 1:1, 240 × 240 px, `contain`.
-   Hover, click/pinned, đổi ảnh, đóng ảnh và responsive hoạt động đúng.
-   Module cũ vẫn được nạp theo cơ chế tương thích hiện có.
-   Không làm hỏng sandbox, runtime 3D hoặc các tính năng khác.
-   Có test/log cho các tình huống lỗi.

## 9. Lệnh triển khai cho AI sửa môi trường Studio

> Đọc `EQUIPMENT_MODULE_STANDARD (1).md` và tài liệu này trước khi sửa.
> Kiểm tra code hiện tại của Registry, module loader, thanh thư viện,
> viewport, sandbox và các panel. Triển khai `realPhotoMeta` parser +
> validator, `EquipmentImagePreviewController` và panel ảnh dùng chung.
> Không tạo popup riêng trong từng module. Giữ nguyên runtime 3D và mọi
> hành vi hiện có. Thêm test cho các trường hợp ở Mục 7. Trước khi kết
> thúc, báo cáo file đã sửa, API/selector đã dùng, test đã chạy và các
> điểm chưa thể xác minh. Không tuyên bố hoàn thành test nếu chưa thực
> sự chạy.
