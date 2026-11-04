/**
 * Quản lý vòng đời các cửa sổ mô phỏng phụ (Sub-windows / Child windows):
 * 1. Khi người dùng bấm "Truy cập": mở cửa sổ / tab mới và lưu vào danh sách quản lý.
 * 2. Khi người dùng đóng hoặc tải lại trang chính OpenEduLab:
 *    Tự động đóng toàn bộ các cửa sổ mô phỏng phụ đã mở ("thoát trang chính là thoát hết").
 */

const activeSubWindows: Window[] = [];

if (typeof window !== 'undefined') {
  const closeAllSubWindows = () => {
    for (let i = activeSubWindows.length - 1; i >= 0; i--) {
      const win = activeSubWindows[i];
      try {
        if (win && !win.closed) {
          win.close();
        }
      } catch {
        // Bỏ qua lỗi cross-origin nếu có
      }
    }
    activeSubWindows.length = 0;
  };

  // Đăng ký cả 2 sự kiện để đảm bảo đóng sạch cửa sổ trên Chrome, Edge, Safari, Firefox
  window.addEventListener('beforeunload', closeAllSubWindows);
  window.addEventListener('pagehide', closeAllSubWindows);
}

/**
 * Mở cửa sổ mô phỏng mới liên kết vòng đời với trang chính OpenEduLab.
 * Khi trang chính tắt hoặc chuyển hướng, cửa sổ này sẽ tự động đóng theo.
 */
export function openManagedWindow(url: string, target: string = '_blank'): Window | null {
  try {
    // Mở cửa sổ không kèm noopener để trang chính giữ quyền gọi win.close()
    // và trang phụ có thể theo dõi window.opener.closed
    const subWin = window.open(url, target);
    if (subWin) {
      activeSubWindows.push(subWin);
    }
    return subWin;
  } catch (err) {
    console.warn('Cannot open managed sub-window, fallback to regular window.open', err);
    return window.open(url, target);
  }
}
