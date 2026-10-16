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
    setImageLoaded(false);
    setImageError(false);
  }, [screenshotUrl]);

  const aspectClass =
    aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : aspectRatio === 'standard'
      ? 'aspect-[4/3]'
      : 'aspect-[16/10]';

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Browser chrome header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 border-b border-slate-200/70 select-none text-xs text-slate-600">
        {/* Window controls */}
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block border border-rose-500/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block border border-amber-500/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block border border-emerald-500/20" />
        </div>

        {/* Address bar simulation */}
        <div className="flex-1 max-w-[240px] sm:max-w-[280px] mx-2 flex items-center justify-center space-x-1 px-2.5 py-0.5 bg-white rounded-md border border-slate-200 text-[11px] text-slate-500 truncate shadow-xs">
          <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate font-mono">{domain || 'preview.web'}</span>
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
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 select-none z-5"
                aria-hidden="true"
              >
                <div className="w-5 h-5 border-2 border-indigo-400/25 border-t-indigo-400 rounded-full animate-spin mb-1.5" />
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  {lang === 'vi' ? 'Đang tải...' : 'Loading...'}
                </span>
              </div>
            )}
            <img
              src={screenshotUrl}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* Fallback sleek simulated screen */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="font-semibold text-sm max-w-[85%] truncate text-slate-100">{title}</p>
            <p className="text-xs text-indigo-300 font-mono mt-1 truncate max-w-[90%]">{url}</p>
            <div className="mt-3 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{t.httpsSecure}</span>
            </div>
          </div>
        )}

        {/* Author name badge (bottom-left of the simulated webpage) */}
        {authorName && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-1.5 max-w-[85%] px-2 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/10 text-white shadow-md">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 text-white flex items-center justify-center shrink-0">
              <User className="w-2 h-2" />
            </span>
            <span className="truncate text-[10px] font-semibold leading-tight">
              {authorName}
            </span>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.openWebsiteDirect}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
