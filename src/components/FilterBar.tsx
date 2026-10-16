import React from 'react';
import {
  AlignLeft,
  LayoutGrid,
  RotateCcw,
  SlidersHorizontal,
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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
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
  };

  const isFiltered =
    filters.category !== 'ALL' ||
    filters.educationLevel !== 'ALL' ||
    filters.searchQuery !== '';

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E2EDF8] p-2.5 sm:p-3 shadow-xs mb-4 flex items-center justify-between gap-2.5 flex-wrap">
      {/* Bên trái: Thông tin số lượng mô phỏng */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-[#23466F]">
          Tìm thấy <strong className="text-[#0785F9] font-bold">{totalResults}</strong> mô phỏng học tập
        </span>
      </div>

      {/* Bên phải: Lọc cấp học, sắp xếp, chế độ xem */}
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
            <option value="secondary">THCS (Lớp 6 - 9)</option>
            <option value="primary">Tiểu học (Lớp 1 - 5)</option>
            <option value="highschool">THPT (Lớp 10 - 12)</option>
            <option value="university">Đại học / Chuyên sâu</option>
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

        {/* View mode toggle (Lưới 4 cột vs Rút gọn) */}
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

        {/* Reset filters button */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="p-1.5 px-2.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px]">Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
};
