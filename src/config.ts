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