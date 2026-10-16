import React from 'react';
import {
  Home,
  Sparkles,
  UploadCloud,
  Rocket,
  BookOpen,
  LayoutGrid,
  FlaskConical,
  Calculator,
  Cpu,
  Languages,
  PlusCircle,
  Atom,
} from 'lucide-react';
import { CategoryId, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  currentCategory: CategoryId | 'ALL';
  onSelectCategory: (category: CategoryId | 'ALL') => void;
  onlyFamous: boolean;
  onToggleFamous: (isFamous: boolean) => void;
  showGuide: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
  onOpenSubmit: () => void;
  lang: Language;
  approvedCount: number;
  famousCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  onlyFamous,
  onToggleFamous,
  showGuide,
  onOpenGuide,
  onCloseGuide,
  onOpenSubmit,
  lang,
  approvedCount,
  famousCount,
}) => {
  const t = translations[lang];

  // Helper when clicking main navigation links
  const handleNavHome = () => {
    onCloseGuide();
    onToggleFamous(false);
    onSelectCategory('ALL');
  };

  const handleNavFamous = () => {
    onCloseGuide();
    onToggleFamous(true);
  };

  const handleNavCommunity = () => {
    onCloseGuide();
    onToggleFamous(false);
  };

  const handleNavStem = () => {
    onCloseGuide();
    onSelectCategory('stem');
  };

  const handleNavGuide = () => {
    onOpenGuide();
  };

  return (
    <aside
      className="hidden md:flex flex-col w-54 lg:w-56 shrink-0 bg-white border border-[#E2EDF8] rounded-2xl p-3.5 shadow-xs sticky top-20 self-start text-xs max-h-[calc(100vh-6rem)] overflow-y-auto"
      aria-label="Thanh điều hướng danh mục"
    >
      {/* 1. Nhóm Điều hướng chính */}
      <div className="space-y-1">
        <button
          id="sidebar-nav-home"
          onClick={handleNavHome}
          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
            !showGuide && !onlyFamous && currentCategory === 'ALL'
              ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
              : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="truncate">Trang chủ</span>
        </button>

        <button
          id="sidebar-nav-famous"
          onClick={handleNavFamous}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
            !showGuide && onlyFamous
              ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
              : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
          }`}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Mô phỏng nổi tiếng</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {famousCount}
          </span>
        </button>

        <button
          id="sidebar-nav-community"
          onClick={handleNavCommunity}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
            !showGuide && !onlyFamous && currentCategory !== 'ALL'
              ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
              : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
          }`}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <UploadCloud className="w-4 h-4 text-[#0785F9] shrink-0" />
            <span className="truncate">Cộng đồng chia sẻ</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {approvedCount}
          </span>
        </button>

        <button
          id="sidebar-nav-stem"
          onClick={handleNavStem}
          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
            !showGuide && currentCategory === 'stem'
              ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
              : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
          }`}
        >
          <Rocket className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="truncate">Dự án STEM</span>
        </button>

        <button
          id="sidebar-nav-guide"
          onClick={handleNavGuide}
          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-left ${
            showGuide
              ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
              : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Cẩm nang tạo AI</span>
        </button>
      </div>

      {/* Đường kẻ phân cách */}
      <div className="my-3 border-t border-[#E2EDF8]" />

      {/* 2. Nhóm Môn học */}
      <div>
        <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[#58779B] uppercase">
          Môn học
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('ALL');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'ALL'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Tất cả môn học</span>
          </button>

          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('natural_sciences');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'natural_sciences'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#24B34B] shrink-0" />
            <span className="truncate">Khoa học tự nhiên</span>
          </button>

          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('math');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'math'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#FF8A18] shrink-0" />
            <span className="truncate">Toán học</span>
          </button>

          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('informatics');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'informatics'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#0785F9] shrink-0" />
            <span className="truncate">Tin học & Công nghệ</span>
          </button>

          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('physics');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'physics'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
            <span className="truncate">Vật lí</span>
          </button>

          <button
            onClick={() => {
              onCloseGuide();
              onSelectCategory('english');
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-left ${
              !showGuide && currentCategory === 'english'
                ? 'bg-[#E2F1FF] text-[#0B3B78] font-bold'
                : 'text-[#23466F] hover:bg-slate-50'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Tiếng Anh</span>
          </button>
        </div>
      </div>

      {/* Đường kẻ phân cách */}
      <div className="my-3 border-t border-[#E2EDF8]" />

      {/* 3. Lời mời đóng góp bài (thân thiện với học sinh & thầy cô) */}
      <div className="mt-auto pt-1 bg-[#F8FBFF] p-3 rounded-xl border border-[#E2EDF8]">
        <p className="text-[11px] font-medium text-[#23466F] mb-2 leading-tight">
          Bạn có mô phỏng hay? Chia sẻ cùng mọi người nhé!
        </p>
        <button
          onClick={onOpenSubmit}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Chia sẻ mô phỏng</span>
        </button>
      </div>
    </aside>
  );
};
