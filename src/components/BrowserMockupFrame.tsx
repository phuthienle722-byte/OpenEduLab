import React, { useState } from 'react';
import { ExternalLink, Globe, Lock, ShieldCheck, User } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { extractDomain, getWebsiteScreenshotUrl, isMshotsTimingThumbnail } from '../utils/screenshot';

interface BrowserMockupFrameProps {
  url: string;
  title: string;
  previewImage?: string;
  authorName?: string;
  displayUrl?: string;
  onClick?: () => void;
  aspectRatio?: 'video' | 'wide' | 'standard';
  lang: Language;
  isAdmin?: boolean;
}

export const BrowserMockupFrame: React.FC<BrowserMockupFrameProps> = ({
  url,
  title,
  previewImage,
  authorName,
  displayUrl,
  onClick,
  aspectRatio = 'video',
  lang,
  isAdmin = false,
}) => {
  const t = translations[lang];
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const domain = extractDomain(displayUrl || url);
  // Không dùng preview do mshots sinh theo URL thật (nó chứa link gốc trong URL ảnh).
  // Sinh lại thumbnail từ link nội bộ /go/<code> → mshots chụp trang sau 302 redirect,
  // chỉ lộ domain nội bộ chứ không lộ domain mô phỏng thật.
  const safePreview = !isMshotsTimingThumbnail(previewImage) ? previewImage : undefined;
  const screenshotUrl = getWebsiteScreenshotUrl(displayUrl || url, safePreview);

  React.useEffect(() => {
    if (screenshotUrl && screenshotUrl.startsWith('data:image/')) {
      setImageLoaded(true);
      setImageError(false);
      return;
    }
    setImageLoaded(false);
    setImageError(false);
  }, [screenshotUrl]);

  const aspectClass =
    aspectRatio === 'standard'
      ? 'aspect-4/3'
      : aspectRatio === 'wide'
      ? 'aspect-21/9'
      : 'aspect-video';

  return (
    <div
      onClick={onClick}
      className={`group/frame relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Mock Browser Top Bar */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        {/* Window controls */}
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block border border-rose-500/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block border border-amber-500/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block border border-emerald-500/20" />
        </div>

        {/* Address bar simulation: Ẩn link gốc với khách, hiển thị nhãn an toàn */}
        <div className="flex-1 max-w-[240px] sm:max-w-[280px] mx-2 flex items-center justify-center space-x-1 px-2.5 py-0.5 bg-white rounded-md border border-slate-200 text-[11px] text-slate-500 truncate shadow-xs">
          <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate font-mono font-medium text-slate-600">
            {isAdmin ? (domain || 'preview.web') : 'openedulab.vn/mo-phong'}
          </span>
        </div>

        {/* External link cue */}
        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Website Viewport simulation */}
      <div className={`relative w-full ${aspectClass} bg-slate-900 overflow-hidden`}>
        {!imageError && screenshotUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 space-y-2 z-10">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                  {t.generatingPreview}
                </span>
              </div>
            )}
            <img
              key={screenshotUrl}
              src={screenshotUrl}
              alt={`${t.previewFor} ${title}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              className={`w-full h-full object-cover object-top transition-all duration-500 group-hover/frame:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-center relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center mb-3 shadow-inner group-hover/frame:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 line-clamp-1 max-w-[90%] mb-1">
              {title}
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[85%] font-mono">
              {isAdmin ? (domain || 'preview.web') : 'openedulab.vn/mo-phong'}
            </p>

            <div className="mt-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-semibold text-indigo-300">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>{t.interactiveSim}</span>
            </div>
          </div>
        )}

        {/* Floating Author Watermark Badge (Pill) */}
        {authorName && (
          <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium shadow-lg pointer-events-none transition-transform group-hover/frame:scale-105">
            <User className="w-3 h-3 text-indigo-300" />
            <span className="truncate max-w-[150px] font-medium tracking-tight">
              {authorName}
            </span>
          </div>
        )}

        {/* Hover overlay hint */}
        {onClick && (
          <div className="absolute inset-0 bg-slate-950/0 group-hover/frame:bg-slate-950/30 transition-colors flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover/frame:opacity-100 transform translate-y-2 group-hover/frame:translate-y-0 transition-all duration-200 px-3 py-1.5 rounded-lg bg-indigo-600/90 text-white text-xs font-semibold shadow-lg flex items-center space-x-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.openLiveSite}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
