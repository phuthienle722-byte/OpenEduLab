import React, { useState } from 'react';
import {
  Globe2,
  Search,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenSubmit: () => void;
  pendingCount: number;
  isCloudSyncing?: boolean;
}

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tet', name: 'Tetun', flag: '🇹🇱' },
];

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  isAdmin,
  onOpenAdmin,
  onOpenSubmit,
  pendingCount,
  isCloudSyncing = false,
}) => {
  const t = translations[lang];
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2EDF8] shadow-xs">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0785F9] to-[#006FE6] text-white flex items-center justify-center shadow-md shadow-[#0785F9]/25">
              <Globe2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#0B3B78] tracking-tight text-lg leading-tight">
                OpenEduLab
              </span>
              <span className="text-[10px] text-[#58779B] font-medium hidden sm:block leading-tight">
                Khám phá · Sáng tạo · Chia sẻ
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-[#58779B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm mô phỏng, môn học, chủ đề…"
                className="w-full pl-9 pr-8 py-2 bg-[#F8FBFF] hover:bg-slate-100/70 focus:bg-white rounded-xl border border-[#E2EDF8] text-xs text-[#23466F] placeholder-[#58779B] focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20 focus:border-[#0785F9] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Background cloud sync non-intrusive indicator */}
            {isCloudSyncing && (
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#E2F1FF] border border-[#0785F9]/30 text-[#0785F9] text-xs font-semibold select-none"
                title={t.amSyncing}
                role="status"
                aria-live="polite"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#0785F9] animate-spin" />
                <span className="hidden xl:inline text-[11px]">{t.amSyncing}</span>
              </div>
            )}

            {/* Submit / Share Button */}
            <button
              onClick={onOpenSubmit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white text-xs font-bold transition-all shadow-xs shadow-[#0785F9]/20 cursor-pointer"
              title="Chia sẻ mô phỏng mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ mô phỏng</span>
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-[#E2EDF8] bg-white hover:bg-slate-50 text-xs font-semibold text-[#23466F] transition-colors"
                title={t.selectLanguage}
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden sm:inline">{currentLangObj.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#58779B]" />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-[#E2EDF8] py-1 z-20 animate-fade-in">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          onLanguageChange(item.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          lang === item.code
                            ? 'bg-[#E2F1FF] text-[#0785F9] font-bold'
                            : 'text-[#23466F] hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span>{item.flag}</span>
                          <span>{item.name}</span>
                        </span>
                        {lang === item.code && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Admin Portal Toggle */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAdmin
                  ? 'bg-amber-500/10 border-amber-400/80 text-amber-800 hover:bg-amber-500/20'
                  : 'bg-white border-[#E2EDF8] text-[#23466F] hover:bg-slate-50'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-[#58779B]" />
              )}
              <span className="hidden sm:inline">{isAdmin ? t.adminMode : t.adminPortal}</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-[#58779B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm mô phỏng, môn học, chủ đề…"
              className="w-full pl-9 pr-3 py-2 bg-[#F8FBFF] rounded-xl border border-[#E2EDF8] text-xs text-[#23466F] placeholder-[#58779B] focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
