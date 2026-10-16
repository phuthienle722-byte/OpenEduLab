import React from 'react';
import {
  AlignLeft,
  LayoutGrid,
  RotateCcw,
  Sparkles,
  UploadCloud,
  Layers,
} from 'lucide-react';
import {
  CategoryId,
  EducationLevelId,
  FilterState,
  Language,
  ViewMode,
} from '../types';
import { translations } from '../translations';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  lang: Language;
  totalResults: number;
  approvedCount: number;
  famousCount: number;
  onOpenSubmit?: () => void;
  showGuide?: boolean;
  onOpenGuide?: () => void;
  onCloseGuide?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  lang,
  totalResults,
  approvedCount,
  famousCount,
  showGuide,
  onOpenGuide,
  onCloseGuide,
}) => {
  const t = translations[lang];

  const toggleFamousFilter = (isFamous: boolean) => {
    onFilterChange({ ...filters, onlyFamous: isFamous });
    if (onCloseGuide) onCloseGuide();
  };

  const handleLevelChange = (educationLevel: EducationLevelId | 'ALL') => {
    onFilterChange({ ...filters, educationLevel });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      category: 'ALL',
      educationLevel: 'ALL',
      sortBy: 'newest',
      onlyFamous: false,
    });
    if (onCloseGuide) onCloseGuide();
  };

  const isFiltered =
    filters.category !== 'ALL' ||
    filters.educationLevel !== 'ALL' ||
    filters.searchQuery !== '';

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E2EDF8] p-3 sm:p-3.5 shadow-xs mb-4 space-y-2.5">
      {/* Primary Bar: Tabs [Mô phỏng nổi tiếng] / [Bài cộng đồng] + Level + Sort + View Mode */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        {/* Tabs: Phân loại Nổi tiếng vs Cộng đồng */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Tab: Nổi tiếng */}
          <button
            id="tab-famous-btn"
            onClick={() => toggleFamousFilter(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filters.onlyFamous && !showGuide
                ? 'bg-[#0785F9] text-white border-[#0785F9] shadow-xs'
                : 'bg-white text-[#23466F] border-[#E2EDF8] hover:bg-[#E2F1FF] hover:text-[#0785F9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Nổi tiếng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                filters.onlyFamous && !showGuide
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {famousCount}
            </span>
          </button>

          {/* Tab: Cộng đồng chia sẻ */}
          <button
            id="tab-user-submitted-btn"
            onClick={() => toggleFamousFilter(false)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              !filters.onlyFamous && !showGuide
                ? 'bg-[#0785F9] text-white border-[#0785F9] shadow-xs'
                : 'bg-white text-[#23466F] border-[#E2EDF8] hover:bg-[#E2F1FF] hover:text-[#0785F9]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Cộng đồng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                !filters.onlyFamous && !showGuide
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {approvedCount}
            </span>
          </button>
        </div>

        {/* Secondary controls: Education level, Sorting, View mode */}
        <div className="flex items-center space-x-2 flex-wrap ml-auto">
          {/* Cấp học dropdown */}
          <div className="flex items-center space-x-1">
            <select
              id="filter-education-level-select"
              value={filters.educationLevel}
              onChange={(e) => handleLevelChange(e.target.value as EducationLevelId | 'ALL')}
              className="px-2.5 py-1.5 rounded-xl border border-[#E2EDF8] bg-[#F8FBFF] text-xs font-semibold text-[#23466F] focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20 cursor-pointer"
            >
              <option value="ALL">Mọi cấp học</option>
              <option value="primary">Tiểu học</option>
              <option value="secondary">THCS</option>
              <option value="highschool">THPT</option>
              <option value="university">Đại học</option>
            </select>
          </div>

          {/* Sắp xếp dropdown */}
          <div className="flex items-center space-x-1">
            <select
              id="filter-sort-by-select"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="px-2.5 py-1.5 rounded-xl border border-[#E2EDF8] bg-[#F8FBFF] text-xs font-semibold text-[#23466F] focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="most_liked">Yêu thích nhất</option>
              <option value="most_viewed">Lượt xem nhiều</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          {/* View mode toggle (Lưới vs Rút gọn) */}
          <div className="flex items-center bg-[#F8FBFF] p-0.5 rounded-xl border border-[#E2EDF8]">
            <button
              onClick={() => onViewModeChange('expanded')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'expanded'
                  ? 'bg-white text-[#0785F9] shadow-xs'
                  : 'text-[#58779B] hover:text-[#23466F]'
              }`}
              title="Chế độ xem lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white text-[#0785F9] shadow-xs'
                  : 'text-[#58779B] hover:text-[#23466F]'
              }`}
              title="Chế độ xem rút gọn"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear filters button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
              title="Xóa bộ lọc"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
