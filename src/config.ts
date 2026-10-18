/**
 * ============================================================
 * BIẾN KIỂM SOÁT CHẾ ĐỘ CỘNG ĐỒNG (tab "Bài đăng tải")
 * ============================================================
 * - true  (mặc định): tab "Bài đăng tải" CHỈ hiển thị các bài do người dùng
 *         gửi lên và được admin DUYỆT. Mọi bài mẫu / nổi tiếng / nội dung khác
 *         đều bị ẩn khỏi tab này (chỉ hiện ở tab "Nổi tiếng" nếu có cờ isFamous).
 * - false (chế độ cũ): tab "Bài đăng tải" hiển thị tất cả bài approved không
 *         mang cờ nổi tiếng.
 *
 * Có thể bật/tắt ngay trên giao diện (Quản trị → Google Sheets & Cloud Sync)
 * hoặc đổi giá trị mặc định dưới đây rồi build lại web.
 */
export const COMMUNITY_APPROVED_ONLY_DEFAULT = true;

const STORAGE_KEY_COMMUNITY_ONLY = 'webhub_community_approved_only';

/**
 * Đọc biến kiểm soát chế độ cộng đồng.
 * Ưu tiên giá trị đã lưu trong localStorage; nếu chưa có thì dùng mặc định.
 */
export function isCommunityApprovedOnly(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY_COMMUNITY_ONLY);
    return v === null ? COMMUNITY_APPROVED_ONLY_DEFAULT : v !== 'false';
  } catch {
    return COMMUNITY_APPROVED_ONLY_DEFAULT;
  }
}

/** Ghi biến kiểm soát chế độ cộng đồng (bật/tắt trực tiếp từ giao diện). */
export function setCommunityApprovedOnly(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_COMMUNITY_ONLY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * ============================================================
 * BIẾN KIỂM SOÁT HIỂN THỊ THÔNG TIN TÁC GIẢ CUỐI TRANG
 * ============================================================
 * - false (mặc định hiện tại): tạm ẩn 2 tên và thông tin tác giả ở chân trang footer.
 * - true: hiển thị đầy đủ thông tin tác giả.
 * Khi cần hiển thị lại chỉ cần đổi thành true hoặc gọi setFooterAuthorsVisible(true).
 */
export const SHOW_FOOTER_AUTHORS_DEFAULT = false;

const STORAGE_KEY_FOOTER_AUTHORS = 'webhub_footer_authors_visible';

export function isFooterAuthorsVisible(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY_FOOTER_AUTHORS);
    return v === null ? SHOW_FOOTER_AUTHORS_DEFAULT : v === 'true';
  } catch {
    return SHOW_FOOTER_AUTHORS_DEFAULT;
  }
}

export function setFooterAuthorsVisible(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOOTER_AUTHORS, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}