import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  RotateCw,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Radio,
  Server,
  Layers,
} from 'lucide-react';
import { WebProject, Language } from '../types';
import { openManagedWindow } from '../utils/windowManager';
import { resolveGoUrl } from '../utils/goLink';

interface SimulationRunnerModalProps {
  project: WebProject | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SimulationRunnerModal: React.FC<SimulationRunnerModalProps> = ({
  project,
  isOpen,
  onClose,
  lang,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [sourceMode, setSourceMode] = useState<'embedded' | 'dev_port'>('embedded');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLocalProject =
    project?.id === 'proj-openlab-3d' || project?.id === 'proj-khucxa-pxtp';

  const isLocalhostHost =
    typeof window !== 'undefined' &&
    window.location &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.'));

  const getEmbeddedUrl = useCallback((proj: WebProject): string => {
    if (proj.id === 'proj-openlab-3d') return '/simulations/openlab-3d/index.html';
    if (proj.id === 'proj-khucxa-pxtp') return '/simulations/khucxa-pxtp/index.html';
    return proj.url.startsWith('/') ? proj.url : proj.url;
  }, []);

  const getDevPortUrl = useCallback((proj: WebProject): string | null => {
    if (proj.id === 'proj-openlab-3d') return 'http://localhost:3001';
    if (proj.id === 'proj-khucxa-pxtp') return 'http://localhost:3002';
    return null;
  }, []);

  // Determine current active URL
  const currentActiveUrl = useCallback(() => {
    if (!project) return '';
    if (isLocalProject) {
      if (sourceMode === 'dev_port') {
        return getDevPortUrl(project) || getEmbeddedUrl(project);
      }
      return getEmbeddedUrl(project);
    }
    return project.url;
  }, [project, isLocalProject, sourceMode, getDevPortUrl, getEmbeddedUrl]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLoadError(false);
      setSourceMode('embedded'); // Luôn mặc định mở Bản tích hợp sẵn (100% tin cậy, không bị lỗi port)
      setToastMessage(null);
      setIframeKey((k) => k + 1);
    }
  }, [isOpen, project?.id]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !project) return null;

  const activeUrl = currentActiveUrl();

  const handleReload = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    if (isLocalProject && sourceMode === 'embedded') {
      openManagedWindow(getEmbeddedUrl(project));
      return;
    }
    const goUrl = resolveGoUrl(project);
    openManagedWindow(goUrl || activeUrl);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Chuyển đổi giữa Bản nhúng tích hợp và Cổng Dev Localhost
  const handleSwitchSource = async (newMode: 'embedded' | 'dev_port') => {
    if (newMode === sourceMode) return;
    if (newMode === 'dev_port') {
      const devUrl = getDevPortUrl(project);
      if (!devUrl) return;

      setIsLoading(true);
      setToastMessage(`Đang kiểm tra kết nối tới ${devUrl}...`);

      // Kiểm tra xem cổng dev có đang chạy không
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        await fetch(devUrl, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);

        // Server đang chạy -> Chuyển sang dev_port
        setSourceMode('dev_port');
        setToastMessage(`Đã kết nối thành công tới ${devUrl}!`);
        setTimeout(() => setToastMessage(null), 3000);
        setIsLoading(false);
        setIframeKey((k) => k + 1);
      } catch {
        // Cổng dev không chạy -> Thông báo và giữ nguyên Bản nhúng tích hợp sẵn
        setToastMessage(
          `⚠️ Không tìm thấy server tại ${devUrl}. Hãy chạy lệnh "npm run dev" trong thư mục mô phỏng (hoặc file start-all-local.bat). Hệ thống tiếp tục dùng Bản nhúng tích hợp sẵn.`
        );
        setTimeout(() => setToastMessage(null), 5000);
        setSourceMode('embedded');
        setIsLoading(false);
      }
    } else {
      setSourceMode('embedded');
      setIsLoading(true);
      setToastMessage(null);
      setIframeKey((k) => k + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div
        ref={containerRef}
        className={`relative w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'h-full w-full rounded-none border-none'
            : 'max-w-[1536px] h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
          {/* Project Title & Badges */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0785F9] to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {project.title}
                </h3>
                {isLocalProject && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Bản Quyền Him Lam
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Tác giả: {project.authorName} · Lĩnh vực 21: Phần mềm hệ thống &amp; KHTN THCS
              </p>
            </div>
          </div>

          {/* Source Switcher for Local Core Projects */}
          {isLocalProject && isLocalhostHost && (
            <div className="hidden md:flex items-center space-x-1 px-1.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs shrink-0 mx-2">
              <button
                type="button"
                onClick={() => handleSwitchSource('embedded')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  sourceMode === 'embedded'
                    ? 'bg-[#0785F9] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bản tích hợp sẵn (không cần bật thêm terminal, luôn chạy ngay lập tức)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bản tích hợp</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSource('dev_port')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  sourceMode === 'dev_port'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cổng Dev Live (Port 3001/3002) - Cần chạy terminal npm run dev"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Cổng Dev</span>
              </button>
            </div>
          )}

          {/* Action Tools */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Reload button */}
            <button
              onClick={handleReload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tải lại mô phỏng"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Open in new tab button */}
            <button
              onClick={handleOpenExternal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:flex items-center space-x-1"
              title="Mở toàn màn hình trong cửa sổ riêng"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs">Tab mới</span>
            </button>

            {/* Fullscreen toggle button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
              title="Đóng trình chạy (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-xl px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs shadow-xl backdrop-blur-md flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1 leading-relaxed">{toastMessage}</span>
          </div>
        )}

        {/* Viewport Simulation Area */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 space-y-3">
              <div className="w-8 h-8 border-3 border-[#0785F9] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-400">
                Đang khởi động môi trường mô phỏng trực quan OpenLab 3D...
              </p>
            </div>
          )}

          {/* Load error recovery view */}
          {loadError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="text-center max-w-md space-y-1">
                <h4 className="text-base font-bold text-white">Không thể kết nối đến mô phỏng</h4>
                <p className="text-xs text-slate-400">
                  Địa chỉ {activeUrl} không phản hồi. Bạn có thể chuyển sang Bản tích hợp sẵn hoặc mở trong tab mới.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => handleSwitchSource('embedded')}
                  className="px-4 py-2 rounded-xl bg-[#0785F9] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Dùng Bản tích hợp sẵn
                </button>
                <button
                  onClick={handleReload}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Iframe Runner */}
          <iframe
            key={iframeKey}
            src={activeUrl}
            title={project.title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; cross-origin-isolated"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setLoadError(true);
            }}
          />

          {/* Helper hint for running source */}
          {isLocalProject && (
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none opacity-70 hover:opacity-100 transition-opacity">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] text-slate-300 font-medium shadow-md backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {sourceMode === 'embedded'
                    ? 'Nguồn: Bản nhúng OpenLab 3D tích hợp sẵn (Offline & Vercel)'
                    : `Nguồn: Cổng Dev Local (${activeUrl})`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
