# BỘ TIÊU CHUẨN KỸ THUẬT TOÀN DIỆN CHO MODULE THIẾT BỊ `.HTML` — OPENLAB 3D (MASTER SPECIFICATION v2.4)

> **Mục đích tài liệu**: Đây là **Cơ sở chuẩn hóa gốc (Single Source of Truth)** dành cho kỹ sư, giáo viên hoặc bất kỳ hệ thống AI nào (ChatGPT, Claude, Gemini, DeepSeek...) khi thiết kế file `.html` thiết bị thí nghiệm mới.  
> Chỉ cần tuân thủ đúng bộ tiêu chuẩn này, file `.html` khi nạp vào **OpenLab 3D** (qua nút **`+ Thêm thiết bị`** hoặc thư mục **`C:\Users\ltlie\Documents\libraries3DLab`**) sẽ **tương thích ngay lập tức 100%, không phát sinh lỗi runtime, vượt qua 7/7 cổng kiểm định tự động và đạt chất lượng đồ họa 3D PBR đồng bộ với phòng thí nghiệm**.

---

## MỤC LỤC
1. **PHẦN I — TIÊU CHÍ CỨNG (HARD CRITERIA)**: Bắt buộc 100% để nạp không lỗi & khớp không gian 3D.
2. **PHẦN II — TIÊU CHÍ ĐỒ HỌA PBR & HIỆU NĂNG (GRAPHICS FIDELITY)**: Đảm bảo mô hình 3D đẹp, bo cạnh mềm, phản xạ kim loại/thủy tinh chân thực, không nhấp nháy chữ (Z-fighting).
3. **PHẦN III — TIÊU CHÍ RIÊNG BIỆT TỪNG CHỨC NĂNG (FUNCTION-SPECIFIC CONTRACTS)**: Quy định riêng cho 8 nhóm thiết bị (Cân, Quả nặng/Vật mẫu, Ống đong/Cốc, Bình tràn, Máy đo hiện số/Khuấy từ, Cơ học, Quang học, Điện học).
4. **PHẦN IV — TIÊU CHÍ MỞ RỘNG (EXTENDED CRITERIA)**: Kết nối môi trường vật lý, âm thanh Web Audio, hồ sơ kiểm định 5 nguồn và Trạm xem trước độc lập.
5. **PHẦN V — BỘ KHUNG MẪU `.HTML` VẠN NĂNG & PROMPT DÀNH CHO AI KHÁC**.

---

# PHẦN I — TIÊU CHÍ CỨNG (HARD CRITERIA — BẮT BUỘC 100%)

Mọi file `.html` nạp vào OpenLab 3D đều đi qua bộ phân tích `HtmlEquipmentModuleRegistry.parseHtmlModule()` và bộ kiểm định 7 cổng `validateHtmlModule7Gates()`. Vi phạm bất kỳ tiêu chí cứng nào dưới đây sẽ khiến cổng kiểm định báo `FAIL` hoặc `PARTIAL`.

### 1.1. Cấu trúc 4 khối DOM cố định theo `id`
Một file `.html` chuẩn bắt buộc phải có mặt **4 phần tử HTML với `id` chính xác** sau đây:

| STT | Thẻ HTML & Thuộc tính `id` | Vai trò trong hệ thống OpenLab 3D |
| :---: | :--- | :--- |
| **1** | `<script id="ol3d-module-manifest" type="application/json">` | Chứa chuỗi JSON hợp lệ (không có dấu phẩy thừa cuối mảng/object, không có comment `//`) khai báo `asset`, `moduleControls`, `realPhotoMeta`, `dossier`, `audit360`. |
| **2** | `<template id="ol3d-module-icon">` | Chứa đúng 1 thẻ `<svg viewBox="0 0 80 80" ...>...</svg>` làm biểu tượng 2D sắc nét trên thanh **Thư viện** bên trái. |
| **3** | `<template id="ol3d-module-real-photo">` | Chứa đúng 1 thẻ `<svg viewBox="0 0 680 420" ...>...</svg>` làm hình đối chiếu cấu tạo thực tế trong cửa sổ **Chi tiết thiết bị**. |
| **4** | `<script id="ol3d-module-3d-script">` | Chứa mã JavaScript thuần (ES5/ES6 chuẩn) gán đối tượng `window.OL3D_EQUIPMENT_MODULE = { ... }`. |

---

### 1.2. Hệ quy chiếu Không gian & Tỷ lệ SI của Môi trường OpenLab 3D
Môi trường phòng thí nghiệm 3D của OpenLab 3D được cố định như sau:
* **Kích thước phòng thí nghiệm**: Rộng `12.0 m` (trục X) × Sâu `8.0 m` (trục Z) × Cao `3.6 m` (trục Y). Mặt sàn phòng tại `y = 0.000 m`.
* **Bàn thí nghiệm trung tâm**: Dài `2.40 m` × Rộng `0.75 m`, mặt bàn trên cùng nằm tại cao độ **`y = 0.820 m`** (`BENCH_SURFACE_Y = 0.82`).
* **Khi đặt thiết bị lên bàn**, hệ thống tự động đặt gốc `(0, 0, 0)` của thiết bị tại `y = 0.820 m` (hoặc tại tâm mặt đĩa cân nếu đặt lên cân). Do đó, trong hàm dựng 3D của thiết bị, bạn **BẮT BUỘC** tuân thủ 4 quy tắc hình học sau:

1. **Đơn vị đo lường trong Three.js là MÉT (SI)**:
   * `1 m = 1.0` | `10 cm = 0.10` | `1 cm = 0.01` | `1 mm = 0.001`.
   * *Ví dụ*: Thiết bị cao `165 mm`, rộng `150 mm` thì trong Three.js phải dựng với chiều cao `0.165` và chiều rộng `0.150`. **Tuyệt đối không truyền số `165` vào `BoxGeometry` hay `CylinderGeometry`** (vì sẽ tạo ra vật thể cao 165 mét, lớn gấp 45 lần căn phòng!).
2. **Điểm tựa đáy (`anchor: "base-center"`, `upAxis: "Y"`)**:
   * Mặt phẳng `y = 0` trong hệ tọa độ cục bộ của `THREE.Group` thiết bị chính là **mặt bàn thí nghiệm**.
   * Điểm thấp nhất của toàn bộ mô hình (`boundingBox.min.y`) **BẮT BUỘC nằm tại `y = 0.000 m`** (sai số cho phép của Cổng G2 là `|yMin| <= 0.008 m`).
   * *Công thức đặt tâm Cylinder/Box*: Một khối trụ hoặc hộp có chiều cao `H` muốn chạm đáy tại `y = 0` thì tâm của nó phải đặt tại `mesh.position.y = H / 2`. Nếu đặt chồng lên một đế cao `H_base`, tâm khối tiếp theo phải đặt tại `y = H_base + H / 2`.
3. **Đồng bộ kích thước giữa JSON Manifest và Mô hình 3D**:
   * Trong `asset.geometry.boundingBoxM`: khai báo `{ "width": W_m, "height": H_m, "depth": D_m }` bằng đơn vị **mét**.
   * Trong `asset.geometry.dimensions`: khai báo `height.value = H_m * 1000`, `widthOrDiameter.value = W_m * 1000`, `depth.value = D_m * 1000` bằng đơn vị **mm**.
   * Kích thước bao thực tế (`new THREE.Box3().setFromObject(group)`) phải khớp với `boundingBoxM` (sai lệch không quá `±25%`).
4. **Hướng mặt chính diện (`+Z` Front Face)**:
   * Mặt trước của thiết bị (nơi có màn hình LCD chính, nút bấm, vạch chia độ chính) **luôn quay về phía trục `+Z`** (`z > 0`) để hướng thẳng về phía camera mặc định của học sinh.
   * Mặt sau của thiết bị quay về phía trục `-Z` (`z < 0`, xoay `rotation.y = Math.PI`).

---

### 1.3. Giao diện Hàm Kết nối Runtime (Dual-Contract v2.3 & v2.2)
Để tương thích tuyệt đối với cả bộ kiểm định `v2.3` và bộ nạp `v2.2`, đối tượng `window.OL3D_EQUIPMENT_MODULE` trong `<script id="ol3d-module-3d-script">` **bắt buộc định nghĩa đầy đủ cấu trúc sau**:

```javascript
window.OL3D_EQUIPMENT_MODULE = {
  // 1. Hàm dựng mô hình 3D chuẩn v2.3 (Trả về THREE.Group có đáy tại y = 0)
  buildEquipmentMesh: function(THREE, asset) {
    var group = new THREE.Group();
    group.name = (asset && asset.slug ? asset.slug : 'equipment') + '_root';
    // ... Dựng các bộ phận mesh con tại đây ...
    return group;
  },

  // 2. Hàm cập nhật trạng thái thời gian thực chuẩn v2.3
  // - rootObject: THREE.Group của thiết bị đang nằm trên bàn
  // - state: đối tượng SceneInstance.instanceState (chứa multimeterValue, liquidLevelMl, temperatureC...)
  // - dt: bước thời gian giây (đã được kẹp <= 0.05s)
  updateEquipmentState: function(rootObject, state, dt) {
    var st = state || {};
    // ... Cập nhật màn hình CanvasTexture, chiều cao cột nước, góc quay...
  },

  // 3. Hàm phát âm thanh tương tác (Tùy chọn nhưng khuyến khích)
  playEquipmentSound: function(eventType, value) {
    // ... Phát âm thanh qua Web Audio API ...
  },

  // 4. Cầu nối tương thích ngược v2.2 (Luôn giữ nguyên 6 dòng dưới đây)
  buildEquipmentGroup: function(THREE, asset) {
    return this.buildEquipmentMesh(THREE, asset);
  },
  applyEquipmentState: function(THREE, rootObject, instance, asset) {
    var st = instance && instance.instanceState ? instance.instanceState : {};
    this.updateEquipmentState(rootObject, st, 0.016);
  }
};
```

---

### 1.4. Ranh giới An toàn Sandbox (Security Gate G7)
Khi nạp vào OpenLab 3D, mã trong `#ol3d-module-3d-script` được biên dịch bên trong một Sandbox cô lập (`new Function('window', 'document', 'THREE', ...)`):
* Đối tượng `document` truyền vào Sandbox chỉ là một `safeDocProxy` hỗ trợ **duy nhất** lệnh `document.createElement('canvas')` (để vẽ texture động) và `document.createElement('div')`.
* **CẤM TUYỆT ĐỐI** trong `#ol3d-module-3d-script`:
  1. Không gọi `document.getElementById(...)`, `document.querySelector(...)`, `document.body` (vì trong runtime 3D không tồn tại DOM của trang HTML độc lập). Nếu cần viết code cho Trạm xem trước độc lập (`#ol3d-standalone-inspector`), hãy đặt ở một thẻ `<script>` riêng ở cuối trang!
  2. Không gọi `fetch()`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `window.parent`, `window.top`.
  3. Không dùng `THREE.TextureLoader().load('http...')` hay `GLTFLoader` tải file ngoài (vì sẽ gây lỗi CORS hoặc 404 khi offline). Mọi bề mặt chữ số, vạch chia, vân kim loại phải vẽ bằng `document.createElement('canvas')` + `new THREE.CanvasTexture(canvas)`.

---

# PHẦN II — TIÊU CHÍ ĐỒ HỌA PBR & HIỆU NĂNG (GRAPHICS FIDELITY)

OpenLab 3D sử dụng đường ống kết xuất vật lý hiện đại (`ACESFilmicToneMapping`, `SRGBColorSpace`, môi trường phản xạ studio `RoomEnvironment` qua `PMREMGenerator`, bóng đổ mềm `PCFSoftShadowMap`). Để thiết bị mới nạp vào có đồ họa sắc nét, sang trọng và đồng bộ với Cân điện tử OHAUS Scout hay Quả nặng kim loại trong hệ thống, hãy tuân thủ:

### 2.1. Quy tắc Đa thành phần & Bo tròn cạnh (Anti-Blocky Rule)
* **Không bao giờ** biểu diễn một thiết bị chỉ bằng 1 khối `BoxGeometry` hoặc `CylinderGeometry` đơn điệu.
* Mỗi thiết bị phải là tổ hợp từ **4 đến 12 bộ phận (sub-meshes)** mang ý nghĩa cấu tạo thực tế:
  1. **Phần đế & chân tiếp xúc** (`base_foot`: chân cao su, chân ren đỏ chỉnh thăng bằng, đế lục giác chống đổ).
  2. **Phần thân vỏ chính** (`body`: thân bo tròn góc bằng `THREE.Shape` + `THREE.ExtrudeGeometry` với `bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 6`).
  3. **Phần hiển thị & điều khiển** (`scale_display`, `scale_display_rear`, `scale_marks`, núm vặn, phím bấm).
  4. **Phần công tác / tương tác vật lý** (`pan_plate`, `liquid_surface`, `plunger`, `handle`, `pouring_lip`).

### 2.2. Bảng Tham số Vật liệu Chuẩn (PBR Material Recipes)

| Loại chất liệu | Lớp Material Three.js | Thông số chuẩn bắt buộc |
| :--- | :--- | :--- |
| **1. Kim loại phản xạ nhẹ**<br>*(Quả nặng, trụ nhôm, đồng thau, mâm cân Inox)* | `THREE.MeshPhysicalMaterial` | `metalness: 0.90–0.96`, `roughness: 0.08–0.16`, `envMapIntensity: 1.55`, `clearcoat: 0.65`, `clearcoatRoughness: 0.08`, `reflectivity: 0.96`. Kèm vòng vát mép `TorusGeometry` ở rìa trên/dưới để bắt ánh phản xạ! |
| **2. Nhựa kỹ thuật ABS cao cấp**<br>*(Vỏ cân OHAUS, vỏ máy đo, thân bút đo)* | `THREE.MeshPhysicalMaterial` | `color: 0xf8fafc` (trắng sứ) hoặc `0x1e293b` (xám đen), `roughness: 0.20–0.32`, `metalness: 0.04–0.12`, `clearcoat: 0.40`, `clearcoatRoughness: 0.15`. |
| **3. Thủy tinh Borosilicate 3.3**<br>*(Ống đong, cốc, bình tràn, bình cầu, thấu kính)* | `THREE.MeshPhysicalMaterial` | `color: 0xe0f2fe`, `transparent: true`, `opacity: 0.34`, `roughness: 0.06`, `metalness: 0.05`, `ior: 1.48`, `reflectivity: 0.92`, `clearcoat: 1.0`, `depthWrite: false`, `side: THREE.DoubleSide`, `renderOrder: 4`. |
| **4. Dung dịch / Cột nước**<br>*(Nước cất, dung dịch CuSO₄, hóa chất)* | `THREE.MeshPhysicalMaterial` | `color: 0x0ea5e9` (hoặc màu hóa chất), `emissive: 0x0369a1`, `emissiveIntensity: 0.14`, `roughness: 0.06`, `ior: 1.333`, `clearcoat: 1.0`, `transparent: true`, `opacity: 0.72`, `depthWrite: false`, `renderOrder: 2`. |
| **5. Màn hình LCD / LED & Vạch chia**<br>*(Hiển thị số đo, thang chia)* | `THREE.MeshBasicMaterial` hoặc `MeshStandardMaterial` | Dùng `map: canvasTexture`, `polygonOffset: true`, `polygonOffsetFactor: -4`, `polygonOffsetUnits: -4`. Đặt mặt phẳng màn hình nổi phía trước mặt vỏ máy tối thiểu `0.0015 m` (`1.5 mm`) để chống nhấp nháy Z-fighting. |

### 2.3. Kỹ thuật Cập nhật Màn hình Số Động Không Rò Rỉ Bộ Nhớ (Zero-Leak CanvasTexture)
Khi thiết kế màn hình LCD/LED (`scale_display` và `scale_display_rear`):
1. Tạo `canvas` 1 lần duy nhất bên trong `buildEquipmentMesh(THREE, asset)` và lưu vào `group.userData`:
   ```javascript
   var canvas = document.createElement('canvas');
   canvas.width = 512;
   canvas.height = 220;
   drawScreen(canvas, defaultVal);
   var tex = new THREE.CanvasTexture(canvas);
   group.userData.screenCanvas = canvas;
   group.userData.screenTex = tex;
   group.userData.drawScreen = drawScreen;
   group.userData.lastRenderedVal = defaultVal;
   ```
2. Trong `updateEquipmentState(rootObject, state, dt)`, chỉ vẽ lại khi giá trị thay đổi:
   ```javascript
   if (rootObject.userData && rootObject.userData.drawScreen) {
     if (rootObject.userData.lastRenderedVal !== currentVal) {
       rootObject.userData.lastRenderedVal = currentVal;
       rootObject.userData.drawScreen(rootObject.userData.screenCanvas, currentVal);
       rootObject.userData.screenTex.needsUpdate = true;
     }
   }
   ```

---

# PHẦN III — TIÊU CHÍ RIÊNG BIỆT TỪNG CHỨC NĂNG (FUNCTION-SPECIFIC CONTRACTS)

Để thiết bị mới nạp vào **tự động tương tác vật lý** với các thiết bị khác trên bàn (ví dụ: đặt lên cân thì cân nhảy số, thả vào ống đong thì nước dâng, rót nước từ bình tràn thì cốc hứng nhận nước...), bạn phải khai báo đúng **Cờ chức năng (`moduleControls`)**, **Thuộc tính khoa học (`scientificProperties`)** và **Tên Node (`mesh.name`)** theo từng nhóm dưới đây:

---

### NHÓM 1: VẬT MẪU RẮN & QUẢ NẶNG KIM LOẠI (`sample-object`, `calibration-weight`, `solid-cylinder`, `solid-sphere`, `solid-block`)
* **Mục đích**: Đặt lên đĩa cân điện tử, treo vào móc lực kế lò xo, hoặc thả chìm vào ống đong / bình tràn để đo thể tích chiếm chỗ $\Delta V$.
* **Khai báo JSON bắt buộc**:
  * `"category": "sample-object"` (hoặc `"mechanics-apparatus"` cho bộ quả cân).
  * Trong `scientificProperties`:
    * `"referenceMass": { "value": 66.25, "unit": "g", "status": "verified" }` *(Số gam thực tế khi đặt lên Cân điện tử)*.
    * `"referenceVolume": { "value": 24.5, "unit": "cm³", "status": "verified" }` *(Số ml nước dâng lên hoặc tràn ra khi thả chìm vào Ống đong / Bình tràn)*.
    * `"density": { "value": 2.70, "unit": "g/cm³", "status": "verified" }`.
  * Trong `moduleControls`:
    * `"canBeWeighedOnBalance": true`
    * `"canSubmergeInVessel": true`
    * `"canHoldLiquid": false`
* **Cấu trúc Node 3D bắt buộc**:
  * `body`: Thân vật mẫu / quả nặng áp dụng vật liệu phản xạ ánh kim (`metalness: 0.94, roughness: 0.12, clearcoat: 0.7`) kèm 2 vòng vát mép (`TorusGeometry`) ở đỉnh và đáy.
  * `handle`: Khuyên móc tròn hoặc núm cầm ở đỉnh (`y = height`) để khớp với móc treo của Lực kế lò xo.

---

### NHÓM 2: DỤNG CỤ ĐO KHỐI LƯỢNG — CÂN ĐIỆN TỬ (`electronic-balance`)
* **Mục đích**: Nhận bất kỳ thiết bị hoặc vật mẫu nào có `"canBeWeighedOnBalance": true` đặt lên đĩa cân, tự động cộng khối lượng bì + khối lượng chất lỏng bên trong, hỗ trợ trừ bì (`TARE`).
* **Khai báo JSON bắt buộc**:
  * `"category": "measuring-instrument"`, `"proceduralArchetype": "electronic-balance"`.
  * `measurementMetadata`: `"measuredQuantity": "mass"`, `"leastCount": { "value": 0.01, "unit": "g" }`.
* **Cấu trúc Node 3D & Hình dáng bắt buộc**:
  * Hình dáng chuẩn **OHAUS Scout**: Thân vỏ trắng sứ bo tròn mềm các cạnh và lượn eo 2 bên hông (`ExtrudeGeometry` có `bevelEnabled: true`), 4 chân chỉnh thăng bằng màu đỏ hồng (`#e11d48`) ở 4 góc.
  * `weighing_pan` (Group) chứa `pan_plate` (Mesh): Đĩa cân Inox 304 hình chữ nhật bo tròn 4 góc và vát mép bóng mượt. Khi có vật nặng (`measuredMassG > 0.1`), `weighing_pan.position.y = -0.0022`.
  * `measurement_anchor` (Object3D): Đặt tại tâm mặt trên của đĩa cân (`(0, panTopY, panCenterZ)`) — đây là điểm hút nam châm (Magnetic Dock) khi kéo thả vật mẫu hoặc cốc nước lên cân!
  * `scale_display` (mặt trước nghiêng `~20°`) và `scale_display_rear` (mặt sau): Hiển thị `Math.max(0, (state.measuredMassG || 0) - (state.tareOffsetG || 0)).toFixed(2) + " g"`.

---

### NHÓM 3: DỤNG CỤ ĐO THỂ TÍCH & CHỨA CHẤT LỎNG (`volumetric-glassware`: Ống đong, Cốc thủy tinh, Bình tam giác, Bình định mức)
* **Mục đích**: Chứa nước/dung dịch, nhận nước từ Bình cấp nước hoặc Bình tràn, rót nước sang dụng cụ khác, nhận vật rắn thả chìm để dâng mực nước từ $V_1$ lên $V_2$, và có thể đặt cả bình chứa nước lên Cân điện tử.
* **Khai báo JSON bắt buộc**:
  * `"category": "volumetric-glassware"`.
  * Trong `scientificProperties`:
    * `"referenceMass": { "value": 95.0, "unit": "g", "status": "verified" }` *(Khối lượng vỏ bình rỗng khi đặt lên cân)*.
    * `"capacity": { "value": 250.0, "unit": "ml", "status": "verified" }` *(Dung tích tối đa của bình)*.
  * Trong `moduleControls`:
    * `"stateKey": "liquidLevelMl"`
    * `"unit": "ml"`, `"min": 0`, `"max": 250`, `"step": 1`, `"defaultValue": 100`
    * `"canHoldLiquid": true`
    * `"canBeWeighedOnBalance": true` *(Khi đặt lên cân, hệ thống tự động tính: `m_tổng = referenceMass + liquidLevelMl * 1.0 g/ml`!)*
    * `"canSubmergeInVessel": false`
* **Cấu trúc Node 3D bắt buộc**:
  * `body`: Thân thủy tinh Borosilicate trong suốt (`opacity: 0.34, depthWrite: false, renderOrder: 4`) có đáy dày và vành miệng bo tròn.
  * `scale_marks`: Lớp trụ mỏng gắn `CanvasTexture` vạch chia độ (`renderOrder: 5`), chữ số màu xanh đậm có viền sáng trắng để nổi bật trên cả nền tối và nền nước.
  * `liquid_surface` (`THREE.Group`):
    * **Quy tắc sống còn**: Gốc của `liquid_surface` phải đặt tại mặt trong đáy bình (`y = baseThickness`), và hình trụ nước bên trong phải được dịch tâm lên trên `waterGeo.translate(0, baseWaterHeight / 2, 0)`.
    * Khi `updateEquipmentState` chạy:
      ```javascript
      var ml = typeof state.liquidLevelMl === 'number' ? state.liquidLevelMl : defaultMl;
      if (ml <= 0.2) {
        liquidGroup.visible = false;
      } else {
        liquidGroup.visible = true;
        var ratio = Math.max(0.02, Math.min(1.05, ml / maxCapacityMl));
        liquidGroup.scale.set(1, ratio / 0.5, 1);
      }
      ```
    * Trên đỉnh cột nước phải có vành khum lõm mao dẫn (`meniscus_ring`) để học sinh đọc đúng đáy mặt khum.
  * `pouring_lip`: Điểm mỏ rót ở vành miệng bình (phía `+X`) để xuất phát tia nước khi nghiêng rót.

---

### NHÓM 4: BÌNH TRÀN ARCHIMEDES (`overflow-can`)
* **Mục đích**: Đựng nước đến vạch ngưỡng tràn chuẩn (`210.0 ml` ngang miệng trong của vòi xả). Khi thả vật rắn vào hoặc rót thêm nước vượt quá `210.0 ml`, toàn bộ thể tích dôi ra $\Delta V$ chảy qua vòi nghiêng sang Cốc hứng đặt bên cạnh (`+X`).
* **Cấu trúc Node 3D & Quy tắc bắt buộc**:
  * `liquid_surface`: Mực nước trong bình tràn không bao giờ vượt quá vạch cổ vòi tràn (`Math.min(210, state.liquidLevelMl)`).
  * `spout_water` (nước trong lòng ống vòi nghiêng) và `spout_stream` (tia nước parabol chảy từ đầu vòi xuống cốc hứng):
    * **BẮT BUỘC** mặc định `visible = false` khi khởi tạo!
    * Trong `updateEquipmentState`: Chỉ bật `visible = Boolean(state.isValveOpen)` (tức chỉ hiện tia nước trong đúng thời gian đang diễn ra hiện tượng tràn!).

---

### NHÓM 5: THIẾT BỊ ĐO HIỆN SỐ, BÚT ĐO HOÁ LÝ & MÁY KHUẤY TỪ / GIA NHIỆT (`measuring-instrument`, `thermal-apparatus`, `chemical-apparatus`)
*(Bao gồm: Máy khuấy từ gia nhiệt, Bút đo pH, Bút đo TDS/EC, Đồng hồ vạn năng, Nhiệt kế điện tử, Máy đo độ đục, Cảm biến Oxy hòa tan...)*
* **Khai báo JSON bắt buộc**:
  * Trong `moduleControls`:
    * Dùng `"stateKey": "multimeterValue"` (cho pH, ppm, rpm, V, A, Ω, Lux...) hoặc `"stateKey": "temperatureC"` (cho nhiệt kế / bếp đun).
    * Khai báo đầy đủ `min`, `max`, `step`, `defaultValue`, `unit` và tối thiểu **3–4 `presets`** mang ý nghĩa thực nghiệm rõ ràng (ví dụ với bút đo pH: *Axit HCl 0.1M (pH 1.0)*, *Nước cất chuẩn (pH 7.0)*, *Dung dịch NaOH (pH 13.0)*).
* **Cấu trúc Node 3D bắt buộc**:
  * `body`: Thân máy bo cạnh thẩm mỹ.
  * `scale_display` (mặt trước `+Z`) và `scale_display_rear` (mặt sau `-Z`): Vẽ bằng `CanvasTexture` hiển thị rõ tên đại lượng, giá trị hiện tại (theo `state.multimeterValue` hoặc `state.temperatureC`) và đơn vị đo.
  * `plunger`: Bộ phận cảm biến hoặc cơ cấu chấp hành động:
    * Với **Máy khuấy từ**: `plunger` là thanh cá từ PTFE trắng xoay quanh trục Y (`child.rotation.y += (rpm / 1500) * 0.25`) kèm phễu nước xoáy `vortex_funnel` sâu dần theo RPM.
    * Với **Bút đo pH / TDS / Nhiệt kế**: `plunger` là đầu dò điện cực thủy tinh / hợp kim Titan hoặc cột chất lỏng mao dẫn thay đổi chiều cao theo nhiệt độ.

---

### NHÓM 6: DỤNG CỤ ĐO CƠ HỌC (`mechanics-apparatus`: Lực kế lò xo, Thước cặp, Panme, Ròng rọc)
* **Lực kế lò xo (`spring-dynamometer`)**:
  * `"stateKey": "springExtensionN"` (`0` đến `5.0 N`, ĐCNN `0.1 N`).
  * Node bắt buộc:
    * `body`: Vỏ ống trong suốt thấy rõ cấu tạo bên trong + vòng treo trên đỉnh.
    * `scale_marks` & `scale_marks_cross`: Mặt thang chia Newton (`N`) đặt vuông góc `0°` và `90°` để nhìn rõ từ mọi hướng.
    * `spring_coil`: Lò xo xoắn ốc bằng thép (`TubeGeometry` theo đường xoắn `CatmullRomCurve3`), gốc đặt ở đỉnh trên lò xo. Khi chịu lực kéo $F$, `spring_coil.scale.y = 1 + (F / F_max)`.
    * `plunger`: Thanh trục + đĩa chỉ thị màu đỏ + móc treo dưới đáy. Khi chịu lực kéo $F$, `plunger.position.y = -(F / F_max) * maxExtensionM`.
* **Thước cặp / Panme (`vernier-caliper`)**:
  * `"stateKey": "jawOpeningMm"` (`0` đến `150 mm`).
  * Node `body` (thân thước chính + ngàm cố định + `scale_marks`) và `plunger` (con trượt du xích + ngàm di động trượt dọc trục X theo `jawOpeningMm`).

---

### NHÓM 7: DỤNG CỤ QUANG HỌC (`optics-apparatus`: Nguồn Laser, Bản bán trụ, Lăng kính, Thấu kính hội tụ/phân kỳ)
* **Khai báo JSON**: `"category": "optics-apparatus"`, `"stateKey": "incidentAngleDeg"` (hoặc `"multimeterValue"` cho tiêu cự $f$).
* **Cấu trúc Node 3D bắt buộc**:
  * `body`: Thân đèn laser, giá đỡ quang học hoặc bảng chia độ tròn `360°`.
  * Các node tia sáng phát sáng (`MeshBasicMaterial` hoặc `MeshStandardMaterial` có `emissiveIntensity > 1.0`, `transparent: true, opacity: 0.85`):
    * `incident_ray`: Tia tới quay theo góc tới $i = \text{state.incidentAngleDeg}$.
    * `refracted_ray`: Tia khúc xạ tính đúng theo định luật Snell ($n_1 \sin i = n_2 \sin r$). Khi $\sin r \ge 1.0$ (góc tới vượt góc giới hạn phản xạ toàn phần $i_{gh} \approx 41.8^\circ$), bắt buộc đặt `refracted_ray.visible = false`!
    * `reflected_ray`: Tia phản xạ đối xứng góc $i' = i$, tăng độ sáng tối đa khi xảy ra phản xạ toàn phần.

---

### NHÓM 8: DỤNG CỤ ĐIỆN & ĐIỆN TỪ (`electricity-apparatus`: Nguồn điện, Ampe kế, Vôn kế, Điện kế, Biến trở, Cuộn dây cảm ứng)
* **Khai báo JSON**: `"category": "electricity-apparatus"`.
* **Cấu trúc Node 3D bắt buộc**:
  * Cặp chốt cắm cực dương (`+` màu đỏ `#ef4444`) và cực âm (`-` màu đen `#1e293b`) nổi rõ trên mặt máy.
  * Với đồng hồ kim (`galvanometer`): Node `plunger` (kim mặt trước) và `plunger_rear` (kim mặt sau) quay quanh trục Z theo góc lệch.
  * Với đồng hồ hiện số / nguồn điện DC: Node `scale_display` và `scale_display_rear` cập nhật chữ số LED (`V`, `A`, `Ω`) theo `state.multimeterValue`.

---

# PHẦN IV — TIÊU CHÍ MỞ RỘNG (EXTENDED & ADVANCED CRITERIA)

### 4.1. Tương thích 7 Cổng Kiểm Định Tự Động (`validateHtmlModule7Gates`)
Khi bấm nạp file `.html`, cửa sổ Kiểm định của OpenLab 3D sẽ chấm điểm tự động qua 7 cổng:
* **G1 (`G1_STRUCTURE`)**: Kiểm tra đủ 4 khối `#ol3d-module-manifest`, `#ol3d-module-icon`, `#ol3d-module-real-photo`, `#ol3d-module-3d-script`.
* **G2 (`G2_GEOMETRY`)**: Chạy thử `buildEquipmentMesh`, đo `THREE.Box3` kiểm tra `|yMin| <= 0.008 m` và kích thước nằm trong khoảng vật lý hợp lý (`0.01 m – 1.5 m`).
* **G3 (`G3_PHYSICS_METROLOGY`)**: Kiểm tra `referenceMass > 0`, `referenceVolume > 0`, và `leastCount > 0` (đối với dụng cụ đo).
* **G4 (`G4_INTERACTION`)**: Chạy thử `updateEquipmentState` với các trạng thái min/max/default mà không ném ngoại lệ.
* **G5 (`G5_INTEGRATION`)**: Kiểm tra sự tồn tại của các node ngữ nghĩa (`body`, `scale_display` hoặc `liquid_surface` / `plunger`) và các cờ tương tác (`canBeWeighedOnBalance`, `canHoldLiquid`, `canSubmergeInVessel`).
* **G6 (`G6_PERFORMANCE`)**: Đếm số tam giác thực tế (`measuredTriangleCount <= 15000`) và thời gian dựng (`buildTimeMs < 80 ms`).
* **G7 (`G7_SECURITY_PROVENANCE`)**: Quét mã nguồn đảm bảo không chứa API độc hại hay script lạ ngoài Three.js.

### 4.2. Tiêu chuẩn Âm thanh Tương tác (`playEquipmentSound`)
* Không dùng file `.mp3` hay `.wav` bên ngoài.
* Sử dụng bộ tổng hợp âm thanh Web Audio API (`OscillatorNode` + `GainNode`) tái sử dụng chung `window.__ol3dAudioCtx` để phát tiếng *bíp* khi bấm nút, tiếng *róc rách* khi thay đổi mực nước, hoặc tiếng *rung từ trường* khi tăng tốc độ khuấy.

### 4.3. Hồ sơ Khoa học 5 Nguồn (`dossier`) & Kiểm định 360° (`audit360`)
* Khuyến khích bổ sung đối tượng `dossier` (gồm `technicalStandard`, `exactDimensionsSpec`, `weightOrCapacitySpec`, `synthesizedFeatures`, `fiveWebSources`) và `audit360` (`omnidirectionalReadout360`, `coreInteractiveFunctions`, `environmentalAndCrossToolInteractions`) bên trong `#ol3d-module-manifest` để khi giáo viên/học sinh mở cửa sổ **Chi tiết thiết bị**, toàn bộ hồ sơ xuất xứ và tiêu chuẩn Thông tư 38/2021/TT-BGDĐT được hiển thị đầy đủ.

---

# PHẦN V — BỘ KHUNG MẪU `.HTML` VẠN NĂNG & PROMPT DÀNH CHO AI KHÁC

Khi bạn nhờ một AI khác (ChatGPT, Claude, Gemini...) thiết kế 1 hoặc nhiều thiết bị mới cho OpenLab 3D, bạn chỉ cần **copy nguyên văn khung Prompt + Code mẫu dưới đây** gửi cho AI đó:

```markdown
Bạn là Kỹ sư Mô phỏng 3D Three.js và Chuyên gia Thiết bị Thí nghiệm Khoa học Tự nhiên.
Hãy tạo file `.html` độc lập cho thiết bị: [TÊN THIẾT BỊ CỦA BẠN] tuân thủ tuyệt đối chuẩn `OL3D-HTML-MODULE-v2.4` của hệ thống OpenLab 3D:

1. BẮT BUỘC CÓ ĐỦ 4 KHỐI ID CỐ ĐỊNH:
   - `<script id="ol3d-module-manifest" type="application/json">`
   - `<template id="ol3d-module-icon">` (chứa `<svg viewBox="0 0 80 80">`)
   - `<template id="ol3d-module-real-photo">` (chứa `<svg viewBox="0 0 680 420">`)
   - `<script id="ol3d-module-3d-script">` (chứa `window.OL3D_EQUIPMENT_MODULE`)

2. TIÊU CHÍ CỨNG VỀ HÌNH HỌC & TỌA ĐỘ THREE.JS:
   - Đơn vị trong Three.js là MÉT (`1 mm = 0.001 m`, `1 cm = 0.01 m`). Tuyệt đối không dùng số mm trực tiếp.
   - Điểm thấp nhất của mô hình 3D (`Box3.min.y`) BẮT BUỘC chạm mặt bàn tại đúng `y = 0.000` (`|yMin| <= 0.005 m`).
   - Kích thước bao của mô hình khớp với `asset.geometry.boundingBoxM` (mét) và `asset.geometry.dimensions` (mm).
   - Mặt chính diện của thiết bị hướng về phía `+Z`.

3. TIÊU CHÍ ĐỒ HỌA PBR CAO CẤP:
   - Tổ hợp từ 5–10 bộ phận chi tiết. Thân vỏ nhựa/kim loại dùng `THREE.Shape` + `THREE.ExtrudeGeometry` có `bevelEnabled: true` để bo tròn nhẹ các cạnh, không dùng 1 khối hộp sắc cạnh thô.
   - Các chi tiết kim loại dùng `THREE.MeshPhysicalMaterial` (`metalness: 0.92, roughness: 0.14, clearcoat: 0.65, envMapIntensity: 1.5`) kèm vòng vát mép (`TorusGeometry`) bắt sáng phản xạ.
   - Màn hình hiển thị số (`scale_display` ở mặt trước `+Z` và `scale_display_rear` ở mặt sau `-Z`) vẽ bằng `document.createElement('canvas')` + `THREE.CanvasTexture`, đặt `polygonOffset: true, polygonOffsetFactor: -4` và lưu `canvas`/`texture` vào `group.userData` để cập nhật mượt khi kéo thanh trượt.
   - Nếu là bình chứa chất lỏng: nhóm nước đặt tên `liquid_surface` có gốc tại đáy cột nước (`waterGeo.translate(0, h/2, 0)`) và có vành mặt khum mao dẫn (`meniscus_ring`).

4. TIÊU CHÍ KẾT NỐI TƯƠNG TÁC & AN TOÀN SANDBOX:
   - Trong `window.OL3D_EQUIPMENT_MODULE`, định nghĩa đủ `buildEquipmentMesh(THREE, asset)`, `updateEquipmentState(rootObject, state, dt)`, `playEquipmentSound(eventType, value)` VÀ 2 hàm alias `buildEquipmentGroup`, `applyEquipmentState`.
   - Khai báo đúng `category` (`measuring-instrument` | `volumetric-glassware` | `mechanics-apparatus` | `thermal-apparatus` | `optics-apparatus` | `electricity-apparatus` | `chemical-apparatus` | `biology-apparatus` | `sample-object`) và `moduleControls.stateKey` (`multimeterValue` | `liquidLevelMl` | `temperatureC` | `incidentAngleDeg` | `springExtensionN` | `jawOpeningMm` | `magnification`).
   - Tuyệt đối KHÔNG gọi `document.getElementById`, `fetch`, `localStorage`, hay `TextureLoader` tải ảnh ngoài bên trong `<script id="ol3d-module-3d-script">`.
```
