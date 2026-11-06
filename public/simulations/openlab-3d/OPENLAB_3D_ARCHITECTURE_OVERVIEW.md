# BÁO CÁO PHÂN TÍCH & TỔNG QUAN KIẾN TRÚC HỆ THỐNG OPENLAB 3D
> **Phiên bản hệ thống**: `OL3D-MASTER-SPEC v1.0` · `OL3D-LAB-ENVIRONMENT-SPEC v2.0` · `OL3D-HTML-MODULE v2.2`
> **Đối tượng mục tiêu**: Học sinh & Giáo viên THCS (trọng tâm **SGK Khoa học tự nhiên 8 & 9 — Kết nối tri thức với cuộc sống** và chuẩn **Thông tư 38/2021/TT-BGDĐT**).
> **Mục đích tài liệu**: Cung cấp bức tranh toàn cảnh về kiến trúc, dữ liệu, cơ chế 3D, tương tác vật lý, âm thanh và chuẩn module mở rộng của dự án **OpenLab 3D** để làm đầu vào cho AI (ChatGPT / Claude / Gemini) đề xuất ý tưởng cải tiến, tính năng mới hoặc tối ưu hóa trải nghiệm sư phạm.

---

## 1. TỔNG QUAN SẢN PHẨM & CÔNG NGHỆ LÕI (TECH STACK)

- **Nền tảng**: Ứng dụng Web 3D tương tác thời gian thực (SPA).
- **Công nghệ**:
  - **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
  - **Đồ họa 3D**: Three.js (`WebGLRenderer`, PBR Materials, Procedural 3D CAD Geometry, Raycasting, Dynamic Canvas Textures).
  - **Âm thanh Vật lý**: Web Audio API thuần (`LabSoundEngine` — tổng hợp thời gian thực 26 hiện tượng vật lý/hóa học, không phụ thuộc file `.mp3` ngoài).
  - **Ghi hình Thực hành**: `MediaRecorder API` + `CanvasCaptureMediaStream` kết hợp luồng `AudioDestinationNode` (`LabVideoRecorderEngine`) xuất trực tiếp video `.webm`/`.mp4` kèm âm thanh thí nghiệm.
- **Hai chế độ vai trò (Dual-Role UI)**:
  1. **Chế độ Học sinh (`student`)**: Giao diện thực hành trực quan gồm Cột trái (Kho thiết bị phân nhóm Vật lí / Hóa học / Sinh học / Vật mẫu), Giữa (Bàn thí nghiệm 3D tương tác), Phải (Hướng dẫn từng bước 5 bước thực hành), Dưới (Bảng kết quả đo $m, V_1, V_2, \Delta V, D = m/V$, Công thức & Nhật ký thao tác).
  2. **Chế độ Giáo viên / Kỹ thuật viên (`teacher` / `reviewer`)**: Giao diện quản trị tài sản 3D (Asset Explorer, Scene Hierarchy, Inspector 4 lớp, Kiểm duyệt 3 cấp Geometry / Metrology / Behavior, Nạp module `.html`).

---

## 2. KIẾN TRÚC 4 LỚP ĐỘC LẬP (`OL3D-MASTER-SPEC v1.0`)

Mọi thiết bị trong OpenLab 3D được tách biệt nghiêm ngặt thành **4 lớp dữ liệu không trộn lẫn**:

1. **Lớp 1 — Hình học & Hiển thị (`GeometryAssetSpec`)**:
   - Quy ước tỷ lệ thực tế: **`1.0 đơn vị Three.js = 1.0 mét`** (`0.01 = 1 cm`, `0.001 = 1 mm`).
   - Hệ tọa độ: `+Y` hướng lên, `+X` sang phải, `+Z` hướng ra trước; điểm neo chuẩn `anchor: 'base-center'` (đáy thiết bị tại `y = 0` cục bộ).
   - **Luật Chống Khuất Màn Hình (`Local Console Group`)**: Màn hình trên mặt vát nghiêng được gom vào `consoleGroup` cục bộ và nhô `1.2 mm` kèm `polygonOffset` để không bao giờ bị z-fighting hoặc khuất khi nhìn trực diện `0°`.
   - **Luật Hiển Thị 360° (`Omnidirectional Readout`)**: Mọi thiết bị đo hiện số có đủ **4 màn hình đồng bộ** (`scale_display`, `scale_display_rear`, `scale_display_left`, `scale_display_right`) dùng chung 1 `CanvasTexture` để học sinh xoay góc nào cũng đọc được trị số.
   - **Named Nodes chuẩn**: `'root'`, `'body'`, `'plunger'`, `'scale_display'`, `'scale_marks'`, `'liquid_surface'`, `'spout_stream'`, `'lens_element'`.

2. **Lớp 2 — Hồ sơ Khoa học & Đo lường (`ScientificMetadata` & `MeasurementMetadata`)**:
   - Lưu trữ: Vật liệu, khối lượng tham chiếu (`referenceMass`, g), thể tích (`referenceVolume`, $\text{cm}^3$), dung tích (`capacity`, ml), giới hạn đo (`rangeMin`, `rangeMax`), độ chia nhỏ nhất (`leastCount` — ĐCNN), phương pháp hiệu chuẩn và chuẩn quốc tế (`ISO`, `OIML`, `Thông tư 38/2021/TT-BGDĐT`).
   - Trạng thái nguồn gốc số liệu (`DataProvenanceStatus`): `'illustrative' | 'reported' | 'measured' | 'verified'`.
   - **Hồ sơ 5 nguồn Web thực tế (`MultiSourceEquipmentDossier`)**: Mỗi thiết bị đi kèm hồ sơ đối chiếu từ 5 nguồn uy tín (Thư viện Pháp luật, nhà sản xuất, đơn vị cung ứng thiết bị trường học, SGK KHTN 9) và **Ảnh thật đối chiếu (`EquipmentRealPhotoView`)** có ghim chú thích bộ phận (`annotations`).

3. **Lớp 3 — Hành vi & Khả năng tương tác (`BehaviorRegistry` & `moduleControls`)**:
   - Các năng lực (`Capabilities`): `selectable`, `translatable`, `rotatable`, `showDimensions`, `readScale`, `weighObject`, `displacementVolume`, `measureForce`, `caliperMeasure`, `opticalFocus`.
   - Khối điều khiển động `moduleControls`: Tự động sinh thanh trượt, nút kịch bản nhanh (`presets`), nhãn 3D và cờ tương tác chéo (`canBeWeighedOnBalance`, `canHoldLiquid`, `canSubmergeInVessel`, `soundPhenomenon`).

4. **Lớp 4 — Phiên bản Đặt trong Cảnh (`SceneInstance`)**:
   - Không bao giờ ghi đè vào `AssetDefinition` gốc.
   - Lưu tọa độ đặt trên bàn `positionM`, góc xoay `rotationRad`, vùng gắn kết (`attachmentSlot`: `'bench'`, `'balance-pan'`, `'inside-vessel'`, `'dynamometer-hook'`, `'caliper-jaws'`, `'retort-clamp'`, `'dispenser-outlet'`) và trạng thái động `instanceState` (`tareOffsetG`, `measuredMassG`, `liquidLevelMl`, `jawOpeningMm`, `springExtensionN`, `incidentAngleDeg`, `temperatureC`, `multimeterMode`, `multimeterValue`, `magnification`, `isHeating`, `isValveOpen`).

---

## 3. KHÔNG GIAN PHÒNG THÍ NGHIỆM & 13 BIẾN MÔI TRƯỜNG (`OL3D-LAB-ENVIRONMENT-SPEC v2.0`)

- **Kích thước phòng chuẩn**: Rộng `12.0 m` × Sâu `8.0 m` × Cao `3.6 m`, mặt sàn tại `y = 0.00 m`.
- **Bàn thực hành chính**: Rộng `2.40 m` × Sâu `0.75 m`, mặt bàn cao `BENCH_SURFACE_Y = 0.82 m`.
- **Hệ trục tọa độ Góc Bàn cố định $O(0,0,0)$**:
  - Đặt tại góc sau-trái của mặt bàn thực hành (`world = [-1.20, 0.82, -0.375]`).
  - Hỗ trợ bật/tắt trực quan: Trục tọa độ $O\text{-}XYZ$, Lưới mặt bàn phẳng $XY$ (vạch chia `m / cm / mm`), Lưới không gian 3D dựng đứng $XZ$ & $YZ$.
- **13 Biến Môi Trường Vật Lý Tương Tác Thời Gian Thực (`LabEnvironmentVariables`)**:
  1. Gia tốc trọng trường `gravityMps2` ($9.81\text{ m/s}^2$ — Trái Đất, Mặt Trăng, Sao Hỏa...) $\rightarrow$ ảnh hưởng trực tiếp số chỉ Lực kế lò xo $F = m \cdot g$.
  2. Nhiệt độ phòng `airTemperatureC` ($^\circ\text{C}$) $\rightarrow$ cập nhật Nhiệt kế ngoài không khí & bù nhiệt ATC.
  3. Áp suất khí quyển `atmosphericPressureKPa` ($\text{kPa}$) $\rightarrow$ ảnh hưởng nhiệt độ sôi của nước khi đun.
  4. Độ ẩm tương đối `relativeHumidityPct` ($\%$).
  5. Độ rọi sáng phòng `illuminanceLux` ($\text{lx}$) $\rightarrow$ tự động tăng độ tương phản tia Laser / chùm sáng khúc xạ khi hạ tối phòng.
  6. Nồng độ Oxy `oxygenPct` ($\%$) $\rightarrow$ tự động tắt ngọn lửa đèn cồn nếu $O_2 < 14\%$.
  7. Vận tốc gió `airflowMps` ($\text{m/s}$) $\rightarrow$ gây nhiễu số cuối trên cân điện tử nếu không có lồng chắn gió.
  8. Tần số rung nền `BenchVibrationHz` ($\text{Hz}$).
  9. Từ trường môi trường `ambientMagneticFieldMicroT` ($\mu\text{T}$).
  10. Điện áp lưới `mainsVoltageV` ($\text{V}$).
  11. Độ dẫn điện nước máy `waterConductivityMicroScm` ($\mu\text{S/cm}$).
  12. Độ ồn nền `ambientNoiseDb` ($\text{dB}$).
  13. Tốc độ thời gian mô phỏng `timeScale` ($0.25\times \rightarrow 10\times$).

---

## 4. CƠ CHẾ TƯƠNG TÁC VẬT LÝ CHÉO TRÊN BÀN THÍ NGHIỆM (`LabViewport3D`)

Học sinh có thể kéo-thả trực tiếp bằng chuột trong không gian 3D hoặc dùng thanh thao tác nhanh:
1. **Cân khối lượng (`weighObject`)**:
   - Kéo vật mẫu (trụ nhôm, cầu thép, khối đồng, quả cân chuẩn, cốc chứa nước...) đặt lên đĩa **Cân điện tử 500 g**.
   - Tự động tính tổng khối lượng (bao gồm cả khối lượng chất lỏng bên trong nếu cân cốc chứa nước) trừ đi độ lệch `tareOffsetG` (nút **TARE / Trừ bì**), cập nhật lên 4 màn hình LCD 3D và phát tiếng bíp `2750 Hz`.
2. **Đo thể tích bằng phương pháp dời chỗ nước (`displacementVolume`)**:
   - Đặt **Ống đong 100 ml** hoặc **Bình tràn** dưới vòi **Bình cấp nước định lượng 1000 ml** để xả lượng nước chính xác $V_1$.
   - Thả chìm vật rắn không thấm nước vào ống đong $\rightarrow$ mực nước dâng lên $V_2 = V_1 + V_{\text{vật}}$ kèm hiệu ứng mặt khum (`meniscus`) và âm thanh thả vật tõm vào nước.
   - Với **Bình tràn**: phần nước dâng vượt mức tràn sẽ chảy qua vòi nghiêng sang **Cốc thủy tinh hứng bên cạnh** đúng bằng thể tích vật $\Delta V$.
3. **Đo lực (`measureForce`) & Đo kích thước (`caliperMeasure`)**:
   - Treo vật vào móc **Lực kế lò xo 5 N** $\rightarrow$ lò xo giãn thực tế theo $F = m \cdot g$ (hoặc tính lực đẩy Archimedes $F_A$ khi nhúng vật đang treo vào nước).
   - Đặt vật vào hàm kẹp **Thước cặp Vernier 150 mm** $\rightarrow$ hàm động trượt ôm sát đường kính vật và hiển thị số đo chính xác đến `0.02 mm`.
4. **Thí nghiệm Quang học, Điện từ, Hóa - Sinh KHTN 9**:
   - **Quang học**: Nguồn phát tia Laser đỏ `650 nm`, Bản bán trụ khúc xạ & phản xạ toàn phần, Lăng kính tán sắc 7 màu, Thấu kính hội tụ, Kính lúp.
   - **Điện - Điện từ**: Cuộn dây cảm ứng điện từ kèm 2 LED báo chiều dòng điện cảm ứng, Điện kế G nhạy $\pm 50\ \mu\text{A}$, Đồng hồ đo điện đa năng (Digital Multimeter).
   - **Hóa học & Sinh học**: Phễu chiết tách lớp chất lỏng, Bộ chưng cất đơn, Bát sứ cô cạn, Kính hiển vi quang học (`40x – 400x`), Mô hình phân tử ADN xoắn kép.

---

## 5. CHUẨN MODULE THIẾT BỊ `.HTML` ĐỘC LẬP (`OL3D-HTML-MODULE v2.2`)

Điểm đột phá của kiến trúc OpenLab 3D là khả năng **mở rộng không giới hạn bằng các file `.html` độc lập**:
- Mỗi thiết bị mới có thể được tạo từ bất kỳ công cụ AI nào dưới dạng **1 file `.html` duy nhất** chứa:
  1. **Trạm Kiểm Định Độc Lập (`Standalone Browser Testbed`)**: Mở trực tiếp file `.html` trên trình duyệt để xoay 3D 360°, bấm góc nhìn `0°/90°/180°/270°`, kéo thanh trượt thử tính năng động, nghe âm thanh Web Audio API và xem bảng tự chấm điểm chuẩn (`Auto-Compliance Check`).
  2. **4 Khối dữ liệu chuẩn nạp vào Phòng Lab chính**:
     - `<script id="ol3d-module-manifest" type="application/json">`
     - `<template id="ol3d-module-icon">`
     - `<template id="ol3d-module-real-photo">`
     - `<script id="ol3d-module-3d-script">` (`window.OL3D_EQUIPMENT_MODULE = { buildEquipmentGroup, applyEquipmentState, playEquipmentSound }`)

---

## 6. CẤU TRÚC THƯ MỤC MÃ NGUỒN HIỆN TẠI

```text
/
├── EQUIPMENT_MODULE_STANDARD.md          # Hiến pháp kỹ thuật tạo file .html thiết bị độc lập (v2.2)
├── public/
│   ├── assets/aistudio/
│   │   ├── OPENLAB_3D_MASTER_SPEC_v1.0_5b89938b.md
│   │   └── SGK-KHTN9-KNTT_ea8aaaac.pdf   # Sách giáo khoa KHTN 9 Kết nối tri thức
├── src/
│   ├── App.tsx                           # Điều phối trạng thái ứng dụng, luồng 5 bước thực hành & tương tác
│   ├── domain/
│   │   └── types.ts                      # Định nghĩa kiểu dữ liệu 4 lớp (Geometry, Scientific, Behavior, Scene)
│   ├── data/
│   │   ├── mockCatalog.ts                # Danh mục >25 thiết bị 3D chuẩn KHTN 8-9, bộ Kit, môi trường & bài thí nghiệm
│   │   └── multiSourceEquipmentDossier.ts# Hồ sơ kiểm chứng 5 nguồn web thực tế & Audit 360° cho từng thiết bị
│   ├── repositories/
│   │   └── CatalogRepository.ts          # Lớp truy xuất dữ liệu tách biệt UI
│   ├── three-runtime/
│   │   ├── LabViewport3D.tsx             # Engine không gian 3D chính, Raycasting, kéo-thả, HUD & thanh công cụ
│   │   ├── ProceduralLabModels.ts        # Bộ dựng hình học 3D PBR chi tiết theo kích thước thật (mm)
│   │   ├── HtmlEquipmentModuleRegistry.ts# Bộ phân tích cú pháp, kiểm định & nạp nóng module .html
│   │   ├── LabEnvironmentEngine.ts       # Quản lý phòng 12x8x3.6m, bàn 0.82m, hệ trục O-XYZ & 13 biến môi trường
│   │   ├── LabSoundEngine.ts             # Bộ tổng hợp âm thanh vật lý Web Audio API (26 hiện tượng)
│   │   ├── LabVideoRecorderEngine.ts     # Bộ ghi hình & xuất video thực hành 3D kèm âm thanh
│   │   ├── AssetLoader.ts                # Bộ nạp & cache clone Geometry/Material an toàn bộ nhớ GPU
│   │   └── BehaviorRegistry.ts           # Đăng ký mô-đun hành vi được kiểm soát
│   └── components/
│       ├── navigation/TopNavBar.tsx      # Thanh điều hướng, chuyển vai trò Học sinh/Giáo viên, tiến trình 4 bước
│       ├── student/                      # Giao diện thực hành dành cho học sinh (Sidebar, Guided Steps, Bảng kết quả)
│       ├── panels/                       # Các bảng kỹ thuật (Asset Explorer, Scene Hierarchy, Inspector, Bottom Tray)
│       ├── modals/                       # Modal Nạp .HTML, Cấu hình 13 biến môi trường, Ghi video, Quản trị 4 lớp
│       └── common/                       # Khung hiển thị SVG Icon 2D & Ảnh thật đối chiếu có ghim chú thích
```

---

## 7. GỢI Ý PROMPT ĐỂ BẠN DÁN KÈM FILE NÀY VÀO CHATGPT

Bạn có thể sao chép toàn bộ nội dung file `.md` này (hoặc đính kèm file) vào ChatGPT kèm theo câu lệnh sau:

> **"Dưới đây là toàn bộ kiến trúc và hiện trạng của dự án OpenLab 3D (Phòng thí nghiệm Khoa học tự nhiên 3D tương tác theo SGK KHTN 8 & 9 - Kết nối tri thức). Dựa trên bản phân tích kiến trúc này, hãy đóng vai Chuyên gia Kiến trúc Phần mềm Giáo dục 3D (EdTech 3D Architect) và Giáo viên KHTN để đề xuất cho tôi:**
> **1. 5 cải tiến đột phá về Trải nghiệm Tương tác 3D & Cơ chế Vật lý/Hóa học trên bàn thí nghiệm (`LabViewport3D`).**
> **2. 5 tính năng Sư phạm & Đánh giá Học sinh tự động (ví dụ: phát hiện lỗi thao tác sai chuẩn phòng thí nghiệm, chấm điểm kỹ năng thực hành, biểu đồ thực nghiệm thời gian thực).**
> **3. Danh sách các kịch bản thí nghiệm KHTN 9 đắt giá nhất nên ưu tiên mở rộng tiếp theo bằng chuẩn module `.HTML` (`OL3D-HTML-MODULE v2.2`).**
> **Với mỗi đề xuất, hãy nêu rõ: Mục tiêu sư phạm, Mô tả luồng tương tác cụ thể, và Cách tích hợp vào các file hiện có của dự án."**
