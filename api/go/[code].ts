import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * XOR key phải trùng 100% với src/utils/goLink.ts (XOR_KEY) — không thể import từ
 * thư mục ngoài api/ vì Vercel bundle ESM sẽ không resolve được.
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

/** base64url → bytes. */
function base64UrlToBytes(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Giải mã mã → chuỗi payload gốc. Trả về '' nếu mã không hợp lệ. */
function decodeCodeToText(code: string): string {
  try {
    return new TextDecoder().decode(xorBytes(base64UrlToBytes(code)));
  } catch {
    return '';
  }
}

interface GoPayload {
  u?: string;
  t?: string;
  a?: string;
  e?: string;
}

function normalizeUrl(rawUrl: string): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function escapeHtml(value: string): string {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * GET /go/:code
 * Đổi payload {u, t, a, e} từ mã trong link, trả về TRANG KHUNG trên domain của mình:
 * khung trình duyệt giả + thông tin tác giả (tên + email liên hệ) + iframe nạp mô
 * phỏng. URL gốc và cả link /go/<mã> đều không hiện ra giao diện.
 * Tích hợp cơ chế "Thoát trang chính là thoát hết" (Sub-window Lifecycle).
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const urlPath = (req.url || '').split('?')[0];
  const queryCode = ((req as any).query && (req as any).query.code) as string | undefined;
  const code = (queryCode || urlPath.split('/').pop() || '').trim();

  let payload: GoPayload = {};
  try {
    payload = JSON.parse(decodeCodeToText(code) || '{}') as GoPayload;
  } catch {
    payload = {};
  }

  const target = normalizeUrl(payload.u || '');
  if (!target) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      '<!doctype html><html lang="vi"><meta charset="utf-8"><title>Không tìm thấy</title>' +
        '<body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">' +
        '<div style="text-align:center"><h1 style="margin:0 0 8px">404</h1>' +
        '<p style="margin:0 0 16px;color:#94a3b8">Không tìm thấy mô phỏng với mã này.</p>' +
        '<a href="/" style="color:#818cf8;text-decoration:none">← Về trang chủ</a></div></body></html>'
    );
    return;
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers.host as string) ||
    'localhost';
  const homeUrl = `${proto}://${host}/`;

  const title = escapeHtml((payload.t || '').trim() || 'Mô phỏng học tập');
  const author = escapeHtml((payload.a || '').trim() || 'Thành viên');
  const email = escapeHtml((payload.e || '').trim());
  const frameSrc = escapeHtml(target);
  const initial = author.trim().charAt(0).toUpperCase();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${title} — OpenEduLab</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: #e2e8f0;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px; gap: 12px;
  }
  .frame {
    width: 100%; max-width: 1240px; flex: 1; min-height: 0;
    background: #1e293b;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    display: flex; flex-direction: column;
  }
  .chrome {
    background: #0b1220;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    padding: 8px 12px; display: flex; align-items: center; gap: 10px;
  }
  .brand { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 12px; flex: none; }
  .brand-badge {
    width: 26px; height: 26px; border-radius: 8px;
    background: linear-gradient(135deg, #0785F9, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #fff;
  }
  .brand-label { white-space: nowrap; color: #f8fafc; font-weight: 700; }
  .brand .dots { display: flex; gap: 5px; margin: 0 2px; }
  .brand .dot { width: 9px; height: 9px; border-radius: 50%; }
  .brand .dot.r { background: #f87171; }
  .brand .dot.y { background: #fbbf24; }
  .brand .dot.g { background: #34d399; }
  .author-info {
    flex: 1; min-width: 0;
    background: rgba(148, 163, 184, 0.12);
    border-radius: 8px; padding: 5px 10px;
    font-size: 12px; font-weight: 600;
    color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 8px;
  }
  .author-info .avatar { flex: none; }
  .author-info .meta { min-width: 0; display: flex; align-items: center; gap: 8px; overflow: hidden; }
  .author-info .name { color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; }
  .author-info .email { color: #818cf8; text-decoration: none; }
  .author-info .email:hover { text-decoration: underline; }
  .author-info .email.inline { display: inline; }
  .contact-btn {
    flex: none; display: none;
    background: rgba(129, 140, 248, 0.18);
    border: 1px solid rgba(129, 140, 248, 0.4);
    color: #c7d2fe;
    width: 22px; height: 22px; border-radius: 6px;
    align-items: center; justify-content: center;
    cursor: pointer; padding: 0; font-size: 12px; line-height: 1;
  }
  .contact-btn:hover { background: rgba(129, 140, 248, 0.35); color: #fff; }
  .viewport { position: relative; flex: 1; min-height: 0; background: #fff; }
  iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }
  .author-badge {
    position: absolute; left: 14px; bottom: 14px;
    background: rgba(2, 6, 23, 0.72);
    color: #e2e8f0; font-size: 11px; font-weight: 600;
    padding: 7px 12px; border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; gap: 7px;
    pointer-events: none;
  }
  .avatar {
    width: 18px; height: 18px; border-radius: 50%;
    background: linear-gradient(135deg, #0785F9, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 800; color: #fff;
  }
  /* Nút mở rộng / thu nhỏ / mở cửa sổ mới / về trang chủ */
  .chrome-btn {
    flex: none;
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #cbd5e1;
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; padding: 0;
    transition: background 0.15s, color 0.15s;
  }
  .chrome-btn:hover { background: rgba(148, 163, 184, 0.3); color: #fff; }
  .chrome-btn svg { width: 15px; height: 15px; }
  .back {
    flex: none;
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(7, 133, 249, 0.18);
    border: 1px solid rgba(7, 133, 249, 0.4);
    color: #93c5fd; text-decoration: none;
    height: 28px; padding: 0 10px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    transition: background 0.15s, color 0.15s;
  }
  .back:hover { background: rgba(7, 133, 249, 0.35); color: #fff; }
  .back .back-arrow { font-size: 13px; line-height: 1; }
  .back .back-label { white-space: nowrap; }
  /* Popup email liên hệ */
  .mail-popup {
    position: fixed; z-index: 100; display: none;
    background: #0f172a; border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 12px; padding: 12px 14px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    flex-direction: column; gap: 10px; min-width: 220px;
  }
  .mail-popup.open { display: flex; }
  .mail-popup .mail-popup-title { font-size: 11px; color: #94a3b8; font-weight: 600; }
  .mail-popup .mail-popup-link {
    color: #818cf8; font-size: 13px; font-weight: 600;
    text-decoration: none; word-break: break-all; overflow-wrap: anywhere;
  }
  .mail-popup .mail-popup-link:hover { text-decoration: underline; }
  .mail-popup .mail-popup-close {
    align-self: flex-end;
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #cbd5e1; text-align: center;
    border-radius: 6px; padding: 5px 14px; cursor: pointer;
  }
  .mail-popup .mail-popup-close:hover { background: rgba(148, 163, 184, 0.3); color: #fff; }
  .mail-mask {
    position: fixed; inset: 0; z-index: 99; display: none; background: transparent;
  }
  .mail-mask.open { display: block; }
  /* Mobile: ẩn text brand + text nút về trang chủ, chỉ ký hiệu */
  @media (max-width: 640px) {
    .brand { gap: 6px; }
    .brand-label, .back-label { display: none; }
    .back { padding: 0 8px; }
    .chrome { padding: 7px 9px; gap: 8px; }
  }
  /* Khi màn hình hẹp: ẩn email text hiện nút ✉ */
  @media (max-width: 768px) {
    .author-info .email.inline { display: none; }
    .contact-btn { display: inline-flex; }
  }
  /* Toàn màn hình: khung che cả màn hình */
  body.is-fullscreen .frame {
    position: fixed; inset: 0; z-index: 50;
    max-width: none; width: 100vw; height: 100vh;
    border-radius: 0; border: none;
  }
  /* Thu nhỏ: chỉ còn thanh trình duyệt giả (ẩn viewport) */
  body.is-collapsed .viewport { display: none; }
  body.is-collapsed .frame { flex: 0 0 auto; max-height: 48px; }
</style>
</head>
<body>
  <div class="frame">
    <div class="chrome">
      <div class="brand">
        <span class="brand-badge">OL</span>
        <span class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></span>
        <span class="brand-label">OpenEduLab</span>
      </div>
      <div class="author-info">
        <span class="avatar">${initial}</span>
        <span class="meta">
          <span class="name">${author}</span>
          ${email ? `<a class="email inline" href="mailto:${email}">${email}</a>` : ''}
        </span>
        ${email ? `<button class="contact-btn" id="btnContact" title="Liên hệ" aria-label="Liên hệ" type="button">&#9993;</button>` : ''}
      </div>
      <button class="chrome-btn" id="btnCollapse" title="Thu nhỏ" aria-label="Thu nhỏ" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16H3"/></svg>
      </button>
      <button class="chrome-btn" id="btnExpand" title="Mở rộng toàn màn hình" aria-label="Mở rộng toàn màn hình" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"/><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M16 21h5v-5"/></svg>
      </button>
      <button class="chrome-btn" id="btnNewTab" title="Mở sang cửa sổ độc lập (nếu nguồn chặn nhúng)" aria-label="Mở sang cửa sổ độc lập" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </button>
      <a class="back" href="${homeUrl}"><span class="back-arrow">&larr;</span><span class="back-label">Về trang chủ</span></a>
    </div>
    <div class="viewport">
      <iframe id="simFrame" src="${frameSrc}" title="${title}" allowfullscreen allow="fullscreen; autoplay; geolocation; microphone; camera; midi"></iframe>
      <div class="author-badge"><span class="avatar">${initial}</span><span>${author}</span></div>
    </div>
  </div>

  <div class="mail-mask" id="mailMask"></div>
  ${email ? `<div class="mail-popup" id="mailPopup" role="dialog" aria-label="Thông tin liên hệ">
    <span class="mail-popup-title">Liên hệ tác giả</span>
    <a class="mail-popup-link" href="mailto:${email}">${email}</a>
    <button class="mail-popup-close" type="button">Đóng</button>
  </div>` : ''}

  <script>
    (function () {
      var body = document.body;
      var btnCollapse = document.getElementById('btnCollapse');
      var btnExpand = document.getElementById('btnExpand');
      var btnNewTab = document.getElementById('btnNewTab');
      var realUrl = ${JSON.stringify(target)};

      // 1. Thoát trang chính là thoát hết (Auto close when parent tab is closed)
      try {
        if (window.opener) {
          var closeWatcher = setInterval(function () {
            try {
              if (!window.opener || window.opener.closed) {
                clearInterval(closeWatcher);
                window.close();
              }
            } catch (e) {
              clearInterval(closeWatcher);
            }
          }, 600);
        }
      } catch (e) {}

      // 2. Nút mở sang cửa sổ mới an toàn (kết nối opener)
      btnNewTab && btnNewTab.addEventListener('click', function () {
        var subWin = window.open(realUrl, '_blank');
        if (window.opener && subWin) {
          // Lưu lại để quản lý nếu cần
        }
      });

      // 3. Nút thu nhỏ / mở rộng
      btnCollapse && btnCollapse.addEventListener('click', function () {
        body.classList.toggle('is-collapsed');
        var collapsed = body.classList.contains('is-collapsed');
        btnCollapse.setAttribute('title', collapsed ? 'Mở rộng' : 'Thu nhỏ');
        btnCollapse.setAttribute('aria-label', collapsed ? 'Mở rộng' : 'Thu nhỏ');
      });
      btnExpand && btnExpand.addEventListener('click', function () {
        body.classList.toggle('is-fullscreen');
        var full = body.classList.contains('is-fullscreen');
        btnExpand.setAttribute('title', full ? 'Thoát toàn màn hình' : 'Mở rộng toàn màn hình');
        btnExpand.setAttribute('aria-label', full ? 'Thoát toàn màn hình' : 'Mở rộng toàn màn hình');
      });

      // 4. Popup liên hệ tác giả
      var btnContact = document.getElementById('btnContact');
      var mailPopup = document.getElementById('mailPopup');
      var mailMask = document.getElementById('mailMask');
      function openPopup() {
        if (!mailPopup) return;
        mailPopup.classList.add('open');
        if (mailMask) mailMask.classList.add('open');
        var rect = btnContact.getBoundingClientRect();
        var pw = mailPopup.offsetWidth;
        var x = Math.min(Math.max(8, rect.left + rect.width / 2 - pw / 2), window.innerWidth - pw - 8);
        var y = rect.bottom + 8;
        mailPopup.style.left = x + 'px';
        mailPopup.style.top = y + 'px';
      }
      function closePopup() {
        if (mailPopup) mailPopup.classList.remove('open');
        if (mailMask) mailMask.classList.remove('open');
      }
      if (btnContact) {
        btnContact.addEventListener('click', function (e) {
          e.stopPropagation();
          mailPopup.classList.contains('open') ? closePopup() : openPopup();
        });
      }
      if (mailMask) mailMask.addEventListener('click', closePopup);
      var closeBtn = mailPopup && mailPopup.querySelector('.mail-popup-close');
      closeBtn && closeBtn.addEventListener('click', closePopup);
    })();
  </script>
</body>
</html>`);
}
