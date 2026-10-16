/**
 * Tạo link che cho mỗi mô phỏng: payload {url, title, authorName} được mã hóa
 * (XOR + base64url) đưa thẳng vào link. Serverless decode rồi trả về TRANG KHUNG
 * trên domain của mình (iframe + tên tác giả) — thanh địa chỉ luôn hiện
 * https://<domain>/go/<mã-hóa>, KHÔNG lộ URL gốc cho người mở link.
 *
 * Lưu ý: mã dễ giải mã nếu biết key (key nằm ở 2 phía). Mục đích là che URL gốc
 * khỏi giao diện/thanh địa chỉ cho người dùng thường — không phải bảo mật cao cấp.
 */

const XOR_KEY = 'webhub-go-v2#sbx7q';

/** XOR từng byte theo key (2 chiều giống nhau). */
function xorBytes(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ XOR_KEY.charCodeAt(i % XOR_KEY.length);
  }
  return out;
}

/** Bytes → base64url chuẩn (không có dấu '=' padding). */
function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** base64url → bytes. */
function base64UrlToBytes(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Mã hóa một chuỗi → mã ngắn dạng base64url (đưa vào path của link che). */
export function encodeToCode(text: string): string {
  return bytesToBase64Url(xorBytes(new TextEncoder().encode(text)));
}

/** Giải mã mã → chuỗi gốc. Trả về '' nếu mã không hợp lệ. */
export function decodeCodeToText(code: string): string {
  try {
    return new TextDecoder().decode(xorBytes(base64UrlToBytes(code)));
  } catch {
    return '';
  }
}

export interface GoLinkMeta {
  title?: string;
  authorName?: string;
  authorEmail?: string;
}

/**
 * Link che đầy đủ của một mô phỏng:
 *   https://<domain>/go/<mã-hóa>  → TRANG KHUNG (iframe) giữ nguyên domain,
 *   thanh địa chỉ không lộ URL gốc. Dùng cho nút Truy cập, Chia sẻ, Copy, QR.
 */
export function getGoUrl(
  location: { origin: string },
  realUrl: string,
  meta?: GoLinkMeta
): string {
  const payload = JSON.stringify({
    u: realUrl,
    t: (meta && meta.title) || '',
    a: (meta && meta.authorName) || '',
    e: (meta && meta.authorEmail) || '',
  });
  return `${location.origin}/go/${encodeToCode(payload)}`;
}