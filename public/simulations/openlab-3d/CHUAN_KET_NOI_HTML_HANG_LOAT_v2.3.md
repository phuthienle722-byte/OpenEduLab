# CHUẨN KẾT NỐI ĐỂ TẠO HÀNG LOẠT FILE `.HTML` NẠP VÀO THƯ VIỆN OPENLAB 3D (v2.3)

Tài liệu này định nghĩa **Chuẩn kết nối kỹ thuật (Contract Specification v2.3 & v2.2)** để bạn (hoặc AI như ChatGPT / Claude / Script tự động) tạo hàng loạt file `.html` thiết bị thí nghiệm và nạp thẳng vào **OpenLab 3D** qua nút **`+ Thêm thiết bị`** hoặc quét cả thư mục **`C:\Users\ltlie\Documents\libraries3DLab`**.

---

## PHẦN 1: CẤU TRÚC 4 KHỐI BẮT BUỘC TRONG 1 FILE `.HTML`

Hệ thống `HtmlEquipmentModuleRegistry` của OpenLab 3D đọc mỗi file `.html` thông qua **4 thẻ ID cố định** sau đây:

| STT | Thẻ HTML & `id` bắt buộc | Chức năng trong OpenLab 3D |
| :--- | :--- | :--- |
| **1** | `<script id="ol3d-module-manifest" type="application/json">` | Chứa toàn bộ **Metadata thiết bị (`asset`)**, **Thanh trượt điều khiển (`moduleControls`)**, **Chú thích ảnh thật (`realPhotoMeta`)**, **Hồ sơ 5 nguồn (`dossier`)**, và **Kiểm định 360° (`audit360`)**. |
| **2** | `<template id="ol3d-module-icon">` | Chứa 1 thẻ `<svg viewBox="0 0 80 80">...</svg>` làm **Icon 2D** hiển thị trên thanh **Thư viện** bên trái. |
| **3** | `<template id="ol3d-module-real-photo">` | Chứa 1 thẻ `<svg viewBox="0 0 680 420">...</svg>` minh họa trực quan đối chiếu kích thước thực tế trong cửa sổ **Chi tiết thiết bị**. |
| **4** | `<script id="ol3d-module-3d-script">` | Chứa đối tượng `window.OL3D_EQUIPMENT_MODULE` gồm 3 hàm: dựng mô hình 3D (`buildEquipmentMesh` hoặc `buildEquipmentGroup`), cập nhật trạng thái (`updateEquipmentState` hoặc `applyEquipmentState`), và phát âm thanh (`playEquipmentSound`). |

---

## PHẦN 2: BẢNG MÃ KẾT NỐI HỢP LỆ (ENUMS & STATE KEYS)

Khi tạo JSON trong `<script id="ol3d-module-manifest">`, hãy dùng đúng các mã dưới đây để thiết bị tự động phân loại vào đúng ngăn **Thư viện** và tương tác vật lý với **Cân điện tử, Bình tràn, Nhiệt kế, Thấu kính, Nguồn điện**:

### 2.1. Mã danh mục (`asset.category` và `asset.categoryIds`)
* `"measuring-instrument"` — Dụng cụ đo (cân, lực kế, đồng hồ vạn năng, bút đo pH/TDS, nhiệt kế...)
* `"volumetric-glassware"` — Dụng cụ đo thể tích & chứa chất lỏng (ống đong, bình tràn, cốc thủy tinh, bình định mức...)
* `"mechanics-apparatus"` — Cơ học (quả nặng, con lắc, ròng rọc, máng nghiêng...)
* `"thermal-apparatus"` — Nhiệt học (đèn cồn, máy khuấy từ gia nhiệt, nhiệt lượng kế...)
* `"optics-apparatus"` — Quang học (đèn laser, thấu kính hội tụ/phân kỳ, lăng kính, bảng chia độ...)
* `"electricity-apparatus"` — Điện & Điện từ (nguồn điện, biến trở, ampe kế, vôn kế, nam châm...)
* `"chemical-apparatus"` — Hoá học (giá ống nghiệm, phễu chiết, buret, bình tam giác...)
* `"biology-apparatus"` — Sinh học (kính hiển vi, tiêu bản, kính lúp...)
* `"sample-object"` — Vật mẫu khảo sát (trụ nhôm, trụ đồng, viên bi thép, mẫu khoáng vật...)

### 2.2. Mã môn học (`asset.subject`)
* `"physics"` (Vật lý) | `"chemistry"` (Hóa học) | `"biology"` (Sinh học) | `"general-science"` (KHTN chung)

### 2.3. Biến trạng thái điều khiển (`moduleControls.stateKey`)
Mỗi thiết bị chọn **1 biến chính** trong 7 biến chuẩn của `SceneInstance.instanceState`:
* `"multimeterValue"` — Dùng cho mọi chỉ số hiện số: pH, TDS (ppm), tốc độ khuấy (rpm), điện áp (V), cường độ dòng (A), tiêu cự (mm)...
* `"liquidLevelMl"` — Mực chất lỏng trong bình/cốc/ống đong (`ml`).
* `"temperatureC"` — Nhiệt độ thiết bị hoặc dung dịch (`°C`).
* `"incidentAngleDeg"` — Góc chiếu tia sáng / góc quay (`°`).
* `"springExtensionN"` — Lực kéo lò xo / lực kế (`N`).
* `"jawOpeningMm"` — Độ mở hàm thước cặp / panme (`mm`).
* `"magnification"` — Độ phóng đại kính hiển vi / kính lúp (`×`).

### 2.4. Cờ tương tác vật lý chéo trên bàn thí nghiệm (`moduleControls`)
* `"canBeWeighedOnBalance": true` → Đặt lên **Cân điện tử** sẽ cộng đúng khối lượng `scientificProperties.referenceMass.value` (tính bằng `g`) + khối lượng nước bên trong (nếu có).
* `"canHoldLiquid": true` → Nhận nước chảy từ **Bình tràn** hoặc rót sang cốc khác.
* `"canSubmergeInVessel": true` → Nhúng vào **Ống đong / Bình tràn** sẽ dâng mực nước đúng bằng `scientificProperties.referenceVolume.value` (tính bằng `cm³`).

### 2.5. Tên Node 3D ngữ nghĩa chuẩn (`geometry.namedNodes` & `mesh.name`)
Đặt `mesh.name` trong Three.js khớp với các tên sau để hệ thống tự động nhận diện:
* `"body"` — Thân chính của thiết bị.
* `"scale_display"` (và `"scale_display_rear"`) — Màn hình LED/LCD hoặc vạch chia độ (dùng `CanvasTexture` để đổi số theo thời gian thực).
* `"pan_plate"` — Đĩa cân / mâm đặt vật.
* `"liquid_surface"` — Cột chất lỏng bên trong bình chứa.
* `"plunger"` — Đầu dò cảm biến / điện cực / cá từ / pít-tông chuyển động.

---

## PHẦN 3: TIÊU CHUẨN VƯỢT QUA 7 CỔNG KIỂM ĐỊNH TỰ ĐỘNG (7-GATE VALIDATOR)

Khi nạp file `.html`, OpenLab 3D chạy bộ kiểm định 7 cổng (`validateHtmlModule7Gates`). Để đạt **PASS 7/7**:
1. **G1 (Cấu trúc)**: Có đủ `#ol3d-module-manifest`, `#ol3d-module-icon`, `#ol3d-module-real-photo`, `#ol3d-module-3d-script`.
2. **G2 (Hình học & Tỷ lệ SI)**:
   * Đơn vị trong Three.js là **mét (m)**: `1 mm = 0.001 m`, `1 cm = 0.01 m`.
   * Điểm gốc tiếp xúc mặt bàn tại **`y = 0`** (sai số cho phép `|yMin| <= 0.008 m`). Không để thiết bị lơ lửng hoặc chìm dưới mặt bàn.
   * Kích thước thực tế của `THREE.Box3` khớp với `geometry.boundingBoxM` (`width`, `height`, `depth` tính bằng mét).
3. **G3 (Vật lý & Đo lường)**: Khai báo `scientificProperties.referenceMass.value > 0` (gam), `referenceVolume.value > 0` (cm³), và `measurementMetadata.leastCount.value > 0` (ĐCNN).
4. **G4 (Tương tác)**: Có hàm `updateEquipmentState(rootGroup, state, dt)` hoặc `applyEquipmentState(THREE, rootGroup, instance, asset)` chạy mượt không báo lỗi.
5. **G5 (Tích hợp bàn 3D)**: Có ít nhất 2 node ngữ nghĩa (`body`, `scale_display`...).
6. **G6 (Hiệu năng)**: Tổng số tam giác `triangleCount <= 15000`, thời gian dựng `< 80 ms`.
7. **G7 (An toàn & Nguồn gốc)**:
   * **KHÔNG** dùng `fetch()`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `document.cookie`, `window.parent` bên trong `<script id="ol3d-module-3d-script">`.
   * Chỉ nạp CDN Three.js (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`) cho phần xem độc lập.

---

## PHẦN 4: FILE `.HTML` MẪU CHUẨN KẾT NỐI (COPY ĐỂ TẠO HÀNG LOẠT)

Bạn có thể lưu đoạn mã dưới đây thành file `.html` hoặc đưa thẳng cho AI (ChatGPT / Claude) kèm danh sách tên thiết bị để sinh hàng loạt file `.html`:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OL3D HTML Module — Tên Thiết Bị (OL3D-EQP-XXX-0001)</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; }
    .header { padding: 14px 24px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #10b981; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
    #preview3d { width: 100%; height: 420px; border-radius: 10px; overflow: hidden; background: radial-gradient(circle at center, #1e293b, #090d16); }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <span class="badge">CHUẨN KẾT NỐI OL3D v2.3</span>
      <strong style="margin-left: 10px; font-size: 18px;">Ampe kế hiện số DC 0–10A (OL3D-EQP-AMP-0001)</strong>
    </div>
    <div style="font-size: 13px; color: #94a3b8;">Tương thích thư viện: C:\Users\ltlie\Documents\libraries3DLab</div>
  </div>

  <!-- 1. MANIFEST JSON CHUẨN KẾT NỐI -->
  <script id="ol3d-module-manifest" type="application/json">
  {
    "moduleSpecVersion": "OL3D-HTML-MODULE-v2.3",
    "asset": {
      "assetId": "OL3D-EQP-AMP-0001",
      "slug": "ampe-ke-hien-so-dc",
      "name": {
        "vi": "Ampe kế hiện số DC 0–10A",
        "en": "Digital DC Ammeter 0–10A"
      },
      "kind": "equipment",
      "subject": "physics",
      "category": "electricity-apparatus",
      "categoryIds": ["electricity-apparatus", "measuring-instrument"],
      "tags": ["ampe kế", "dòng điện", "điện học", "KHTN 9", "module html"],
      "summary": "Ampe kế hiện số DC dải đo 0 – 10.00 A, độ chia nhỏ nhất 0.01 A, có 2 chốt cắm nối tiếp mạch điện và màn hình LED hai mặt 360°.",
      "textbookRef": {
        "bookTitle": "SGK Khoa học tự nhiên 9 - Kết nối tri thức",
        "chapter": "Chương Điện học — Định luật Ohm & Đo cường độ dòng điện",
        "lesson": "Thực hành đo cường độ dòng điện chạy qua vật dẫn",
        "figureRef": "Thiết bị đo điện chuẩn Thông tư 38/2021/TT-BGDĐT",
        "standardFunction": "Đo cường độ dòng điện một chiều (DC) mắc nối tiếp trong mạch điện thí nghiệm.",
        "usageGuidelines": "Mắc nối tiếp chốt dương (+) màu đỏ về phía cực dương nguồn điện, chốt âm (-) màu đen về phía tải tiêu thụ.",
        "safetyNote": "Không mắc trực tiếp hai chốt Ampe kế vào hai cực nguồn điện khi chưa có tải tiêu thụ."
      },
      "assetVersion": "1.0.0",
      "manifestSchemaVersion": "2.3.0",
      "moduleApiVersion": "2.3.0",
      "geometry": {
        "modelFormat": "PROCEDURAL_PBR",
        "modelUri": "procedural://ampe-ke-hien-so-dc",
        "modelFileVersion": "1.0.0",
        "proceduralArchetype": "digital-multimeter",
        "upAxis": "Y",
        "anchor": "base-center",
        "boundingBoxM": { "width": 0.11, "height": 0.13, "depth": 0.09 },
        "dimensions": {
          "height": { "value": 130, "unit": "mm", "status": "verified" },
          "widthOrDiameter": { "value": 110, "unit": "mm", "status": "verified" },
          "depth": { "value": 90, "unit": "mm", "status": "verified" }
        },
        "triangleCount": 960,
        "materialCount": 5,
        "namedNodes": [
          { "nodeName": "body", "role": "body", "description": "Vỏ hộp nhựa ABS cách điện nghiêng 30°" },
          { "nodeName": "scale_display", "role": "scale_display", "description": "Màn hình LED hiển thị dòng điện (A) 360°" },
          { "nodeName": "plunger", "role": "plunger", "description": "Kim chỉ thị phụ & cặp chốt cắm mạch điện (+/-)" }
        ],
        "scaleValidation": "verified"
      },
      "scientificProperties": {
        "material": { "value": "Vỏ nhựa ABS chống cháy & Chốt đồng mạ niken", "status": "verified" },
        "referenceMass": { "value": 320.0, "unit": "g", "status": "verified" },
        "referenceVolume": { "value": 115.0, "unit": "cm³", "status": "verified" }
      },
      "measurementMetadata": {
        "isMeasuringInstrument": true,
        "measuredQuantity": "voltage-resistance",
        "rangeMin": { "value": 0, "unit": "A", "status": "verified" },
        "rangeMax": { "value": 10, "unit": "A", "status": "verified" },
        "leastCount": { "value": 0.01, "unit": "A", "status": "verified" },
        "zeroOffsetSupported": true,
        "calibrationMethod": "Tự động quy không (Auto-Zero) trước khi đóng khóa K",
        "referenceStandard": "Thông tư 38/2021/TT-BGDĐT · SGK KHTN 9"
      }
    },
    "moduleControls": {
      "stateKey": "multimeterValue",
      "label": "Cường độ dòng điện (I)",
      "unit": "A",
      "min": 0,
      "max": 10,
      "step": 0.05,
      "defaultValue": 1.25,
      "canBeWeighedOnBalance": true,
      "canHoldLiquid": false,
      "canSubmergeInVessel": false,
      "soundPhenomenon": "probe-measure",
      "presets": [
        { "label": "Ngắt mạch (0.00 A)", "statePatch": { "multimeterValue": 0 } },
        { "label": "Đèn LED sáng (0.35 A)", "statePatch": { "multimeterValue": 0.35 } },
        { "label": "Điện trở R = 4Ω, U = 5V (1.25 A)", "statePatch": { "multimeterValue": 1.25 } },
        { "label": "Tải công suất cao (4.80 A)", "statePatch": { "multimeterValue": 4.80 } }
      ]
    },
    "realPhotoMeta": {
      "caption": "Hình đối chiếu Ampe kế hiện số DC 0–10A chuẩn phòng thí nghiệm KHTN",
      "manufacturerRef": "Thiết bị KHTN 9 — Thông tư 38/2021/TT-BGDĐT",
      "realWorldScaleNote": "Kích thước: 110 × 90 × 130 mm · Dải đo: 0.00 – 10.00 A · ĐCNN: 0.01 A",
      "annotations": [
        { "xPercent": 50, "yPercent": 42, "label": "Màn hình LED đỏ hiển thị cường độ dòng điện (A)" },
        { "xPercent": 35, "yPercent": 75, "label": "Chốt âm (-) COM màu đen" },
        { "xPercent": 65, "yPercent": 75, "label": "Chốt dương (+) 10A màu đỏ" }
      ]
    }
  }
  </script>

  <!-- 2. ICON 2D VECTOR (80x80) -->
  <template id="ol3d-module-icon">
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="72" rx="28" ry="4" fill="#94A3B8" opacity="0.35" />
      <rect x="16" y="16" width="48" height="52" rx="7" fill="#F8FAFC" stroke="#334155" stroke-width="2.2" />
      <rect x="22" y="24" width="36" height="18" rx="3" fill="#0F172A" stroke="#10B981" stroke-width="1.5" />
      <text x="40" y="36" text-anchor="middle" fill="#34D399" font-family="monospace" font-weight="bold" font-size="10">1.25A</text>
      <circle cx="29" cy="56" r="5" fill="#1E293B" stroke="#475569" stroke-width="1.5" />
      <circle cx="51" cy="56" r="5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5" />
    </svg>
  </template>

  <!-- 3. HÌNH ĐỐI CHIẾU THỰC TẾ (680x420) -->
  <template id="ol3d-module-real-photo">
    <svg viewBox="0 0 680 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="680" height="420" rx="14" fill="#0F172A" />
      <rect x="210" y="70" width="260" height="260" rx="16" fill="#F1F5F9" stroke="#475569" stroke-width="4" />
      <rect x="245" y="110" width="190" height="90" rx="8" fill="#090D16" stroke="#10B981" stroke-width="3" />
      <text x="340" y="168" text-anchor="middle" fill="#34D399" font-family="monospace" font-size="38" font-weight="bold">1.25 A</text>
      <circle cx="285" cy="275" r="20" fill="#1E293B" stroke="#94A3B8" stroke-width="4" />
      <circle cx="395" cy="275" r="20" fill="#EF4444" stroke="#FCA5A5" stroke-width="4" />
      <text x="340" y="380" text-anchor="middle" fill="#38BDF8" font-family="monospace" font-size="14" font-weight="bold">AMPE KẾ HIỆN SỐ DC 0–10A · KÍCH THƯỚC 110 × 90 × 130 MM</text>
    </svg>
  </template>

  <!-- 4. MÃ DỰNG MÔ HÌNH 3D THREE.JS (CHUẨN v2.3 + TƯƠNG THÍCH NGƯỢC v2.2) -->
  <script id="ol3d-module-3d-script">
    window.OL3D_EQUIPMENT_MODULE = {
      buildEquipmentMesh: function(THREE, asset) {
        var group = new THREE.Group();
        group.name = (asset && asset.slug ? asset.slug : 'ammeter_dc') + '_root';

        // Đế tiếp xúc mặt bàn đúng tại y = 0 (Tổng kích thước: rộng 0.11m, cao 0.13m, sâu 0.09m)
        var bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.1 });
        var darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.2 });

        var baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.09), darkMat);
        baseMesh.position.set(0, 0.008, 0);
        baseMesh.name = 'base_foot';
        group.add(baseMesh);

        var bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.106, 0.114, 0.082), bodyMat);
        bodyMesh.position.set(0, 0.016 + 0.057, 0);
        bodyMesh.name = 'body';
        group.add(bodyMesh);

        // Hàm vẽ màn hình LED động
        function drawScreen(canvas, val) {
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, 512, 220);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 6;
          ctx.strokeRect(8, 8, 496, 204);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 28px monospace';
          ctx.fillText('DC AMMETER (0-10A)', 24, 48);
          ctx.fillStyle = '#ecfdf5';
          ctx.font = 'bold 84px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(Number(val).toFixed(2) + ' A', 484, 165);
        }

        var canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 220;
        drawScreen(canvas, 1.25);
        var tex = new THREE.CanvasTexture(canvas);

        var screenMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.2,
          emissive: new THREE.Color('#10b981'),
          emissiveIntensity: 0.22
        });

        var frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.086, 0.042), screenMat);
        frontScreen.name = 'scale_display';
        frontScreen.position.set(0, 0.092, 0.042);
        group.add(frontScreen);

        var rearScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.086, 0.042), screenMat);
        rearScreen.name = 'scale_display_rear';
        rearScreen.position.set(0, 0.092, -0.042);
        rearScreen.rotation.y = Math.PI;
        group.add(rearScreen);

        // 2 chốt cắm (-) và (+)
        var termGroup = new THREE.Group();
        termGroup.name = 'plunger';
        var negPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.007, 0.014, 16),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
        );
        negPost.rotation.x = Math.PI / 2;
        negPost.position.set(-0.024, 0.042, 0.046);
        termGroup.add(negPost);

        var posPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.007, 0.014, 16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
        );
        posPost.rotation.x = Math.PI / 2;
        posPost.position.set(0.024, 0.042, 0.046);
        termGroup.add(posPost);
        group.add(termGroup);

        group.userData.drawScreen = drawScreen;
        group.userData.screenCanvas = canvas;
        group.userData.screenTex = tex;
        return group;
      },

      updateEquipmentState: function(rootObject, state, dt) {
        var val = state && typeof state.multimeterValue === 'number' ? state.multimeterValue : 1.25;
        if (rootObject.userData && rootObject.userData.drawScreen && rootObject.userData.screenCanvas) {
          rootObject.userData.drawScreen(rootObject.userData.screenCanvas, val);
          if (rootObject.userData.screenTex) {
            rootObject.userData.screenTex.needsUpdate = true;
          }
        }
      },

      // Giữ tương thích song song v2.2 & v2.3
      buildEquipmentGroup: function(THREE, asset) {
        return this.buildEquipmentMesh(THREE, asset);
      },
      applyEquipmentState: function(THREE, rootObject, instance) {
        var st = instance && instance.instanceState ? instance.instanceState : {};
        this.updateEquipmentState(rootObject, st, 0.016);
      }
    };
  </script>
</body>
</html>
```

---

## PHẦN 5: PROMPT MẪU ĐỂ BẠN DÁN VÀO CHATGPT / CLAUDE TẠO HÀNG LOẠT FILE `.HTML`

Bạn chỉ cần copy đoạn Prompt dưới đây gửi cho ChatGPT / Claude:

> **Prompt tạo hàng loạt module `.html` cho OpenLab 3D:**
> "Hãy đóng vai kỹ sư mô phỏng 3D Three.js và giáo viên Khoa học Tự nhiên THCS. Dựa vào mẫu chuẩn `OL3D-HTML-MODULE-v2.3` ở trên, hãy tạo cho tôi các file `.html` độc lập cho danh sách thiết bị sau: [Điền danh sách thiết bị của bạn, ví dụ: 1. Vôn kế DC 0-20V, 2. Biến trở con chạy 20Ω, 3. Bình tam giác Erlenmeyer 250ml, 4. Nhiệt lượng kế kèm que khuấy].
> Yêu cầu bắt buộc cho mỗi file:
> 1. Có đủ 4 khối `#ol3d-module-manifest`, `#ol3d-module-icon`, `#ol3d-module-real-photo`, và `#ol3d-module-3d-script`.
> 2. Trong Three.js (`buildEquipmentMesh`), đơn vị là mét (`1mm = 0.001m`), điểm thấp nhất của thiết bị chạm mặt bàn tại `y = 0`, kích thước khớp với `geometry.boundingBoxM`.
> 3. Có các node tên chuẩn: `body`, `scale_display` (hiển thị số động qua `CanvasTexture` cả mặt trước và mặt sau `scale_display_rear`), và `plunger` hoặc `liquid_surface`.
> 4. Không gọi API mạng ngoài (`fetch`/`XMLHttpRequest`/`localStorage`) để vượt qua 7 cổng kiểm định tự động (7-Gate Validator)."
