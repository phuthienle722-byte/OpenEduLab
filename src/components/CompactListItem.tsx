import React from 'react';
import { ExternalLink, Pencil, QrCode, Sparkles, Trash2 } from 'lucide-react';
import { WebProject, Language } from '../types';
import { translations } from '../translations';
import { getGoUrl } from '../utils/goLink';

// Icon môn học (dùng riêng cho chế độ rút gọn - chỉ icon, không kèm chữ)
const SUBJECT_EMOJIS: Record<string, string> = {
  math: '📐',
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
  informatics: '💻',
  literature: '📖',
  english: '🇬🇧',
  history: '🏛️',
  geography: '🌍',
  natural_sciences: '🔬',
  stem: '🚀',
  general: '📚',
  // Legacy compatibility
  languages: '💬',
  computer_science: '💻',
  history_society: '🏛️',
  arts_design: '🎨',
  health_medicine: '🩺',
  tools_utilities: '🛠️',
};

interface CompactListItemProps {
  project: WebProject;
  lang: Language;
  isAdmin: boolean;
  onOpenQR: (project: WebProject) => void;
  onEditProject: (project: WebProject) => void;
  onDeleteRequest: (project: WebProject) => void;
  onLike: (projectId: string) => void;
  onVisit: (projectId: string, url: string) => void;
}

export const CompactListItem: React.FC<CompactListItemProps> = ({
  project,
  lang,
  isAdmin,
  onOpenQR,
  onEditProject,
  onDeleteRequest,
  onVisit,
}) => {
  const t = translations[lang];

  const handleVisit = () => {
    onVisit(project.id, project.url);
    window.open(isAdmin ? project.url : (project.goLink || getGoUrl(window.location, project.url, { title: project.title, authorName: project.authorName, authorEmail: project.authorContact })), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-3.5 bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all gap-3">
      {/* Tên mô phỏng + icon môn học (rút gọn: ẩn tác giả và chữ môn để tăng chỗ hiển thị tên) */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 flex-1 overflow-hidden">
        {project.isFamous && (
          <span
            title={t.famousTabShort}
            className="p-1 rounded-md bg-amber-50 text-amber-500 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        )}

        <h4
          onClick={handleVisit}
          className="font-bold text-slate-900 text-xs sm:text-sm truncate hover:text-indigo-600 cursor-pointer shrink-1 min-w-[80px]"
          title={project.title}
        >
          {project.title}
        </h4>

        {/* Icon môn học - chỉ icon, ẩn chữ để tăng khoảng trống cho tên */}
        <span
          title={t.categoryNames[project.category] || project.category}
          className="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md bg-indigo-50 border border-indigo-200/60 text-sm leading-none"
        >
          {SUBJECT_EMOJIS[project.category] || '📘'}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={() => onOpenQR(project)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
          title={t.generateQR}
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleVisit}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
          title={t.visitWebsite}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {isAdmin && (
          <button
            onClick={() => onEditProject(project)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
            title={t.amEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onDeleteRequest(project)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title={t.deleteAdminTitle}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
