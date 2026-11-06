import React, { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLoadError(false);
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

  const targetUrl = project.url;
  const isLocalProject =
    project.id === 'proj-openlab-3d' || project.id === 'proj-khucxa-pxtp';

  const handleReload = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    const goUrl = resolveGoUrl(project);
    openManagedWindow(goUrl || project.url);
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

        {/* Viewport Simulation Area */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 space-y-3">
              <div className="w-8 h-8 border-3 border-[#0785F9] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-400">
                Đang khởi động môi trường mô phỏng trực quan...
              </p>
            </div>
          )}

          {/* Iframe Runner */}
          <iframe
            key={iframeKey}
            src={targetUrl}
            title={project.title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setLoadError(true);
            }}
          />

          {/* Helper hint for local dev port */}
          {isLocalProject && (
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] text-slate-400 font-mono shadow-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Local Port: {targetUrl}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
