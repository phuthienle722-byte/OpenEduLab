/**
 * Google Apps Script - WebHub Showcase Cloud Backend
 * WebHub bây giờ quản lý 2 TAB trên Google Sheets:
 *   1. WEBHUB_PROJECTS      -> Các mô phỏng ĐÃ DUYỆT (nổi tiếng + bài cộng đồng) đang hiển thị.
 *   2. WEBHUB_SUBMISSIONS   -> Các DỰ ÁN MỚI do người dùng đăng tải (chờ duyệt / từ chối)
 *                              để admin quản lý NHẬP - XÓA ngay trên bảng tính.
 * 
 * HƯỚNG DẪN CÀI ĐẶT 4 BƯỚC:
 * 1. Mở file Google Sheets mới trên Google Drive (đặt tên ví dụ: WebHub_Database).
 * 2. Chọn menu: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết mã cũ trong file Code.gs, dán toàn bộ đoạn code này vào và bấm "Lưu" (Ctrl+S).
 * 4. Bấm nút "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web App)
 *    - Mô tả: WebHub Sync API
 *    - Thực thi dưới dạng: "Tôi" (Me)
 *    - Người có quyền truy cập: "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG ĐỂ TRUY XUẤT ĐƯỢC!
 * 5. Bấm "Triển khai" (Deploy), cấp quyền và sao chép "URL ứng dụng web" (Web App URL)
 *    (có dạng: https://script.google.com/macros/s/.../exec) dán vào ô trên website!
 *
 * 6. MUỐN NẠP SẴN 17 MÔ PHỎNG NỔI TIẾNG VÀO SHEET: chọn hàm seedFamousData
 *    trong dropdown rồi bấm "Run" (Chạy) 1 lần duy nhất!
 */

const MAIN_SHEET = "WebHub_Projects";
const SUBMISSION_SHEET = "WebHub_Submissions";

const HEADERS = [
  "ID",
  "Title",
  "URL",
  "Description",
  "Country",
  "Category",
  "EducationLevel",
  "Status",
  "IsFamous",
  "AuthorName",
  "AuthorContact",
  "CreatedAt",
  "PreviewImage",
  "Tags",
  "Views",
  "Likes",
  "IsUserSubmission",
  "GoLink"
];

function ensureSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4338CA"); // Indigo 700
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140); // ID
    sheet.setColumnWidth(2, 220); // Title
    sheet.setColumnWidth(3, 260); // URL
    sheet.setColumnWidth(4, 280); // Description
    sheet.setColumnWidth(8, 100); // Status
    sheet.setColumnWidth(9, 100); // IsFamous
  }
  return sheet;
}

// Đọc toàn bộ dữ liệu của 1 tab thành danh sách project (tự nhận diện cột theo tên)
function parseRows(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { rows: [] };
  const headers = data[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const col = function (name, defaultIdx) {
    const idx = headers.indexOf(name.toLowerCase());
    return idx >= 0 ? idx : defaultIdx;
  };
  const projects = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[col("id", 0)] && !row[col("title", 1)] && !row[col("url", 2)]) continue;
    const rawFamous = row[col("isfamous", 8)];
    const isFamous = (
      rawFamous === true ||
      String(rawFamous).toUpperCase() === "TRUE" ||
      String(rawFamous).toUpperCase() === "YES" ||
      rawFamous === 1 ||
      String(rawFamous) === "1"
    );
    const rawUserSubmission = row[col("isusersubmission", 16)];
    const isUserSubmission = (
      rawUserSubmission === true ||
      String(rawUserSubmission).toUpperCase() === "TRUE" ||
      String(rawUserSubmission).toUpperCase() === "YES" ||
      rawUserSubmission === 1 ||
      String(rawUserSubmission) === "1"
    );
    projects.push({
      id: String(row[col("id", 0)] || ("proj-" + i)),
      title: String(row[col("title", 1)] || ""),
      url: String(row[col("url", 2)] || ""),
      description: String(row[col("description", 3)] || ""),
      country: String(row[col("country", 4)] || "VN"),
      category: String(row[col("category", 5)] || "general"),
      educationLevel: String(row[col("educationlevel", 6)] || "all"),
      status: String(row[col("status", 7)] || "approved"),
      isFamous: isFamous,
      isUserSubmission: isUserSubmission,
      authorName: String(row[col("authorname", 9)] || (isFamous ? "Nền tảng quốc tế" : "Thành viên")),
      authorContact: String(row[col("authorcontact", 10)] || ""),
      createdAt: row[col("createdat", 11)] ? (row[col("createdat", 11)] instanceof Date ? row[col("createdat", 11)].toISOString() : String(row[col("createdat", 11)])) : new Date().toISOString(),
      previewImage: String(row[col("previewimage", 12)] || ""),
      tags: row[col("tags", 13)] ? String(row[col("tags", 13)]).split(",").map(function (t) { return t.trim(); }) : [],
      views: Number(row[col("views", 14)] || 0),
      likes: Number(row[col("likes", 15)] || 0),
      goLink: String(row[col("golink", 17)] || "")
    });
  }
  return { rows: projects };
}

// Chuyển project thành 1 hàng 17 cột
function projectToRow(p) {
  return [
    p.id || ("proj-" + new Date().getTime()),
    p.title || "",
    p.url || "",
    p.description || "",
    p.country || "VN",
    p.category || "general",
    p.educationLevel || "all",
    p.status || "approved",
    p.isFamous ? true : false,
    p.authorName || "Thành viên",
    p.authorContact || "",
    p.createdAt || new Date().toISOString(),
    p.previewImage || "",
    Array.isArray(p.tags) ? p.tags.join(", ") : "",
    p.views || 0,
    p.likes || 0,
    p.isUserSubmission ? true : false,
    p.goLink || ""
  ];
}

// Thêm mới hoặc ghi đè toàn bộ hàng của 1 project theo ID
function upsertRow(sheet, project) {
  const row = projectToRow(project);
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(project.id)) { foundRow = i; break; }
  }
  if (foundRow >= 0) {
    sheet.getRange(foundRow + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

// Xóa các hàng theo danh sách ID, trả về số dòng đã xóa
function deleteRowsById(sheet, ids) {
  const data = sheet.getDataRange().getValues();
  const removed = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (ids.indexOf(String(data[i][0])) >= 0) {
      sheet.deleteRow(i + 1);
      removed.push(String(data[i][0]));
    }
  }
  return removed;
}

// Dữ liệu nạp sẵn: 17 mô phỏng nổi tiếng quốc tế (đồng bộ từ INITIAL_PROJECTS của website).
const SEED_FOR_SHEET = [
 {
  "id": "proj-phet",
  "title": "PhET Interactive Simulations",
  "url": "https://phet.colorado.edu",
  "description": "Thư viện mô phỏng tương tác kinh điển của ĐH Colorado Boulder (Mỹ): hơn 170 mô phỏng miễn phí về Vật lý, Hóa học, Sinh học, Toán và Khoa học Trái Đất, đạt chuẩn STEM quốc tế.",
  "country": "US",
  "category": "physics",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "ĐH Colorado Boulder (Mỹ)",
  "authorContact": "phet.colorado.edu",
  "createdAt": "2026-09-08T04:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Vật lý",
   "PhET",
   "Mô phỏng nổi tiếng",
   "STEM"
  ],
  "views": 3420,
  "likes": 289
 },
 {
  "id": "proj-geogebra",
  "title": "GeoGebra Math Suite",
  "url": "https://www.geogebra.org",
  "description": "Nền tảng toán học động số 1 thế giới: hình học, đại số, đồ thị hàm số, bảng tính và không gian 3D trong một, hoàn toàn miễn phí cho giáo viên và học sinh.",
  "country": "GLOBAL",
  "category": "math",
  "educationLevel": "secondary",
  "status": "approved",
  "isFamous": true,
  "authorName": "GeoGebra Global Team",
  "authorContact": "geogebra.org",
  "createdAt": "2026-09-07T09:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Toán học",
   "GeoGebra",
   "Hình học",
   "Đồ thị"
  ],
  "views": 2980,
  "likes": 254
 },
 {
  "id": "proj-desmos",
  "title": "Desmos Graphing Calculator",
  "url": "https://www.desmos.com",
  "description": "Máy tính đồ thị trực tuyến nổi tiếng nhất thế giới của Desmos Studio: vẽ đồ thị, khảo sát hàm số, hình học và xây bài giảng Toán tương tác hoàn toàn miễn phí.",
  "country": "US",
  "category": "math",
  "educationLevel": "all",
  "status": "approved",
  "isFamous": true,
  "authorName": "Desmos Studio (Mỹ)",
  "authorContact": "desmos.com",
  "createdAt": "2026-09-07T03:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Toán học",
   "Desmos",
   "Đồ thị hàm số",
   "Máy tính"
  ],
  "views": 2750,
  "likes": 231
 },
 {
  "id": "proj-scratch",
  "title": "Scratch MIT",
  "url": "https://scratch.mit.edu",
  "description": "Môi trường lập trình kéo - thả lớn nhất hành tinh của Viện Công nghệ MIT (MIT Media Lab), giúp học sinh sáng tạo trò chơi, hoạt hình và câu chuyện tương tác.",
  "country": "US",
  "category": "informatics",
  "educationLevel": "primary",
  "status": "approved",
  "isFamous": true,
  "authorName": "MIT Media Lab (Hoa Kỳ)",
  "authorContact": "scratch.mit.edu",
  "createdAt": "2026-09-06T09:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Tin học",
   "Scratch",
   "MIT",
   "Lập trình"
  ],
  "views": 3120,
  "likes": 310
 },
 {
  "id": "proj-codeorg",
  "title": "Code.org",
  "url": "https://code.org",
  "description": "Nền tảng học lập trình và khoa học máy tính miễn phí nổi tiếng toàn cầu: Giờ Lập Trình (Hour of Code), Khóa học cơ bản dành cho học sinh và đào tạo giáo viên.",
  "country": "US",
  "category": "informatics",
  "educationLevel": "primary",
  "status": "approved",
  "isFamous": true,
  "authorName": "Code.org (Hoa Kỳ)",
  "authorContact": "code.org",
  "createdAt": "2026-09-06T03:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Tin học",
   "Code.org",
   "Lập trình",
   "Hour of Code"
  ],
  "views": 2560,
  "likes": 224
 },
 {
  "id": "proj-ptable",
  "title": "Ptable - Bảng Tuần Hoàn Tương Tác",
  "url": "https://ptable.com",
  "description": "Bảng tuần hoàn các nguyên tố hóa học tương tác nổi tiếng: cấu hình electron, trạng thái oxy hóa, đồng vị, nhiệt độ nóng chảy và dữ liệu vật lý trực quan.",
  "country": "GLOBAL",
  "category": "chemistry",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "Michael Dayah (Ptable)",
  "authorContact": "ptable.com",
  "createdAt": "2026-09-05T21:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Hóa học",
   "Bảng tuần hoàn",
   "Nguyên tố",
   "Tương tác"
  ],
  "views": 2680,
  "likes": 245
 },
 {
  "id": "proj-chemix",
  "title": "Chemix - Phòng Thí Nghiệm Hóa Học Ảo",
  "url": "https://chemix.org",
  "description": "Công cụ vẽ và mô phỏng dụng cụ thí nghiệm hóa học trực tuyến miễn phí, giúp giáo viên dựng thí nghiệm trực quan và học sinh làm quen với phòng Lab.",
  "country": "GLOBAL",
  "category": "chemistry",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "Chemix Team",
  "authorContact": "chemix.org",
  "createdAt": "2026-09-05T15:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Hóa học",
   "Chemix",
   "Thí nghiệm ảo",
   "Lab"
  ],
  "views": 1890,
  "likes": 176
 },
 {
  "id": "proj-biodigital",
  "title": "BioDigital Human",
  "url": "https://human.biodigital.com",
  "description": "Mô hình cơ thể người tương tác 3D chi tiết nhất thế giới, được dùng chuẩn quốc tế trong dạy học Sinh học, giải phẫu y khoa và sinh lý học.",
  "country": "GLOBAL",
  "category": "biology",
  "educationLevel": "university",
  "status": "approved",
  "isFamous": true,
  "authorName": "BioDigital Team (Hoa Kỳ)",
  "authorContact": "human.biodigital.com",
  "createdAt": "2026-09-05T03:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Sinh học",
   "Giải phẫu 3D",
   "Y học",
   "Mô hình cơ thể"
  ],
  "views": 2430,
  "likes": 289
 },
 {
  "id": "proj-innerbody",
  "title": "Innerbody Anatomy Explorer",
  "url": "https://www.innerbody.com",
  "description": "Trình duyệt giải phẫu trực tuyến miễn phí khám phá cơ thể người theo từng hệ cơ quan: tim mạch, hô hấp, thần kinh, xương khớp và hình ảnh 3D trực quan.",
  "country": "US",
  "category": "biology",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "Innerbody Research (Hoa Kỳ)",
  "authorContact": "innerbody.com",
  "createdAt": "2026-09-04T21:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Sinh học",
   "Giải phẫu",
   "Cơ thể người",
   "Y khoa"
  ],
  "views": 2010,
  "likes": 197
 },
 {
  "id": "proj-physicsclassroom",
  "title": "The Physics Classroom",
  "url": "https://www.physicsclassroom.com",
  "description": "Lớp học Vật lý trực tuyến kinh điển với hàng loạt mô phỏng tương tác và bài giảng chuẩn cho chương trình phổ thông: chuyển động, lực, năng lượng, sóng và điện học.",
  "country": "US",
  "category": "physics",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "The Physics Classroom (Hoa Kỳ)",
  "authorContact": "physicsclassroom.com",
  "createdAt": "2026-09-04T15:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Vật lý",
   "Mô phỏng",
   "THPT",
   "Tương tác"
  ],
  "views": 2230,
  "likes": 214
 },
 {
  "id": "proj-physicsaviary",
  "title": "The Physics Aviary",
  "url": "https://www.thephysicsaviary.com",
  "description": "Kho mô phỏng Vật lý miễn phí của tác giả Frank McCulley: hàng trăm thí nghiệm ảo về lực, chuyển động, điện từ, sóng, quang học và thí nghiệm thực tế.",
  "country": "US",
  "category": "physics",
  "educationLevel": "highschool",
  "status": "approved",
  "isFamous": true,
  "authorName": "The Physics Aviary (Hoa Kỳ)",
  "authorContact": "thephysicsaviary.com",
  "createdAt": "2026-09-04T09:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Vật lý",
   "Thí nghiệm ảo",
   "Mô phỏng",
   "STEM"
  ],
  "views": 1870,
  "likes": 183
 },
 {
  "id": "proj-falstad",
  "title": "Falstad Circuit Simulator",
  "url": "https://www.falstad.com/circuit",
  "description": "Trình mô phỏng mạch điện tương tác nổi tiếng của Paul Falstad: quan sát dòng điện chuyển động, phân tích mạch AC/DC, mạch khuếch đại và vi điều khiển ngay trong trình duyệt.",
  "country": "US",
  "category": "physics",
  "educationLevel": "university",
  "status": "approved",
  "isFamous": true,
  "authorName": "Paul Falstad (Hoa Kỳ)",
  "authorContact": "falstad.com",
  "createdAt": "2026-09-04T03:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Vật lý",
   "Mạch điện",
   "Điện tử",
   "Mô phỏng"
  ],
  "views": 2520,
  "likes": 240
 },
 {
  "id": "proj-netsim",
  "title": "NetSim - Network Simulator",
  "url": "https://www.tetcos.com",
  "description": "Bộ mô phỏng mạng máy tính chuyên sâu của Tetcos, dùng phổ biến cho sinh viên CNTT: cấu hình router/switch, giao thức TCP/IP, mạng cảm biến và mạng không dây.",
  "country": "US",
  "category": "informatics",
  "educationLevel": "university",
  "status": "approved",
  "isFamous": true,
  "authorName": "NetSim & Tetcos Labs",
  "authorContact": "tetcos.com",
  "createdAt": "2026-09-03T21:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Tin học",
   "NetSim",
   "Mạng máy tính",
   "Mô phỏng"
  ],
  "views": 2150,
  "likes": 198
 },
 {
  "id": "proj-tinkercad",
  "title": "Tinkercad (Autodesk)",
  "url": "https://www.tinkercad.com",
  "description": "Công cụ thiết kế 3D, mạch điện tử và lập trình khối miễn phí của Autodesk - nơi hàng triệu học sinh làm quen với STEM, in 3D và điện tử tạo mạch.",
  "country": "US",
  "category": "stem",
  "educationLevel": "secondary",
  "status": "approved",
  "isFamous": true,
  "authorName": "Autodesk (Hoa Kỳ)",
  "authorContact": "tinkercad.com",
  "createdAt": "2026-09-03T09:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1615800098779-1be32e60cca3?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "STEM",
   "Thiết kế 3D",
   "Mạch điện",
   "Tinkercad"
  ],
  "views": 2330,
  "likes": 207
 },
 {
  "id": "proj-wolfram",
  "title": "Wolfram Demonstrations Project",
  "url": "https://demonstrations.wolfram.com",
  "description": "Hơn 13.000 minh họa tương tác miễn phí của Wolfram về Toán học, Khoa học và Kỹ thuật - mỗi khái niệm được minh họa bằng mô hình động trực quan thay đổi theo tham số.",
  "country": "GLOBAL",
  "category": "math",
  "educationLevel": "university",
  "status": "approved",
  "isFamous": true,
  "authorName": "Wolfram Research",
  "authorContact": "demonstrations.wolfram.com",
  "createdAt": "2026-09-02T21:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Toán học",
   "Wolfram",
   "Khoa học",
   "Mô phỏng tương tác"
  ],
  "views": 1780,
  "likes": 168
 },
 {
  "id": "proj-googleearth",
  "title": "Google Earth",
  "url": "https://earth.google.com",
  "description": "Quả địa cầu số nổi tiếng nhất thế giới: khám phá địa hình 3D, thám hiểm vũ trụ, các địa danh nổi tiếng và dòng chảy lịch sử của Trái Đất qua Google Earth.",
  "country": "GLOBAL",
  "category": "geography",
  "educationLevel": "all",
  "status": "approved",
  "isFamous": true,
  "authorName": "Google (Hoa Kỳ)",
  "authorContact": "earth.google.com",
  "createdAt": "2026-09-02T09:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Địa lý",
   "Google Earth",
   "Bản đồ 3D",
   "Thám hiểm"
  ],
  "views": 3210,
  "likes": 356
 },
 {
  "id": "proj-nasaspaceplace",
  "title": "NASA Space Place",
  "url": "https://spaceplace.nasa.gov",
  "description": "Sân chơi khoa học vũ trụ miễn phí của NASA dành cho thiếu nhi: trò chơi, hoạt động thực hành và mô phỏng về Mặt Trời, các hành tinh, tên lửa và vũ trụ.",
  "country": "US",
  "category": "natural_sciences",
  "educationLevel": "primary",
  "status": "approved",
  "isFamous": true,
  "authorName": "NASA (Hoa Kỳ)",
  "authorContact": "spaceplace.nasa.gov",
  "createdAt": "2026-09-01T21:44:30.899Z",
  "previewImage": "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800&auto=format&fit=crop&q=80",
  "tags": [
   "Khoa học tự nhiên",
   "NASA",
   "Vũ trụ",
   "Thiếu nhi"
  ],
  "views": 2400,
  "likes": 234
 }
];

// Chạy THỦ CÔNG 1 lần duy nhất (Run ▸ chọn hàm seedFamousData) để:
//   - Tạo tab WebHub_Projects (nếu chưa có)
//   - Ghi thẳng 17 mô phỏng nổi tiếng vào sheet (không qua POST nên chữ Unicode chuẩn 100%)
function seedFamousData() {
  const sheet = ensureSheet(MAIN_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  if (SEED_FOR_SHEET.length > 0) {
    sheet.getRange(2, 1, SEED_FOR_SHEET.length, HEADERS.length)
      .setValues(SEED_FOR_SHEET.map(projectToRow));
  }
  return SEED_FOR_SHEET.length;
}

// Đọc dữ liệu theo GET - hỗ trợ 2 loại:
//   ?action=getProjects    -> dữ liệu ĐÃ DUYỆT trên MAIN_SHEET (mặc định, dùng cho đồng bộ chính)
//   ?action=getSubmissions -> dự án MỚI trên SUBMISSION_SHEET (quản lý bài chờ duyệt)
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getProjects";
    if (action === "getSubmissions") {
      const result = parseRows(ensureSheet(SUBMISSION_SHEET));
      return createJsonResponse({ status: "success", total: result.rows.length, data: result.rows });
    }
    const result = parseRows(ensureSheet(MAIN_SHEET));
    return createJsonResponse({ status: "success", total: result.rows.length, data: result.rows });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

// Xử lý ghi dữ liệu (POST) - quản lý 2 tab:
//   SUBMISSION_SHEET: dự án mới người dùng đăng (chờ duyệt / từ chối) để admin quản lý THÊM - XÓA.
//   MAIN_SHEET:       mô phỏng ĐÃ DUYỆT đang hiển thị trên website.
function doPost(e) {
  try {
    // Đọc body ĐÚNG charset UTF-8 (tránh lỗi tiếng Việt / ký tự SEA bị vỡ chữ trong sheet).
    const postData = e.postData;
    const rawBody = postData
      ? (typeof postData.getDataAsString === "function"
          ? postData.getDataAsString("UTF-8")
          : postData.contents)
      : "{}";
    const payload = JSON.parse(rawBody);

    // 1. Đồng bộ dữ liệu ĐÃ DUYỆT lên MAIN_SHEET (UPSERT: giữ nguyên dòng cũ, chỉ cập nhật/ghi thêm)
    if (payload.action === "syncAll" && Array.isArray(payload.projects)) {
      const sheet = ensureSheet(MAIN_SHEET);
      const approved = payload.projects.filter(function (p) { return String(p.status || "approved") === "approved"; });
      approved.forEach(function (p) { upsertRow(sheet, p); });
      return createJsonResponse({
        status: "success",
        message: "Đã đồng bộ toàn bộ " + approved.length + " mô phỏng đã duyệt lên tab WebHub_Projects thành công!"
      });
    }

    // 2. Người dùng đăng bài mới -> thêm vào SUBMISSION_SHEET (chờ admin duyệt)
    if (payload.action === "addProject" && payload.project) {
      ensureSheet(SUBMISSION_SHEET).appendRow(projectToRow(payload.project));
      return createJsonResponse({ status: "success", message: "Đã ghi nhận bài đăng mới vào tab WebHub_Submissions" });
    }

    // 3. Upsert TOÀN BỘ thông tin 1 mô phỏng (dùng khi admin duyệt/từ chối).
    //    Luôn ghi vào SUBMISSION_SHEET để admin còn quản lý; nếu bài đã DUYỆT thì đồng bộ thêm vào MAIN_SHEET.
    if (payload.action === "upsertProject" && payload.project) {
      const p = payload.project;
      upsertRow(ensureSheet(SUBMISSION_SHEET), p);
      if (String(p.status) === "approved") {
        upsertRow(ensureSheet(MAIN_SHEET), p);
      }
      return createJsonResponse({ status: "success", message: "Đã đồng bộ thông tin mô phỏng vào Google Sheets" });
    }

    // 4. Cập nhật trạng thái duyệt (approved / rejected). Nếu APPROVED thì sao chép sang MAIN_SHEET.
    //    Nếu REJECTED thì gỡ khỏi MAIN_SHEET (phòng trường hợp bài đã duyệt rồi bị duyệt lại/từ chối).
    if (payload.action === "updateStatus" && payload.projectId && payload.status) {
      const sSheet = ensureSheet(SUBMISSION_SHEET);
      const data = sSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.projectId)) {
          sSheet.getRange(i + 1, 8).setValue(payload.status);
          if (payload.status === "approved") {
            const result = parseRows(sSheet);
            for (let j = 0; j < result.rows.length; j++) {
              if (String(result.rows[j].id) === String(payload.projectId)) {
                upsertRow(ensureSheet(MAIN_SHEET), result.rows[j]);
                break;
              }
            }
          } else if (payload.status === "rejected" && String(data[i][0])) {
            deleteRowsById(ensureSheet(MAIN_SHEET), [String(payload.projectId)]);
          }
          return createJsonResponse({ status: "success", message: "Đã cập nhật trạng thái bài viết" });
        }
      }
      return createJsonResponse({ status: "error", message: "Không tìm thấy bài viết trong WebHub_Submissions" });
    }

    // 5. Chuyển đổi cờ Nổi tiếng (isFamous: true/false) trên MAIN_SHEET
    if (payload.action === "toggleFamous" && payload.projectId) {
      const sheet = ensureSheet(MAIN_SHEET);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.projectId)) {
          const currentVal = data[i][8];
          const newVal = !(currentVal === true || String(currentVal).toUpperCase() === "TRUE");
          sheet.getRange(i + 1, 9).setValue(newVal);
          return createJsonResponse({ status: "success", message: "Đã cập nhật phân loại nổi tiếng", isFamous: newVal });
        }
      }
      return createJsonResponse({ status: "error", message: "Không tìm thấy bài viết trong WebHub_Projects" });
    }

    // 6. Xóa dự án khỏi Google Sheets (admin bấm Xóa trên website).
    //    Xóa ở CẢ HAI tab: WebHub_Submissions (chưa duyệt) và WebHub_Projects (đã duyệt)
    //    để bài đã xóa không quay lại khi tải dữ liệu từ Sheets hoặc duyệt từ xa.
    if (payload.action === "deleteProject") {
      const ids = (Array.isArray(payload.ids) ? payload.ids : (payload.projectId ? [payload.projectId] : []))
        .filter(function (id) { return id !== undefined && id !== null && String(id) !== ""; });
      if (ids.length === 0) {
        return createJsonResponse({ status: "error", message: "Thiếu projectId để xóa dự án" });
      }
      const removedSub = deleteRowsById(ensureSheet(SUBMISSION_SHEET), ids);
      const removedMain = deleteRowsById(ensureSheet(MAIN_SHEET), ids);
      return createJsonResponse({
        status: "success",
        message: "Đã xóa " + (removedSub.length + removedMain.length) + " dự án khỏi Google Sheets",
        removed: removedSub.length + removedMain.length
      });
    }

    // 7. Cập nhật số liệu thống kê (Views / Likes) của bài ĐÃ DUYỆT trên MAIN_SHEET.
    //    Gửi theo batch: payload.items = [{ projectId, views, likes }, ...]
    if (payload.action === "updateStats" && payload.items && Array.isArray(payload.items)) {
      const sheet = ensureSheet(MAIN_SHEET);
      const data = sheet.getDataRange().getValues();
      let updated = 0;
      for (let i = 1; i < data.length; i++) {
        let match = null;
        for (let k = 0; k < payload.items.length; k++) {
          if (String(payload.items[k].projectId) === String(data[i][0])) { match = payload.items[k]; break; }
        }
        if (match) {
          sheet.getRange(i + 1, 15).setValue(Number(match.views) >= 0 ? Number(match.views) : (Number(data[i][14]) || 0));
          sheet.getRange(i + 1, 16).setValue(Number(match.likes) >= 0 ? Number(match.likes) : (Number(data[i][15]) || 0));
          updated++;
        }
      }
      return createJsonResponse({ status: "success", message: "Đã cập nhật thống kê " + updated + " mô phỏng", updated: updated });
    }

    // 8. Cập nhật CHỈ cột GoLink (cột 18) theo ID — không đụng cột nào khác.
    //    payload.items = [{ id, goLink }, ...]
    if (payload.action === "updateGoLinks" && Array.isArray(payload.items)) {
      const sheet = ensureSheet(MAIN_SHEET);
      const data = sheet.getDataRange().getValues();
      let updated = 0;
      for (let i = 1; i < data.length; i++) {
        const rowId = String(data[i][0]);
        for (let k = 0; k < payload.items.length; k++) {
          if (String(payload.items[k].id) === rowId && payload.items[k].goLink) {
            sheet.getRange(i + 1, 18).setValue(payload.items[k].goLink);
            updated++;
            break;
          }
        }
      }
      return createJsonResponse({ status: "success", message: "Đã cập nhật GoLink cho " + updated + " mô phỏng", updated: updated });
    }

    return createJsonResponse({ status: "ignored", message: "Không có hành động phù hợp" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
