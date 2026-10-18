/**
 * Google Apps Script - WebHub Showcase Cloud Backend
 * TỐI ƯU HÓA QUẢN LÝ DỰ ÁN TRÊN GOOGLE SHEETS:
 *   1. WEBHUB_PROJECTS      -> Quản lý TOÀN BỘ các bài đăng (Bài nổi tiếng + Bài cộng đồng + Bài mới up).
 *                              Dữ liệu bài mới gửi sẽ nhận TRỰC TIẾP vào tab này.
 *                              Admin duyệt bài (approved/rejected) ngay trên tab này, không cần cắt dán thủ công!
 *   2. WEBHUB_SUBMISSIONS   -> Tab phụ lưu trữ / tương thích ngược. Khi admin duyệt hoặc dọn dẹp,
 *                              script tự động chuyển bài sang WebHub_Projects và xóa khỏi tab này.
 *   3. WEBHUB_COMMENTS      -> Quản lý bình luận, nhận xét, kinh nghiệm giảng dạy.
 * 
 * HƯỚNG DẪN CÀI ĐẶT 4 BƯỚC:
 * 1. Mở file Google Sheets trên Google Drive (ví dụ: WebHub_Database).
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
 * TIỆN ÍCH HỖ TRỢ:
 * - migrateSubmissionsToProjects: Chọn hàm này và bấm Run nếu muốn chuyển toàn bộ bài
 *   đang kẹt ở WebHub_Submissions sang WebHub_Projects trong 1 giây!
 * - seedFamousData: Nạp sẵn 17 mô phỏng nổi tiếng vào sheet (nếu cần).
 */

const MAIN_SHEET = "WebHub_Projects";
const SUBMISSION_SHEET = "WebHub_Submissions";
const COMMENTS_SHEET = "WebHub_Comments";

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
  "GoLink",
  "Downloads",
  "Contributions",
  "CommentCount",
  "UpdatedAt"
];

const COMMENT_HEADERS = [
  "ID",
  "ProjectID",
  "AuthorName",
  "AuthorRole",
  "Category",
  "Content",
  "Rating",
  "CreatedAt",
  "Likes"
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

function ensureCommentsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COMMENTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(COMMENTS_SHEET);
    sheet.appendRow(COMMENT_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, COMMENT_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0D9488"); // Teal 600
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140); // ID
    sheet.setColumnWidth(2, 140); // ProjectID
    sheet.setColumnWidth(3, 160); // AuthorName
    sheet.setColumnWidth(4, 120); // AuthorRole
    sheet.setColumnWidth(5, 140); // Category
    sheet.setColumnWidth(6, 320); // Content
    sheet.setColumnWidth(7, 80);  // Rating
    sheet.setColumnWidth(8, 170); // CreatedAt
    sheet.setColumnWidth(9, 80);  // Likes
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
      goLink: String(row[col("golink", 17)] || ""),
      downloads: Number(row[col("downloads", 18)] || 0),
      contributions: Number(row[col("contributions", 19)] || 0),
      commentCount: Number(row[col("commentcount", 20)] || 0),
      updatedAt: row[col("updatedat", 21)] ? (row[col("updatedat", 21)] instanceof Date ? row[col("updatedat", 21)].toISOString() : String(row[col("updatedat", 21)])) : ""
    });
  }
  return { rows: projects };
}

function parseComments(sheet, targetProjectId) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { rows: [] };
  const headers = data[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const col = function (name, defaultIdx) {
    const idx = headers.indexOf(name.toLowerCase());
    return idx >= 0 ? idx : defaultIdx;
  };
  const comments = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const pid = String(row[col("projectid", 1)] || "");
    if (targetProjectId && pid !== targetProjectId) continue;
    comments.push({
      id: String(row[col("id", 0)] || ("comm-" + i)),
      projectId: pid,
      authorName: String(row[col("authorname", 2)] || "Thành viên"),
      authorRole: String(row[col("authorrole", 3)] || "guest"),
      category: String(row[col("category", 4)] || "experience"),
      content: String(row[col("content", 5)] || ""),
      rating: Number(row[col("rating", 6)] || 5),
      createdAt: row[col("createdat", 7)] ? (row[col("createdat", 7)] instanceof Date ? row[col("createdat", 7)].toISOString() : String(row[col("createdat", 7)])) : new Date().toISOString(),
      likes: Number(row[col("likes", 8)] || 0)
    });
  }
  return { rows: comments };
}

// Chuyển project thành 1 hàng 22 cột (21 cột cũ + 1 cột UpdatedAt)
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
    (p.previewImage ? (String(p.previewImage).length > 45000 ? String(p.previewImage).substring(0, 45000) : String(p.previewImage)) : ""),
    Array.isArray(p.tags) ? p.tags.join(", ") : "",
    p.views || 0,
    p.likes || 0,
    p.isUserSubmission ? true : false,
    p.goLink || "",
    p.downloads || 0,
    p.contributions || 0,
    p.commentCount || 0,
    p.updatedAt || new Date().toISOString()
  ];
}

// Thêm mới hoặc ghi đè toàn bộ hàng của 1 project theo ID
function upsertRow(sheet, project) {
  const row = projectToRow(project);
  // Đảm bảo số cột trong sheet đủ chứa tất cả 21 cột (tránh lỗi thiếu cột trên sheet cũ)
  if (sheet.getMaxColumns() < row.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), row.length - sheet.getMaxColumns());
  }
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  const pId = String(project.id || '').trim();
  const pUrl = String(project.url || '').trim();

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0] || '').trim();
    const rowUrl = String(data[i][2] || '').trim();
    if ((pId && rowId === pId) || (pUrl && rowUrl === pUrl)) {
      foundRow = i;
      break;
    }
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

// Chạy hàm này 1 lần duy nhất để chuyển toàn bộ bài đang kẹt ở WebHub_Submissions
// sang WebHub_Projects và xóa sạch tab Submissions tự động!
function migrateSubmissionsToProjects() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sSheet = ss.getSheetByName(SUBMISSION_SHEET);
  if (!sSheet) {
    Logger.log("Không tìm thấy tab WebHub_Submissions");
    return 0;
  }
  const mSheet = ensureSheet(MAIN_SHEET);
  const subData = parseRows(sSheet);
  let count = 0;
  for (let i = 0; i < subData.rows.length; i++) {
    upsertRow(mSheet, subData.rows[i]);
    count++;
  }
  const lastRow = sSheet.getLastRow();
  if (lastRow > 1) {
    sSheet.deleteRows(2, lastRow - 1);
  }
  Logger.log("Đã di chuyển thành công " + count + " bài từ WebHub_Submissions sang WebHub_Projects!");
  return count;
}

// Nạp 17 mô phỏng nổi tiếng quốc tế
function seedFamousData() {
  const sheet = ensureSheet(MAIN_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  if (typeof SEED_FOR_SHEET !== "undefined" && SEED_FOR_SHEET.length > 0) {
    sheet.getRange(2, 1, SEED_FOR_SHEET.length, HEADERS.length)
      .setValues(SEED_FOR_SHEET.map(projectToRow));
    return SEED_FOR_SHEET.length;
  }
  return 0;
}

// Quản lý biến thông minh phiên bản dữ liệu (SYNC_TOKEN)
function getSyncToken() {
  try {
    const p = PropertiesService.getScriptProperties().getProperty("SYNC_TOKEN");
    if (p) return Number(p);
  } catch (e) {}
  return 1741699200000;
}

function bumpSyncToken() {
  const now = Date.now();
  try {
    PropertiesService.getScriptProperties().setProperty("SYNC_TOKEN", String(now));
  } catch (e) {}
  return now;
}

function getDeletedProjectIds() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty("DELETED_IDS");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function recordDeletedProjectIds(ids) {
  try {
    const current = getDeletedProjectIds();
    const map = {};
    current.forEach(function (id) { map[id] = true; });
    ids.forEach(function (id) { map[String(id).trim()] = true; });
    const nextList = Object.keys(map).slice(-100);
    PropertiesService.getScriptProperties().setProperty("DELETED_IDS", JSON.stringify(nextList));
  } catch (e) {}
}

// Đọc dữ liệu theo GET:
//   ?action=checkVersion   -> Kiểm tra biến thông minh phiên bản (siêu nhẹ ~100 bytes, < 150ms)
//   ?action=getDelta       -> Đồng bộ vi sai: chỉ tải các bài mới/sửa và danh sách ID đã xóa
//   ?action=getProjects    -> Đọc toàn bộ danh sách từ WebHub_Projects (chính)
//   ?action=getSubmissions -> Đọc các bài chờ duyệt (pending / rejected) từ WebHub_Projects + Submissions
//   ?action=getComments    -> Đọc bình luận từ WebHub_Comments
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getProjects";

    // 1. Kiểm tra nhanh phiên bản biến thông minh (siêu nhẹ, không tốn tài nguyên Sheet)
    if (action === "checkVersion") {
      const token = getSyncToken();
      return createJsonResponse({
        status: "success",
        syncToken: token,
        version: token,
        updatedAt: new Date(token).toISOString()
      });
    }

    // 2. Đồng bộ vi sai: chỉ tải các mục thay đổi kể từ mốc since
    if (action === "getDelta") {
      const since = Number(e.parameter.since || 0);
      const token = getSyncToken();
      const allProj = parseRows(ensureSheet(MAIN_SHEET)).rows;
      const allComm = parseComments(ensureCommentsSheet()).rows;

      if (!since || since <= 0) {
        return createJsonResponse({
          status: "success",
          isFull: true,
          syncToken: token,
          projects: allProj,
          rows: allProj,
          data: allProj,
          comments: allComm,
          deletedIds: []
        });
      }

      const deltaProjects = allProj.filter(function (p) {
        const time = p.updatedAt ? new Date(p.updatedAt).getTime() : (p.createdAt ? new Date(p.createdAt).getTime() : 0);
        return time > since;
      });

      const deltaComments = allComm.filter(function (c) {
        const time = c.createdAt ? new Date(c.createdAt).getTime() : 0;
        return time > since;
      });

      const deletedIds = getDeletedProjectIds();

      return createJsonResponse({
        status: "success",
        isFull: false,
        syncToken: token,
        projects: deltaProjects,
        rows: deltaProjects,
        data: deltaProjects,
        comments: deltaComments,
        deletedIds: deletedIds
      });
    }

    if (action === "getSubmissions") {
      // 1. Lấy tất cả bài chờ duyệt hoặc từ chối từ WebHub_Projects
      const mainResult = parseRows(ensureSheet(MAIN_SHEET));
      const pendingFromMain = mainResult.rows.filter(function (p) {
        return p.status === "pending" || p.status === "rejected";
      });

      // 2. Lấy thêm bài cũ từ WebHub_Submissions nếu chưa kịp chuyển
      const subResult = parseRows(ensureSheet(SUBMISSION_SHEET));
      const existingIds = pendingFromMain.map(function (p) { return String(p.id); });
      const pendingFromSub = subResult.rows.filter(function (p) {
        return existingIds.indexOf(String(p.id)) === -1;
      });

      const combined = pendingFromMain.concat(pendingFromSub);
      return createJsonResponse({ status: "success", total: combined.length, data: combined, rows: combined });
    }
    if (action === "getComments") {
      const pid = e && e.parameter && e.parameter.projectId ? String(e.parameter.projectId) : undefined;
      const result = parseComments(ensureCommentsSheet(), pid);
      return createJsonResponse({ status: "success", total: result.rows.length, data: result.rows, rows: result.rows });
    }
    const result = parseRows(ensureSheet(MAIN_SHEET));
    return createJsonResponse({ status: "success", total: result.rows.length, data: result.rows, rows: result.rows });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

// Xử lý ghi dữ liệu (POST):
function doPost(e) {
  try {
    const postData = e.postData;
    const rawBody = postData
      ? (typeof postData.getDataAsString === "function"
          ? postData.getDataAsString("UTF-8")
          : postData.contents)
      : "{}";
    const payload = JSON.parse(rawBody);

    // 1. Đồng bộ toàn bộ dữ liệu ĐÃ DUYỆT lên WebHub_Projects
    if (payload.action === "syncAll" && Array.isArray(payload.projects)) {
      const sheet = ensureSheet(MAIN_SHEET);
      const approved = payload.projects.filter(function (p) { return String(p.status || "approved") === "approved"; });
      approved.forEach(function (p) { upsertRow(sheet, p); });
      bumpSyncToken();
      return createJsonResponse({
        status: "success",
        message: "Đã đồng bộ toàn bộ " + approved.length + " mô phỏng đã duyệt lên tab WebHub_Projects thành công!"
      });
    }

    // 2. Người dùng đăng bài mới -> NHẬN BÀI LUÔN TRỰC TIẾP VÀO TAB WebHub_Projects
    if (payload.action === "addProject" && payload.project) {
      const p = payload.project;
      upsertRow(ensureSheet(MAIN_SHEET), p);
      deleteRowsById(ensureSheet(SUBMISSION_SHEET), [String(p.id)]);
      bumpSyncToken();
      return createJsonResponse({
        status: "success",
        message: "Đã nhận bài đăng mới trực tiếp vào tab WebHub_Projects thành công!"
      });
    }

    // 3. Upsert TOÀN BỘ thông tin 1 mô phỏng (dùng khi admin duyệt/từ chối).
    // Ghi và cập nhật trực tiếp vào WebHub_Projects, tự động dọn sạch tab Submissions.
    if (payload.action === "upsertProject" && payload.project) {
      const p = payload.project;
      upsertRow(ensureSheet(MAIN_SHEET), p);
      deleteRowsById(ensureSheet(SUBMISSION_SHEET), [String(p.id)]);
      bumpSyncToken();
      return createJsonResponse({
        status: "success",
        message: "Đã đồng bộ thông tin mô phỏng vào tab WebHub_Projects thành công!"
      });
    }

    // 4. Cập nhật trạng thái duyệt (approved / rejected).
    // Cập nhật ngay trên WebHub_Projects. Nếu còn sót ở WebHub_Submissions thì tự động chuyển sang WebHub_Projects.
    if (payload.action === "updateStatus" && payload.projectId && payload.status) {
      const pid = String(payload.projectId);
      const mSheet = ensureSheet(MAIN_SHEET);
      const mData = mSheet.getDataRange().getValues();
      let foundInMain = false;

      for (let i = 1; i < mData.length; i++) {
        if (String(mData[i][0]) === pid) {
          mSheet.getRange(i + 1, 8).setValue(payload.status);
          foundInMain = true;
          break;
        }
      }

      // Kiểm tra nếu bài còn nằm trong WebHub_Submissions (dữ liệu cũ chưa dọn):
      const sSheet = ensureSheet(SUBMISSION_SHEET);
      const sData = sSheet.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        if (String(sData[i][0]) === pid) {
          if (!foundInMain) {
            const result = parseRows(sSheet);
            for (let j = 0; j < result.rows.length; j++) {
              if (String(result.rows[j].id) === pid) {
                const item = result.rows[j];
                item.status = payload.status;
                upsertRow(mSheet, item);
                foundInMain = true;
                break;
              }
            }
          }
          sSheet.deleteRow(i + 1);
          break;
        }
      }

      if (foundInMain) {
        bumpSyncToken();
        return createJsonResponse({ status: "success", message: "Đã cập nhật trạng thái bài viết trên WebHub_Projects" });
      }
      return createJsonResponse({ status: "error", message: "Không tìm thấy bài viết" });
    }

    // 5. Chuyển đổi cờ Nổi tiếng (isFamous: true/false) trên WebHub_Projects
    if (payload.action === "toggleFamous" && payload.projectId) {
      const sheet = ensureSheet(MAIN_SHEET);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.projectId)) {
          const currentVal = data[i][8];
          const newVal = !(currentVal === true || String(currentVal).toUpperCase() === "TRUE");
          sheet.getRange(i + 1, 9).setValue(newVal);
          bumpSyncToken();
          return createJsonResponse({ status: "success", message: "Đã cập nhật phân loại nổi tiếng", isFamous: newVal });
        }
      }
      return createJsonResponse({ status: "error", message: "Không tìm thấy bài viết trong WebHub_Projects" });
    }

    // 6. Xóa dự án khỏi Google Sheets (xóa cả 2 tab để triệt để)
    if (payload.action === "deleteProject") {
      const ids = (Array.isArray(payload.ids) ? payload.ids : (payload.projectId ? [payload.projectId] : []))
        .filter(function (id) { return id !== undefined && id !== null && String(id) !== ""; });
      if (ids.length === 0) {
        return createJsonResponse({ status: "error", message: "Thiếu projectId để xóa dự án" });
      }
      const removedSub = deleteRowsById(ensureSheet(SUBMISSION_SHEET), ids);
      const removedMain = deleteRowsById(ensureSheet(MAIN_SHEET), ids);
      recordDeletedProjectIds(ids);
      bumpSyncToken();
      return createJsonResponse({
        status: "success",
        message: "Đã xóa " + (removedSub.length + removedMain.length) + " dự án khỏi Google Sheets",
        removed: removedSub.length + removedMain.length
      });
    }

    // 7. Cập nhật số liệu thống kê (Views / Likes / Downloads / Contributions / CommentCount) trên WebHub_Projects
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
          if (match.views !== undefined && Number(match.views) >= 0) sheet.getRange(i + 1, 15).setValue(Number(match.views));
          if (match.likes !== undefined && Number(match.likes) >= 0) sheet.getRange(i + 1, 16).setValue(Number(match.likes));
          if (match.downloads !== undefined && Number(match.downloads) >= 0) sheet.getRange(i + 1, 19).setValue(Number(match.downloads));
          if (match.contributions !== undefined && Number(match.contributions) >= 0) sheet.getRange(i + 1, 20).setValue(Number(match.contributions));
          if (match.commentCount !== undefined && Number(match.commentCount) >= 0) sheet.getRange(i + 1, 21).setValue(Number(match.commentCount));
          updated++;
        }
      }
      if (updated > 0) {
        bumpSyncToken();
      }
      return createJsonResponse({ status: "success", message: "Đã cập nhật thống kê " + updated + " mô phỏng", updated: updated });
    }

    // 8. Cập nhật GoLink (cột 18)
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
      if (updated > 0) {
        bumpSyncToken();
      }
      return createJsonResponse({ status: "success", message: "Đã cập nhật GoLink cho " + updated + " mô phỏng", updated: updated });
    }

    // 9. Thêm bình luận mới vào tab WebHub_Comments
    if (payload.action === "addComment" && payload.comment) {
      const c = payload.comment;
      const cSheet = ensureCommentsSheet();
      const row = [
        c.id || ("comm-" + new Date().getTime()),
        c.projectId || "",
        c.authorName || "Thành viên",
        c.authorRole || "guest",
        c.category || "experience",
        c.content || "",
        c.rating || 5,
        c.createdAt || new Date().toISOString(),
        c.likes || 0
      ];
      cSheet.appendRow(row);

      if (c.projectId) {
        const mSheet = ensureSheet(MAIN_SHEET);
        const mData = mSheet.getDataRange().getValues();
        for (let i = 1; i < mData.length; i++) {
          if (String(mData[i][0]) === String(c.projectId)) {
            const currentCount = Number(mData[i][20]) || 0;
            mSheet.getRange(i + 1, 21).setValue(currentCount + 1);
            break;
          }
        }
      }
      bumpSyncToken();
      return createJsonResponse({ status: "success", message: "Đã ghi nhận bình luận mới vào tab WebHub_Comments" });
    }

    // 10. Xóa bình luận khỏi tab WebHub_Comments
    if (payload.action === "deleteComment") {
      const cSheet = ensureCommentsSheet();
      const ids = Array.isArray(payload.commentId)
        ? payload.commentId
        : (payload.commentId ? [payload.commentId] : (payload.ids ? payload.ids : []));
      const removed = deleteRowsById(cSheet, ids);
      if (removed.length > 0) {
        bumpSyncToken();
      }
      return createJsonResponse({ status: "success", message: "Đã xóa " + removed.length + " bình luận", removed: removed });
    }

    // 11. Cập nhật nội dung bình luận
    if ((payload.action === "updateComment" || payload.action === "editComment") && payload.comment) {
      const cSheet = ensureCommentsSheet();
      const c = payload.comment;
      const data = cSheet.getDataRange().getValues();
      let found = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(c.id)) { found = i; break; }
      }
      const row = [
        c.id || ("comm-" + new Date().getTime()),
        c.projectId || "",
        c.authorName || "Thành viên",
        c.authorRole || "guest",
        c.category || "experience",
        c.content || "",
        c.rating || 5,
        c.createdAt || new Date().toISOString(),
        c.likes || 0
      ];
      if (found >= 0) {
        cSheet.getRange(found + 1, 1, 1, row.length).setValues([row]);
      } else {
        cSheet.appendRow(row);
      }
      bumpSyncToken();
      return createJsonResponse({ status: "success", message: "Đã cập nhật bình luận" });
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
