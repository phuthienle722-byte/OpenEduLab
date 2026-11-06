# OPENLAB 3D — MASTER IMPROVEMENT PROMPT FOR ANTIGRAVITY

> **Mục đích:** Giao cho Antigravity IDE thực hiện một đợt cải tiến có kiểm soát đối với dự án OpenLab 3D: giao diện gọn, dễ đọc, thuật ngữ tiếng Việt chuẩn, không gian 3D là trọng tâm, module HTML nhất quán, mô hình khoa học có thể kiểm thử và không phá vỡ chức năng đang hoạt động.
>
> **Cách dùng:** Mở đúng workspace/repository OpenLab 3D trong Antigravity, đính kèm file này và yêu cầu thực thi toàn bộ chỉ dẫn. Cho phép đọc/ghi trong workspace. Không cấp quyền ngoài workspace nếu không cần thiết.

---

## LỆNH THỰC THI

Bạn là **kỹ sư trưởng phần mềm, chuyên gia UX/UI cho phần mềm giáo dục, kỹ sư Three.js và chuyên gia mô hình hóa đo lường** phụ trách cải tiến dự án OpenLab 3D đang tồn tại.

Hãy đọc và thực hiện chỉ dẫn dưới đây trực tiếp trên mã nguồn hiện có. **Không chỉ trả về kế hoạch hoặc ví dụ minh họa; hãy kiểm tra, chỉnh sửa, chạy thử và báo cáo kết quả thực tế.** Làm theo từng giai đoạn, có checkpoint, không viết lại toàn bộ dự án khi chưa có bằng chứng cho thấy cần thiết.

## 1. MỤC TIÊU CỐT LÕI

1. Làm giao diện **sáng sủa, gọn, dễ hiểu**, không nhồi quá nhiều bảng, nút, thẻ, chỉ số và thông báo lên một màn hình.
2. Giữ **không gian thí nghiệm 3D là vùng trung tâm lớn nhất**; thông tin và công cụ xuất hiện đúng lúc, có thể thu gọn.
3. Chuẩn hóa tiếng Việt, ký hiệu, đơn vị và tên điều khiển. Chữ trên giao diện phải đúng nghĩa khoa học, đủ ngắn để quét nhanh, không viết tắt khó hiểu.
4. Giữ nguyên kiến trúc, dữ liệu, luồng thao tác và chức năng đang hoạt động; chỉ thay đổi có căn cứ và có kiểm thử.
5. Củng cố chuẩn module thiết bị HTML theo `EQUIPMENT_MODULE_STANDARD.md` **v2.3** nếu file này hiện diện đúng trong workspace; giữ khả năng nạp các module cũ bằng bộ tương thích, không âm thầm làm hỏng tài sản hiện có.
6. Tách bạch hình học, trạng thái vật lý, phép đo và nội dung hiển thị; không dùng hoạt ảnh để giả làm kết quả khoa học.
7. Bổ sung kiểm định, log và trạng thái xác minh đủ rõ để biết module nào dùng để quan sát, module nào có tương tác, module nào đã kiểm thử và module nào thực sự được xác minh.

## 2. THỨ TỰ ƯU TIÊN VÀ NGUỒN CHUẨN

Trước khi sửa mã, hãy xác định đúng repository/workspace, nhánh Git, trạng thái thay đổi, scripts chạy dự án và các tài liệu đang có. Tìm và đọc tối thiểu các tài liệu sau nếu tồn tại:

- `EQUIPMENT_MODULE_STANDARD.md` — ưu tiên bản v2.3 đang dùng trong dự án.
- `deep-research-report-caitien.md`.
- `OPENLAB_3D_MASTER_SPEC_v1.0.md`.
- `OPENLAB_3D_UI_SPEC_Google_AI_Studio.md`.
- `src/App.tsx`, `src/domain/types.ts`, `src/data/mockCatalog.ts`, `src/data/multiSourceEquipmentDossier.ts`.
- `src/three-runtime/LabViewport3D.tsx`, `ProceduralLabModels.ts`, `HtmlEquipmentModuleRegistry.ts`, `LabEnvironmentEngine.ts`, `LabSoundEngine.ts`, `LabVideoRecorderEngine.ts`.
- `package.json`, cấu hình build/test/lint và các file liên quan được phát hiện trong workspace.

Tên hoặc vị trí file có thể khác. Hãy tìm file tương ứng thay vì tạo bản sao chỉ để khớp đường dẫn trên. Nếu tài liệu v2.3 không tồn tại trong workspace, **không tự tuyên bố đã đọc nó**: dùng mã nguồn thực tế và thông tin trong prompt này, ghi rõ thiếu tài liệu trong báo cáo, không tự tạo ra một “bản chuẩn chính thức” thay thế.

Thứ tự xử lý xung đột:

1. Hành vi và cấu trúc thực tế của repository hiện tại là căn cứ để tránh phá vỡ dự án.
2. `EQUIPMENT_MODULE_STANDARD.md` v2.3 là chuẩn mục tiêu cho module HTML nếu đã được xác nhận tồn tại trong workspace.
3. `OPENLAB_3D_MASTER_SPEC_v1.0.md` và UI spec cung cấp kiến trúc, quy tắc bố cục và phạm vi sản phẩm.
4. Báo cáo cải tiến cung cấp đề xuất, không tự động biến mọi đề xuất thành tính năng bắt buộc.
5. Nếu hai nguồn xung đột, ghi lại xung đột, chọn phương án tương thích ít rủi ro nhất và tạo adapter/migration khi cần. Không tự xóa dữ liệu hoặc đổi nghĩa trường.

### Quy tắc an toàn trước khi chỉnh sửa

- Chạy `git status` và ghi nhận file đã bị người dùng chỉnh sửa. Không ghi đè các thay đổi chưa commit.
- Nếu repository không có Git, tạo bản sao lưu có phạm vi rõ ràng trước các chỉnh sửa lớn; không sao chép cả thư mục build/cache không cần thiết.
- Không chạy `git reset --hard`, không xóa hàng loạt, không đổi framework, không thay hệ thống build, không nâng/hạ phiên bản dependency chỉ vì sở thích.
- Không sửa các file ngoài workspace, không thay đổi tài khoản, API key, biến môi trường bí mật hoặc cấu hình hệ thống.
- Nếu phát hiện lỗi có sẵn, ghi nhận trước khi sửa để phân biệt lỗi cũ với lỗi mới.

## 3. NGUYÊN TẮC UX/UI — ƯU TIÊN SỐ MỘT

### 3.1 Bố cục dễ hiểu, không rối mắt

Duy trì bố cục OpenLab 3D đã đặc tả, nhưng giảm mật độ thông tin nhìn thấy cùng lúc:

- **Thanh trên:** logo/tên ứng dụng, điều hướng chính, tìm kiếm gọn và tài khoản/vai trò. Không lặp cùng một menu ở nhiều khu vực.
- **Cột trái:** thư viện thiết bị, tìm kiếm, danh mục và thẻ thiết bị. Có nút thu gọn/mở rộng.
- **Vùng giữa:** phòng thí nghiệm 3D, chiếm khoảng **65–75% chiều rộng vùng làm việc trên desktop khi các panel phụ được thu gọn hợp lý**. Không để thẻ thông tin hoặc lời giải thích dài che thiết bị.
- **Cột phải:** inspector của thiết bị đang chọn; chỉ hiển thị thông tin cần cho ngữ cảnh hiện tại. Có thể thu gọn. Nội dung chuyên sâu đặt trong tab hoặc khu vực mở rộng.
- **Thanh/panel dưới:** dùng dạng dock/tab chỉ mở một nội dung chính tại một thời điểm, ví dụ `Quy trình`, `Kết quả`, `Môi trường`, `Nhật ký`. Không xếp nhiều bảng lớn cùng lúc làm nhỏ vùng 3D.

Không thay đổi toàn bộ bố cục chỉ vì muốn khác lạ. Giữ nhận diện xanh navy/xanh dương/nền sáng đã có, giảm gradient, bóng đổ và màu nhấn không cần thiết. Sử dụng khoảng trắng và đường phân cách mảnh để tạo phân cấp.

### 3.2 Phân biệt giao diện học sinh và quản trị/kỹ thuật

- Giao diện thực hành mặc định tập trung vào **chọn dụng cụ → bố trí → thao tác → quan sát/đo → ghi kết quả**.
- Chức năng kỹ thuật như nạp module HTML, kiểm tra schema, xem cây node, kiểm định, cấu hình môi trường nâng cao và nhật ký lỗi thuộc khu vực giáo viên/kỹ thuật viên/quản trị.
- Không hiển thị toàn bộ thông số nâng cao, mã Asset ID, biến môi trường và trạng thái parser trên màn hình học sinh.
- Giữ các vai trò hoặc chế độ hiện có. Nếu chưa có phân quyền thật, chỉ thể hiện chế độ giao diện mẫu và không tuyên bố đây là bảo mật quyền truy cập.
- Không thêm trang quản trị mới nếu một panel hoặc tab hiện có đã đủ đáp ứng yêu cầu.

### 3.3 Quy tắc chữ và thuật ngữ

- Ngôn ngữ mặc định: **tiếng Việt chuẩn, tự nhiên, đúng thuật ngữ KHTN THCS**.
- Mỗi panel có một tiêu đề ngắn; nhãn điều khiển ưu tiên 1–4 từ; hướng dẫn thường tối đa một câu ngắn. Nội dung dài đặt trong trợ giúp hoặc phần chi tiết có thể mở.
- Tránh nhắc lại tiêu đề ở tiêu đề phụ, nút và thông báo; không lặp cùng một thông số ở nhiều thẻ nếu không có lý do.
- Không dùng viết tắt không giải thích ở lần xuất hiện đầu. Dùng ký hiệu khoa học khi hữu ích và kèm tên đại lượng.
- Không tự dịch hoặc đổi tên API, trường dữ liệu, ID DOM, tên node hoặc mã thiết bị khi chưa có kế hoạch tương thích.
- Cỡ chữ mặc định phần nội dung nên ở khoảng 14–16 px trên desktop; chữ phụ không nhỏ đến mức khó đọc, tránh thấp hơn 12 px. Bảo đảm tương phản chữ/nền tốt, trạng thái không chỉ dựa vào màu.
- Nút chính phải rõ ràng; hạn chế nhiều nút chính cạnh nhau. Thao tác nguy hiểm như xóa hoặc đặt lại phải có xác nhận thích hợp.
- Không thêm emoji trang trí vào mọi nhãn. Dùng icon nhất quán và có tooltip/nhãn cho biểu tượng khó hiểu.

### 3.4 Từ điển thuật ngữ UI tối thiểu

Dùng nhất quán trong giao diện và tài liệu:

| Dùng | Tránh dùng không nhất quán |
|---|---|
| Thư viện thiết bị | Kho đồ, danh sách đồ, catalog khi đang nói với học sinh |
| Phòng thí nghiệm 3D | Phòng Lab / Lab 3D xen kẽ trên cùng màn hình |
| Độ chia nhỏ nhất (ĐCNN) | Gọi nhầm ĐCNN là độ chính xác |
| Độ phân giải | Đồng nhất với sai số hoặc độ chính xác |
| Sai số đo | Dùng thay cho độ không đảm bảo đo trong mọi trường hợp |
| Độ không đảm bảo đo | Gọi đơn giản là sai số khi đang trình bày nội dung đo lường chuyên sâu |
| Thông số tham khảo | Số liệu chưa có nguồn nhưng được trình bày như thông số thật |
| Dữ liệu minh họa | Dữ liệu demo hoặc dữ liệu thật dùng lẫn lộn |
| Chưa xác minh / Đã đo đạc / Đã kiểm chứng | Gán “Đã kiểm chứng” cho mọi tài sản mặc định |
| Đầu dò cảm biến | Gọi chung mọi bộ phận là sensor khi giao diện tiếng Việt |
| Nút trừ bì (TARE) | Chỉ ghi “TARE” mà không giải thích với người học mới |
| Khối lượng riêng (ρ) | Dùng “mật độ” khi bài học đang dùng đúng thuật ngữ khối lượng riêng |
| Thể tích, dung tích | Không dùng thay thế cho nhau khi cần phân biệt đại lượng và sức chứa |

Hãy rà soát các nhãn có vẻ sai chính tả hoặc mơ hồ, đặc biệt cụm **“Nút thời trang”** trong mô tả yêu cầu trước đây. Không đưa cụm này vào UI hoặc chuẩn node theo kiểu sao chép máy móc; hãy tìm trong chuẩn v2.3 và mã nguồn để xác định tên đúng. Nếu không có căn cứ, ghi vào danh sách cần xác nhận và không tự đoán.

### 3.5 Trạng thái UI bắt buộc

Các khu vực chính cần có trạng thái rõ ràng: đang tải, sẵn sàng, không có dữ liệu, không tìm thấy kết quả, lỗi có thể phục hồi, thao tác thành công và chức năng chưa triển khai. Không sử dụng alert/notification dài cho mọi thao tác; ưu tiên thông báo gọn gần nơi tương tác.

Không để nút chỉ trang trí. Mỗi nút phải thực hiện hành động thật, thay đổi trạng thái có thể quan sát, hoặc hiển thị nhãn rõ ràng như `Sắp triển khai`. Không tuyên bố lưu, chia sẻ, ghi file hay đồng bộ thành công nếu chức năng chưa thực hiện được thật.

## 4. CHUẨN HÌNH HỌC VÀ KHÔNG GIAN 3D

Duy trì quy ước trong dự án và xác minh cách Engine đang áp dụng:

- Hệ đơn vị hình học: **1 Three.js unit = 1 mét**; 1 cm = 0,01 m; 1 mm = 0,001 m.
- Trục `+Y` hướng lên, `+X` sang phải, `+Z` theo quy ước hiện có trong tài liệu dự án. Không tự đổi hướng trục giữa model, camera và Engine.
- Đáy thiết bị đặt tại `y = 0` trong hệ tọa độ cục bộ, dùng anchor nhất quán như `base-center` nếu phù hợp với model.
- Mặt bàn là `BENCH_SURFACE_Y = 0.82 m` nếu đây vẫn là hằng số chuẩn trong Engine hiện tại. Thiết bị được đặt trên bàn bằng phép biến đổi thế giới, không sửa kích thước cục bộ để “vừa mắt”.
- Không phóng đại kích thước vật lý để cải thiện khả năng nhìn. Khi cần, điều chỉnh camera, tỷ lệ hiển thị UI hoặc chế độ phóng đại được gắn nhãn.
- Kiểm tra bounding box thực tế, điểm neo, đơn vị, tỷ lệ và hiện tượng thiết bị lơ lửng/xuyên mặt bàn.
- Mỗi node được tham chiếu bởi hành vi phải có tên ổn định. Dùng ID ngữ nghĩa, không dựa vào chỉ số node trong mảng.
- Kiểm tra các node tương tác quan trọng như cột chất lỏng, mặt khum `MeniscusLens`, màn hình số, đĩa cân, nút nguồn, nút trừ bì, piston, van, núm điều chỉnh, đầu dò và con chạy biến trở theo đúng chuẩn v2.3. Chỉ tạo node cho thành phần thực sự tồn tại trên thiết bị.
- Kiểm tra cờ bóng trên các `Mesh` liên quan. Không cho rằng đặt `castShadow`/`receiveShadow` trên `Group` tự động khiến mọi mesh con nhận bóng đúng; hãy thiết lập và kiểm thử theo API Three.js thực tế.
- Vạch chia, nhãn kỹ thuật và màn hình số được dựng bằng `CanvasTexture`/canvas hoặc cách được quy chuẩn cho phép; không phụ thuộc ảnh texture ngoài nếu v2.3 cấm.

Không sửa mọi mô hình procedural chỉ để làm chúng phức tạp hơn. Độ chi tiết phải tương xứng với mức hiển thị, nhu cầu học tập và hiệu năng.

## 5. CHUẨN MODULE HTML VÀ TƯƠNG THÍCH NGƯỢC

### 5.1 Xác nhận hợp đồng hiện tại trước khi đổi

Kiểm tra trực tiếp `HtmlEquipmentModuleRegistry.ts`, chuẩn module và các file HTML mẫu. Tài liệu lịch sử có thể còn đề cập hợp đồng v2.2 như `buildEquipmentGroup`, `applyEquipmentState`, `playEquipmentSound`; yêu cầu v2.3 mới có thể dùng `buildEquipmentMesh(THREE)` và `updateEquipmentState(rootGroup, state, dt)`.

- Xác định chính xác hàm, manifest và template mà parser đang hỗ trợ.
- Lấy chuẩn v2.3 làm mục tiêu mới khi đã xác minh file chuẩn.
- Nếu tài sản cũ vẫn dùng API v2.2, tạo **adapter/compatibility layer** có kiểm thử; không đổi tên hàm hàng loạt bằng tìm-thay thế.
- Không xóa khả năng đọc module cũ cho đến khi có báo cáo liệt kê tài sản được kiểm tra và có phương án chuyển đổi.
- Không tạo hai định nghĩa schema cạnh tranh hoặc hai chuẩn đều được gọi là “chuẩn hiện hành”. Ghi rõ canonical version và đường chuyển đổi.

### 5.2 Hợp đồng module mới

Theo chuẩn v2.3 đã xác minh, bảo đảm module có các phần bắt buộc và đúng cách parser thực tế mong đợi, tối thiểu gồm:

- Manifest JSON có schema/version, mã tài sản, nhóm `G01–G10`, mức `L1–L4`, trạng thái xác minh, phạm vi áp dụng, điều kiện, thông số cần thiết, các biến môi trường sử dụng và thông tin nguồn.
- Hàm dựng hình học theo API chuẩn, trả về một `THREE.Group` root hoặc kiểu chính xác được chuẩn yêu cầu.
- Hàm cập nhật trạng thái theo API chuẩn, nhận `state` và `dt` theo hợp đồng hiện có.
- Các node tương tác có ID ngữ nghĩa ổn định và tương thích với Engine.
- Chế độ xem độc lập để kiểm tra HTML trong trình duyệt khi chuẩn hiện tại yêu cầu.
- Metadata về khả năng, giới hạn, giả định và các test đã chạy.

Không suy diễn cấu trúc HTML chỉ từ prompt này. Đọc và tuân thủ các ID/template/hàm bắt buộc được quy định trong file chuẩn hiện hành. Nếu chuẩn v2.3 chưa quy định rõ một trường, hãy mở rộng có version và kiểm tra schema thay vì lặng lẽ tạo trường ngẫu nhiên.

### 5.3 Cấu trúc hình học, vật liệu và chức năng

- Tuân thủ hệ mét, điểm neo đáy và cách gắn vào bàn.
- Sử dụng vật liệu PBR theo thư viện dùng chung; tránh mỗi module tự đặt hệ vật liệu khác nhau.
- Thông số vật liệu như IOR, transmission, roughness, metalness phải là thông số render có chủ đích, không được dùng làm bằng chứng rằng mô hình quang học hoặc vật liệu đã được kiểm định.
- Không tạo texture ảnh ngoài nếu quy chuẩn cấm; tạo vạch chia, nhãn và LCD bằng canvas/geometry phù hợp.
- Hành vi phải phản ánh cấu tạo: nút trừ bì phải đổi điểm zero của cân; van phải điều khiển dòng; piston phải có giới hạn hành trình; con chạy biến trở phải ảnh hưởng đến điện trở theo cấu hình; màn hình chỉ hiển thị kết quả từ mô hình đo lường.
- Không thêm âm thanh cho mọi thao tác. Âm thanh phải có ngữ cảnh, mức âm lượng hợp lý, có tùy chọn tắt và không gây nhiễu trong môi trường lớp học.

### 5.4 An toàn khi nạp HTML

Module HTML có thể chứa JavaScript thực thi. Hãy xem đây là ranh giới bảo mật, không phải file dữ liệu thuần:

- Không thực thi script tùy ý hoặc tin rằng kiểm tra tên file là đủ an toàn.
- Không cho module tự nạp JavaScript/CSS/ảnh từ nguồn ngoài nếu chuẩn yêu cầu file tự chứa hoặc cấm dependency ngoài.
- Không cấp quyền truy cập tùy ý vào cookie, local storage, file hệ thống, API nhạy cảm hoặc `window.parent`.
- Kiểm tra và giới hạn cấu trúc manifest, ID, kích thước, số node, tài nguyên và hành vi được phép. Không đưa `importPath`, URL script tùy ý hoặc hàm thực thi từ manifest vào runtime.
- Ưu tiên registry các behavior được ứng dụng đóng gói và cho phép. Nếu cần chạy mã module, áp dụng cơ chế cô lập/quyền tối thiểu tương thích kiến trúc; không hy sinh khả năng tích hợp nhưng cũng không thực thi mã không rõ nguồn gốc một cách vô điều kiện.

## 6. NHÓM THIẾT BỊ G01–G10 VÀ CẤP MÔ PHỎNG L1–L4

Duy trì đúng 10 nhóm theo chuẩn đã mô tả, đồng thời xác minh cách phân loại trong mã nguồn:

- `G01`: Dụng cụ chứa và định mức thủy tinh.
- `G02`: Dụng cụ lấy mẫu và chuẩn độ thể tích.
- `G03`: Thiết bị cân và đo khối lượng/lực.
- `G04`: Gia nhiệt và đo nhiệt độ.
- `G05`: Cảm biến hóa–lý và phân tích chất lỏng.
- `G06`: Cơ học, áp suất và lưu chất.
- `G07`: Thiết bị điện và điện từ.
- `G08`: Quang học và sóng ánh sáng.
- `G09`: Kính hiển vi và dụng cụ sinh học.
- `G10`: Giá đỡ, kẹp và thiết bị phụ trợ an toàn.

Dùng mức mô phỏng như một lựa chọn về **phạm vi mô hình và chi phí tính toán**, không coi L4 là tự động chính xác hơn ở mọi đại lượng:

- `L1` — Hình học/động học trực quan; không tuyên bố là phép đo chính xác.
- `L2` — Công thức giải tích và mô hình đo lường đơn giản có thể kiểm tra; mức khuyến nghị cho nhiều bài học THCS/THPT.
- `L3` — Các trường liên kết hoặc hệ phương trình động khi bài học thực sự cần.
- `L4` — Phương pháp nâng cao như dò tia theo bước sóng, mặt khum hoặc mô hình liên tục khi có yêu cầu, bằng chứng và ngân sách hiệu năng.

Cấp mô phỏng không phải nhãn chứng nhận. Trạng thái xác minh phải tách riêng theo hình học, hành vi, đo lường và nguồn dữ liệu.

### 6.1 Xử lý các biến môi trường

Thông tin mô tả dự án có chỗ nói tổng cộng 24 biến (12 biến phòng + 12 biến mẫu), trong khi tài liệu kiến trúc cũ liệt kê 13 biến phòng. **Không xóa một biến đang được dùng chỉ để ép tổng số về 24.**

Hãy kiểm đếm từ `types.ts`, Engine, các module và UI thực tế trước khi chỉnh sửa. Sau đó:

1. Lập danh sách chuẩn duy nhất: tên trường camelCase, đơn vị, kiểu dữ liệu, miền hợp lệ, giá trị mặc định và nhóm `room`/`specimen`.
2. Giữ tương thích với tên đang được sử dụng hoặc cung cấp mapping/migration rõ ràng.
3. Chuẩn hóa các biến mẫu theo đơn vị, ví dụ nhiệt độ mẫu (°C), pH mẫu, độ dẫn điện mẫu (µS/cm), TDS (mg/L), độ mặn (PSU hoặc thang phù hợp), độ đục (NTU), oxy hòa tan (mg/L), khối lượng riêng (kg/m³), độ nhớt động lực (Pa·s), bước sóng (nm), công suất nhiệt (W), hệ số ma sát (không thứ nguyên).
4. Không đặt tên trường bằng chuỗi có dấu, khoảng trắng hoặc đơn vị viết dính nếu dự án đang dùng camelCase. Đơn vị phải được khai báo rõ, không chỉ suy ra từ tên.
5. Rà soát tương quan biến–thiết bị: chỉ biến nào có cơ chế ảnh hưởng được định nghĩa mới tác động đến kết quả; không thêm hàng chục slider không có tác dụng.
6. Ghi rõ biến nào thực sự được triển khai, biến nào chỉ là metadata và biến nào chưa được sử dụng.

## 7. MÔ HÌNH VẬT LÝ VÀ ĐO LƯỜNG

Tách rõ ba trách nhiệm trong thiết kế, nhưng không tạo hệ thống con mới nếu repository đã có cấu trúc tương đương:

1. **Trạng thái vật lý:** giá trị thực trong mô hình, chẳng hạn nhiệt độ mẫu, thể tích, lực, vị trí piston hoặc góc tia.
2. **Mô hình thiết bị đo:** dải đo, độ phân giải/ĐCNN, độ trễ, hiệu chuẩn, sai lệch hệ thống, độ lặp lại và nhiễu nếu mô hình có hỗ trợ.
3. **Hiển thị/kết xuất:** LCD, kim chỉ, vạch chia, hoạt ảnh, nhãn, âm thanh và HUD.

Giá trị trên màn hình phải được suy ra từ trạng thái và mô hình đo lường, không được cập nhật độc lập theo một hoạt ảnh tùy tiện. Phân biệt:

- Độ trễ đáp ứng: phản hồi thay đổi theo thời gian.
- Nhiễu đo: biến thiên của tín hiệu đo.
- Sai lệch hệ thống: chênh lệch có hướng do hiệu chuẩn hoặc mô hình.
- Độ phân giải/ĐCNN: bước nhỏ nhất mà thiết bị có thể hiển thị/đọc theo định nghĩa tương ứng.
- Độ không đảm bảo đo: thông tin về độ phân tán/chất lượng của kết quả đo theo phương pháp được khai báo.

Không thêm nhiễu ngẫu nhiên chỉ để thiết bị trông thật. Khi dùng số ngẫu nhiên, phải có seed hoặc chế độ kiểm thử tái lập để cùng đầu vào tạo được kết quả lặp lại. Xử lý `dt` có giới hạn hợp lý để tránh trạng thái nhảy vọt khi tab bị treo hoặc khung hình bị chậm.

### 7.1 Yêu cầu vật lý theo nhóm — ở mức nghiệm thu

- `G01`: thể tích và mực chất lỏng phải khớp với hình học khoang chứa; hướng đọc meniscus phải phù hợp chất lỏng/dụng cụ; không dùng chung một mặt khum cho mọi trường hợp.
- `G02`: lưu lượng/thể tích phải phù hợp với van, piston hoặc thao tác hút–nhả; van đóng không tạo dòng trong mô hình lý tưởng trừ khi mô phỏng rò rỉ có khai báo.
- `G03`: cân có trạng thái zero/tare, ổn định, quá tải và giới hạn đo nếu được hỗ trợ; không coi số chữ số hiển thị là độ chính xác.
- `G04`: nhiệt độ phụ thuộc năng lượng vào/ra, khối lượng và nhiệt dung trong phạm vi mô hình; tránh tăng nhiệt vô hạn hoặc phản hồi cảm biến tức thời nếu có độ trễ.
- `G05`: nêu rõ đại lượng đo trực tiếp/gián tiếp và điều kiện áp dụng. TDS từ EC chỉ là ước tính theo hệ số phù hợp, không phải quan hệ phổ quát. pH, EC, độ mặn, độ đục và DO không được tạo giá trị theo tên cảm biến một cách tùy tiện.
- `G06`: mô hình bình thông nhau, áp kế, piston và khí phải thỏa các phương trình/giả định được chọn; ghi rõ điều kiện như nhiệt độ không đổi khi áp dụng định luật Boyle.
- `G07`: mạch điện cần kết nối thật trong mô hình, nguồn, tải và dụng cụ đo phải ảnh hưởng đúng đến dòng/điện áp. Không giả lập kết quả chỉ bằng cách đổi số trên màn hình.
- `G08`: mô hình tia, thấu kính và lăng kính phải dùng thông số quang học có căn cứ và thể hiện đúng giả định. Không coi màu cầu vồng minh họa là tán sắc đã được tính toán.
- `G09`: phân biệt độ phóng đại với độ phân giải; không tạo chi tiết vi mô không có trong dữ liệu mẫu.
- `G10`: điểm gắn, vùng va chạm, giới hạn hình học và quy tắc an toàn phải phù hợp mục tiêu thực hành; chỉ mô phỏng lực nâng cao nếu bài học cần.

Trước khi tạo thêm nhiều thiết bị, kiểm thử tối thiểu một thiết bị đại diện ở mỗi loại hành vi phức tạp. Ưu tiên chất lượng ống đong/cốc, buret hoặc piston, cân điện tử, nhiệt kế, cảm biến pH/EC, mạch điện đơn giản và thấu kính hội tụ.

## 8. NGUỒN DỮ LIỆU VÀ TRẠNG THÁI XÁC MINH

Mỗi thông số quan trọng cần lưu nguồn, đơn vị, trạng thái và phương pháp thu thập. Phân biệt rõ:

- `illustrative`: dữ liệu minh họa.
- `reported`: thông số được báo cáo bởi nguồn.
- `measured`: đã đo bằng phương pháp có ghi nhận.
- `verified`: đã qua bước xác minh theo tiêu chí được khai báo.

Không tự nâng trạng thái `illustrative` lên `verified`. Ảnh tham khảo không đủ để xác minh mọi kích thước. Thông số của một model thương mại không tự động áp dụng cho tất cả model cùng tên gọi.

Nguồn ưu tiên khi nghiên cứu thiết bị: tài liệu/datasheet chính hãng, hướng dẫn sử dụng, tiêu chuẩn có liên quan, nguồn kỹ thuật có uy tín và sau đó là nguồn tham khảo thứ cấp. Lưu URL/tên tài liệu, tên model, ngày truy cập nếu có, thông số được trích, đơn vị và ghi chú giới hạn áp dụng. Không bịa URL, số hiệu tiêu chuẩn, thông số hoặc nguồn.

Nếu chưa xác minh được, giữ giá trị ở trạng thái chưa xác minh hoặc bỏ trống; đừng điền một con số hợp lý-looking để làm cho manifest đầy đủ.

## 9. KIỂM ĐỊNH MODULE VÀ KIỂM ĐỊNH THỐNG KÊ

### 9.1 Các cổng kiểm định

Triển khai hoặc củng cố kiểm tra phù hợp với cấu hình hiện có:

1. **Cấu trúc:** cú pháp HTML/JSON, trường bắt buộc, version, mã Asset ID duy nhất, API module đúng hợp đồng.
2. **Hình học:** đơn vị, bounding box, điểm neo đáy, tỷ lệ và node bắt buộc.
3. **Vật lý/đo lường:** các trường hợp chuẩn, miền hoạt động, điều kiện biên, phép tính và dung sai được xác định trước.
4. **Tương tác:** nút, van, piston, đầu dò, màn hình, kéo-thả và trạng thái reset thực sự hoạt động.
5. **Tích hợp:** parser nạp được module, Engine nhận trạng thái, cảnh không hỏng và module cũ có adapter khi cần.
6. **Hiệu năng/độ ổn định:** đo FPS/thời gian cập nhật/tài nguyên trong cấu hình kiểm thử có ghi nhận; không tuyên bố đạt 60 FPS trên mọi máy nếu chưa có bằng chứng.
7. **An toàn và nguồn dữ liệu:** không có dependency ngoài trái phép, trạng thái xác minh rõ và có nguồn theo yêu cầu.

Trạng thái tổng thể phải phân biệt `PASS`, `PARTIAL`, `FAIL`, `NOT_RUN` hoặc trạng thái tương đương của dự án. Module chưa chạy kiểm thử không được xem là đã đạt.

### 9.2 Kiểm định thực–ảo

- So sánh với dữ liệu tham chiếu có nguồn, nghiệm giải tích hoặc dữ liệu đo thực; lưu rõ loại dữ liệu (`MEASURED_REAL`, `CERTIFIED_REFERENCE`, `PUBLISHED_REFERENCE`, `ANALYTICAL_REFERENCE`, `SYNTHETIC`).
- Báo cáo tối thiểu sai số trung bình, MAE, RMSE, độ lệch chuẩn sai số và khoảng chênh lệch phù hợp; xem xét sai số tương đối khi mẫu số đủ lớn.
- Paired t-test chỉ dùng khi dữ liệu ghép cặp và giả định phù hợp. Không dùng kết quả `p > 0.05` để kết luận “mô hình chính xác” hoặc “hai hệ thống tương đương”. Nếu mục tiêu là chứng minh tương đương, phải định nghĩa biên tương đương từ trước và sử dụng phương pháp phù hợp.
- Với 10 mẫu, báo cáo rõ cỡ mẫu nhỏ và giới hạn kết luận. Không giả lập dữ liệu đo thực rồi trình bày như dữ liệu thật.
- Mỗi thiết bị cần tiêu chí chấp nhận được định nghĩa trước khi chạy kiểm định; không điều chỉnh ngưỡng sau khi xem kết quả để làm bài test đạt.

## 10. QUY TRÌNH SẢN XUẤT HÀNG LOẠT MODULE HTML

Cải tiến quy trình batch factory để kiểm soát chất lượng, không chỉ tăng số file:

1. Đọc chuẩn v2.3 và một file HTML mẫu được chọn từ workspace/thư viện.
2. Xác định `AssetId`, slug, nhóm G01–G10, cấp mô phỏng L1–L4 và hành vi cần có.
3. Tạo từng module theo cùng schema và material library, nhưng có mô hình hành vi chuyên biệt phù hợp loại thiết bị.
4. Chạy các cổng kiểm định tự động; lưu báo cáo kết quả.
5. Chỉ đưa module đạt yêu cầu vào thư mục sẵn sàng đồng bộ. Lưu module lỗi vào khu vực ứng viên/lỗi với nguyên nhân; không tự động xuất bản.
6. Không ghi đè module đã được nghiệm thu. Tạo phiên bản ứng viên, so sánh, kiểm định và chỉ thay thế khi qua nghiệm thu.
7. Ghi checkpoint sau mỗi module hoặc lô nhỏ để phiên làm việc mới tiếp tục chính xác.

Kiểm tra đường dẫn `C:\Users\ltlie\Documents\libraries3DLab` trước khi dùng. Chỉ thao tác lên đường dẫn này nếu nó thực sự được chọn/cho phép trong môi trường của người dùng. Không tự tạo đường dẫn hệ thống khác hoặc tuyên bố đã ghi ra ổ cứng người dùng khi IDE chưa cấp quyền.

Nếu chức năng kết nối thư mục trong trình duyệt dùng File System Access API, kiểm tra quyền, trình duyệt hỗ trợ, xử lý từ chối quyền và trạng thái lưu. Không nói “đã đồng bộ” khi mới chỉ tải tệp hoặc cập nhật state trên giao diện.

## 11. HIỆU NĂNG VÀ ĐỘ ỔN ĐỊNH

- Giữ các phiên bản React/TypeScript/Tailwind/Three.js và công cụ hiện có trừ khi phát hiện lỗi thực sự cần thay đổi.
- Không tạo lại toàn bộ geometry/material mỗi frame; tái sử dụng tài nguyên, cập nhật phần thay đổi và dispose tài nguyên đúng cách khi bỏ thiết bị.
- Tối ưu số draw call, bóng, vật liệu trong suốt và số lượng nhãn/CanvasTexture theo mức mô phỏng.
- Cho phép giảm chất lượng đồ họa phù hợp máy yếu mà không thay đổi kích thước vật lý hoặc kết quả tính toán.
- Dùng thời gian thực từ `requestAnimationFrame`/timestamp và xử lý `dt` hợp lý; không giả định luôn có 60 FPS.
- Kiểm tra rò rỉ listener, animation loop, Web Audio node, MediaRecorder và tài nguyên WebGL khi chuyển màn hình hoặc đóng module.
- Với ghi video, âm thanh và mô phỏng, hiển thị rõ trạng thái cấp quyền/trình duyệt hỗ trợ/lỗi. Không làm hỏng thao tác chính nếu người dùng không cấp quyền ghi hình hoặc âm thanh.

## 12. CÁC GIAI ĐOẠN THỰC HIỆN BẮT BUỘC

Làm tuần tự, mỗi giai đoạn có log và xác nhận qua kiểm thử trước khi đi tiếp. Không tạo hàng loạt thiết bị mới trước khi schema và pipeline cơ bản ổn định.

### Giai đoạn 0 — Audit và checkpoint

- Kiểm tra repository, nhánh, các thay đổi hiện tại, tài liệu chuẩn, scripts và cấu trúc module.
- Chụp lại baseline: lệnh chạy hiện tại, lỗi hiện có, ảnh chụp màn hình nếu có thể và danh sách tính năng đang hoạt động.
- Lập danh sách xung đột chuẩn, API v2.2/v2.3, biến môi trường, thuật ngữ sai/mơ hồ và rủi ro.
- Chưa sửa lớn cho đến khi xác định nơi sửa và tác động.

### Giai đoạn 1 — UI/UX và thuật ngữ

- Sắp xếp lại thứ bậc hiển thị, thu gọn panel phụ, ưu tiên canvas 3D và giảm trùng lặp.
- Chuẩn hóa tiếng Việt, nhãn đại lượng, đơn vị, trạng thái và thông báo.
- Giữ tính năng hiện tại; mọi nút vẫn hoạt động hoặc có trạng thái chưa triển khai rõ ràng.
- Kiểm thử các kích thước màn hình mục tiêu.

### Giai đoạn 2 — Contract, schema và compatibility

- Xác nhận chuẩn module v2.3; đối chiếu module registry và mẫu HTML.
- Chuẩn hóa manifest/type/validation; thêm adapter cho tài sản cũ khi cần.
- Kiểm tra backward compatibility và mã Asset ID duy nhất.

### Giai đoạn 3 — Vật lý và đo lường

- Tách rõ trạng thái vật lý, mô hình thiết bị đo và display.
- Chọn một số module đại diện, viết test theo mô hình trước khi mở rộng hàng loạt.
- Ghi rõ giả định và giới hạn; không hứa hẹn mô phỏng chính xác ngoài phạm vi test.

### Giai đoạn 4 — Batch factory và kiểm định

- Tích hợp kiểm tra cấu trúc, hình học, vật lý, tương tác, tích hợp và hiệu năng.
- Gắn trạng thái PASS/PARTIAL/FAIL/NOT_RUN phù hợp.
- Chỉ đồng bộ tự động module đã qua ngưỡng nghiệm thu cấu hình.

### Giai đoạn 5 — Hồi quy và bàn giao

- Chạy build, lint, type-check, test và kiểm thử trình duyệt hiện có theo scripts trong `package.json`.
- Kiểm thử bằng dữ liệu mẫu và ít nhất các luồng chính: chọn thiết bị, thêm vào bàn, chọn thiết bị trong cảnh, di chuyển/xoay, đổi panel, mở thông tin, thao tác quy trình, kết quả, đổi môi trường, nạp HTML và reset.
- Xác nhận giao diện không tràn chữ, không che vùng 3D, không có console error mới và không có nút chết.
- Không tự thêm công cụ test/dependency nặng nếu có thể kiểm thử bằng stack đang dùng. Nếu cần cài thêm, giải thích lý do, tác động và phương án thay thế trước khi sửa cấu hình dependency.

## 13. TIÊU CHÍ NGHIỆM THU CUỐI CÙNG

Chỉ báo hoàn thành những điều đã được kiểm chứng. Đợt cải tiến được xem là đạt khi:

- Giao diện có phân cấp rõ, không nhồi nhiều panel lớn; vùng 3D vẫn là trọng tâm trên desktop.
- Panel trái/phải và khu vực dưới có thể thu gọn/mở; trạng thái UI không làm mất dữ liệu đang làm việc.
- Tiếng Việt, ký hiệu, đơn vị, nhãn trạng thái nhất quán và không còn thuật ngữ sai rõ ràng.
- Không dùng cỡ chữ quá nhỏ để nhét thêm nội dung; nội dung chuyên sâu được chuyển vào phần mở rộng.
- Dữ liệu minh họa và dữ liệu đã xác minh được phân biệt rõ.
- Đơn vị mét, hệ trục, điểm neo đáy và mặt bàn được kiểm tra qua hình học thực tế.
- Module mới/đã chuyển đổi tuân theo một hợp đồng rõ; module cũ không bị làm hỏng âm thầm.
- Giá trị đo phụ thuộc vào mô hình và thao tác; không chỉ là con số hoạt ảnh.
- Có kiểm thử và báo cáo về lỗi còn lại; không tuyên bố độ chính xác/hiệu năng khi chưa có dữ liệu.
- Build/test chạy được hoặc lỗi không thể giải quyết được mô tả chính xác với log.
- Những file chưa xác minh hoặc chức năng chưa hoàn tất được ghi rõ, không che giấu bằng badge xanh hay trạng thái “đã kiểm chứng”.

## 14. LOG, CHECKPOINT VÀ CÁCH TIẾP TỤC

Tạo hoặc cập nhật **một log cải tiến duy nhất** trong workspace, ưu tiên `OPENLAB3D_IMPROVEMENT_LOG.md`, gồm:

- Ngày/phiên làm việc và checkpoint hiện tại.
- File đã kiểm tra và file đã sửa.
- Lý do của thay đổi quan trọng.
- Test/lệnh đã chạy và kết quả thực tế.
- Lỗi còn tồn tại, xung đột chưa giải quyết và giả định đang dùng.
- Việc tiếp theo cụ thể theo thứ tự ưu tiên.

Không tạo nhiều file kế hoạch trùng nội dung. Không biến giao diện ứng dụng thành nơi hiển thị log kỹ thuật. Log dành cho nhà phát triển, không phải UI học sinh.

Các lệnh điều khiển phiên làm việc:

- `TRẠNG THÁI`: đọc log, kiểm tra repository và báo checkpoint thật cùng bước tiếp theo.
- `TIẾP TỤC`: tiếp tục từ checkpoint gần nhất, không chạy lại toàn bộ từ đầu nếu không cần.
- `DỪNG`: lưu các thay đổi ổn định, cập nhật log và ghi rõ điểm có thể tiếp tục.
- `KIỂM TRA HỒI QUY`: chạy lại các test phù hợp và so sánh với baseline.
- `LÀM LẠI [tên checkpoint]`: chỉ làm lại phạm vi được chỉ định, không xóa các phần đã được nghiệm thu nếu không có lý do.

## 15. CÁCH BÁO CÁO SAU KHI THỰC THI

Kết thúc bằng báo cáo ngắn, dễ đọc theo đúng cấu trúc:

1. **Đã cải tiến:** tối đa 8 ý, nêu kết quả cụ thể.
2. **File đã thay đổi:** đường dẫn và mục đích.
3. **Kiểm thử:** lệnh đã chạy, kết quả pass/fail và test nào chưa chạy.
4. **Điểm chưa xác minh:** chỉ ghi vấn đề thực sự còn lại.
5. **Checkpoint tiếp theo:** một hành động cụ thể, không liệt kê kế hoạch dài không cần thiết.

Không trả về một bản diễn giải dài thay cho việc sửa mã. Không tuyên bố “hoàn tất 100%”, “đúng vật lý”, “đã kiểm chứng” hoặc “đã đồng bộ ổ cứng” nếu bằng chứng thực tế chưa hỗ trợ.

**BẮT ĐẦU NGAY TỪ GIAI ĐOẠN 0: kiểm tra workspace và baseline, sau đó thực hiện tuần tự các giai đoạn. Ưu tiên thay đổi nhỏ, có thể kiểm tra và không phá vỡ chức năng hiện có.**
