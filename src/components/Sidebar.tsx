import React from 'react';
import {
  LayoutGrid,
  FlaskConical,
  Calculator,
  Cpu,
  BookText,
  Languages,
  Compass,
  Sparkles,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import { CategoryId, Language } from '../types';
import { translations } from '../translations';
import { RocketFlying } from './RocketFlying';

interface SidebarProps {
  currentCategory: CategoryId | 'ALL' | string;
  onSelectCategory: (category: CategoryId | 'ALL' | string) => void;
  showGuide: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
  onOpenSubmit: () => void;
  lang: Language;
  totalCount: number;
}

// Danh mục đầy đủ các môn học cấp THCS (Chương trình GDPT)
interface THCSSubject {
  id: CategoryId | 'ALL' | string;
  name: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  showGuide,
  onOpenGuide,
  onCloseGuide,
  onOpenSubmit,
  totalCount,
}) => {
  const thcsSubjects: THCSSubject[] = [
    {
      id: 'ALL',
      name: 'Tất cả môn học',
      icon: <LayoutGrid className="w-4 h-4 text-[#0785F9]" />,
    },
    {
      id: 'natural_sciences',
      name: 'Khoa học tự nhiên',
      icon: <FlaskConical className="w-4 h-4 text-[#24B34B]" />,
      badge: 'Lý-Hóa-Sinh',
    },
    {
      id: 'math',
      name: 'Toán học',
      icon: <Calculator className="w-4 h-4 text-[#FF8A18]" />,
    },
    {
      id: 'informatics',
      name: 'Tin học & Công nghệ',
      icon: <Cpu className="w-4 h-4 text-[#0785F9]" />,
    },
    {
      id: 'literature',
      name: 'Ngữ văn',
      icon: <BookText className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'english',
      name: 'Tiếng Anh',
      icon: <Languages className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'history',
      name: 'Lịch sử & Địa lí',
      icon: <Compass className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'general',
      name: 'GDCD & Môn khác',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
  ];

  const handleSelectSubject = (id: CategoryId | 'ALL' | string) => {
    if (showGuide) onCloseGuide();
    onSelectCategory(id);
  };

  const handleOpenKienTao = () => {
    onOpenGuide();
  };

  return (
    <aside
      className="hidden md:flex flex-col w-54 lg:w-56 shrink-0 bg-white border border-[#E2EDF8] rounded-2xl p-3 shadow-xs sticky top-20 self-start text-xs max-h-[calc(100vh-6rem)] justify-between"
      aria-label="Thanh danh mục môn học THCS"
    >
      {/* 1. Phần Môn học THCS (tích hợp thay thế trang chủ) */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-1">
        <div className="flex items-center justify-between px-2.5 pb-2 pt-1 border-b border-[#E2EDF8] mb-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#0B3B78] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#0785F9]" />
            <span>Môn học THCS</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E2F1FF] text-[#0785F9] font-bold">
            {totalCount}
          </span>
        </div>

        <div className="space-y-0.5">
          {thcsSubjects.map((subject) => {
            const isSelected = !showGuide && currentCategory === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#E2F1FF] text-[#0785F9] font-bold shadow-xs'
                    : 'text-[#23466F] hover:bg-slate-50 hover:text-[#0785F9]'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="shrink-0">{subject.icon}</span>
                  <span className="truncate">{subject.name}</span>
                </div>
                {subject.badge && !isSelected && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-[#58779B] shrink-0">
                    {subject.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Đường kẻ phân cách */}
      <div className="my-2.5 border-t border-[#E2EDF8]" />

      {/* 3. Phần KIẾN TẠO độc lập dưới góc trái + Nút Chia sẻ */}
      <div className="space-y-2 shrink-0">
        {/* Nút Kiến tạo độc lập */}
        <button
          id="sidebar-nav-kientao"
          onClick={handleOpenKienTao}
          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
            showGuide
              ? 'bg-[#E2F1FF] border-[#0785F9] shadow-xs ring-2 ring-[#0785F9]/20'
              : 'bg-[#F8FBFF] hover:bg-[#E2F1FF]/60 border-[#E2EDF8] hover:border-[#0785F9]/30'
          }`}
          title="Mở cẩm nang hướng dẫn tạo mô phỏng AI"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E2EDF8] flex items-center justify-center shrink-0 shadow-xs">
            <RocketFlying className="w-5 h-5 animate-rocket" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0B3B78] text-xs">Kiến tạo</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                AI Prompt
              </span>
            </div>
            <p className="text-[10px] text-[#58779B] truncate leading-tight mt-0.5">
              Cẩm nang tạo mô phỏng
            </p>
          </div>
        </button>

        {/* Nút Chia sẻ mô phỏng */}
        <button
          onClick={onOpenSubmit}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          title="Đăng tải và chia sẻ mô phỏng của bạn"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Chia sẻ mô phỏng</span>
        </button>
      </div>
    </aside>
  );
};
