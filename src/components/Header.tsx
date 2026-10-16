import React, { useState } from 'react';
import {
  Globe2,
  Search,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                {t.appName}
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50/90 border border-indigo-200/70 text-indigo-700 text-xs font-semibold animate-fade-in select-none"
                title={t.amSyncing}
                role="status"
                aria-live="polite"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span className="hidden md:inline">{t.amSyncing}</span>
              </div>
            )}

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                title={t.selectLanguage}
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden sm:inline">{currentLangObj.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-fade-in">
                    {languages.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          onLanguageChange(item.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          lang === item.code
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
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

            {/*
              Google Sheets sync hidden for security (auto-sync fixed URL only).
            */}

            {/* Admin Portal Toggle */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAdmin
                  ? 'bg-amber-500/10 border-amber-400/80 text-amber-800 hover:bg-amber-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-100/90 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
