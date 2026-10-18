import React, { useState } from 'react';
import {
  ExternalLink,
  Heart,
  Pencil,
  QrCode,
  Share2,
  Trash2,
  User,
  Eye,
  ArrowRight,
  MessageSquare,
  Download,
} from 'lucide-react';
import { WebProject, Language, CategoryId } from '../types';
import { translations } from '../translations';
import { BrowserMockupFrame } from './BrowserMockupFrame';
import { formatTimeAgo } from '../utils/screenshot';
import { getGoUrl } from '../utils/goLink';
import { countryDisplayName } from '../data/countries';

interface ProjectCardProps {
  project: WebProject;
  lang: Language;
  isAdmin: boolean;
  onOpenQR: (project: WebProject) => void;
  onOpenDiscussion: (project: WebProject) => void;
  onEditProject: (project: WebProject) => void;
  onDeleteRequest: (project: WebProject) => void;
  onLike: (projectId: string) => void;
  onVisit: (projectId: string, url: string) => void;
}

// Subject badge color mapping based on design guide
const getCategoryBadgeClass = (category: CategoryId): string => {
  switch (category) {
    case 'math':
      return 'bg-[#FF8A18]/10 text-[#FF8A18] border-[#FF8A18]/30';
    case 'physics':
      return 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30';
    case 'chemistry':
    case 'biology':
    case 'natural_sciences':
      return 'bg-[#24B34B]/10 text-[#24B34B] border-[#24B34B]/30';
    case 'informatics':
    case 'stem':
      return 'bg-[#0785F9]/10 text-[#0785F9] border-[#0785F9]/30';
    default:
      return 'bg-slate-100 text-[#58779B] border-[#E2EDF8]';
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  lang,
  isAdmin,
  onOpenQR,
  onOpenDiscussion,
  onEditProject,
  onDeleteRequest,
  onLike,
  onVisit,
}) => {
  const t = translations[lang];
  const [isLiked, setIsLiked] = useState(false);
  const goUrl =
    project.goLink ||
    getGoUrl(window.location, project.url, {
      title: project.title,
      authorName: project.authorName,
      authorEmail: project.authorContact,
    });
  const displayUrl = isAdmin ? undefined : goUrl;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike(project.id);
  };

  const handleVisit = () => {
    onVisit(project.id, project.url);
    window.open(displayUrl || project.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = displayUrl || project.url;
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert(t.copied);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div
      id={`project-card-${project.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-[#E2EDF8] shadow-xs hover:shadow-md hover:border-[#0785F9]/40 transition-all duration-200 overflow-hidden hover:-translate-y-0.5"
    >
      {/* Top Media: Browser Mockup Frame with 16:9 ratio */}
      <div className="relative p-2.5 bg-[#F8FBFF] border-b border-[#E2EDF8]">
        <BrowserMockupFrame
          url={project.url}
          title={project.title}
          previewImage={project.previewImage}
          authorName={project.authorName}
          displayUrl={displayUrl}
          onClick={handleVisit}
          aspectRatio="video"
          lang={lang}
        />

        {/* Pill nhãn môn học nổi trên góc ảnh */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${getCategoryBadgeClass(
              project.category
            )}`}
          >
            {t.categoryNames[project.category] || project.category}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Metadata Badges: Cấp học & Quốc gia & Thời gian */}
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-md font-semibold bg-[#E2F1FF] text-[#0785F9]">
              {t.educationLevelNames[project.educationLevel] || project.educationLevel}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-slate-600 bg-slate-100 font-medium">
              {t.countryNames[project.country] || countryDisplayName(project.country, t.countryNames)}
            </span>
            <span className="ml-auto text-[#58779B] font-medium">
              {formatTimeAgo(project.createdAt, lang)}
            </span>
          </div>

          {/* Title: Xanh navy #0B3B78, tối đa 2 dòng */}
          <h3
            onClick={handleVisit}
            className="text-sm font-bold text-[#0B3B78] line-clamp-2 leading-snug group-hover:text-[#0785F9] transition-colors cursor-pointer"
            title={project.title}
          >
            {project.title}
          </h3>

          {/* Description: Tối đa 2 dòng chữ #58779B */}
          {project.description && (
            <p className="text-xs text-[#58779B] line-clamp-2 mt-1 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Author info & stats row */}
        <div className="pt-2 border-t border-[#E2EDF8] flex items-center justify-between text-[11px] text-[#58779B]">
          <div
            className="flex items-center space-x-1.5 truncate max-w-[130px]"
            title={t.authorNoteTitle.replace('{name}', project.authorName)}
          >
            <div className="w-4 h-4 rounded-full bg-[#E2F1FF] text-[#0785F9] flex items-center justify-center text-[9px] shrink-0 font-bold">
              <User className="w-2.5 h-2.5" />
            </div>
            <span className="truncate font-medium text-[#23466F]">{project.authorName}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Views counter */}
            <span className="flex items-center space-x-0.5 text-[11px] text-[#58779B]" title="Lượt truy cập">
              <Eye className="w-3 h-3 text-[#58779B]" />
              <span>{project.views}</span>
            </span>

            {/* Downloads counter (nếu > 0) */}
            {(project.downloads ?? 0) > 0 && (
              <span className="flex items-center space-x-0.5 text-[11px] text-emerald-600 font-medium" title="Lượt tải về">
                <Download className="w-3 h-3 text-emerald-600" />
                <span>{project.downloads}</span>
              </span>
            )}

            {/* Comments counter */}
            <button
              onClick={() => onOpenDiscussion(project)}
              className="flex items-center space-x-0.5 text-[11px] text-[#0785F9] hover:underline cursor-pointer"
              title="Xem bình luận & trao đổi kinh nghiệm"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{project.commentCount || 0}</span>
            </button>

            {/* Like button with Red Heart */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-0.5 text-xs transition-colors cursor-pointer ${
                isLiked ? 'text-[#FF3B4E] font-bold' : 'text-[#58779B] hover:text-[#FF3B4E]'
              }`}
              title="Yêu thích"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? 'fill-[#FF3B4E] text-[#FF3B4E]' : 'text-[#58779B]'
                }`}
              />
              <span>{project.likes + (isLiked ? 1 : 0)}</span>
            </button>
          </div>
        </div>

        {/* Bottom Interactive Action Row */}
        <div className="pt-1 flex items-center justify-between gap-1.5">
          {/* Quick Launch Simulation Button (Primary Action) */}
          <button
            id={`visit-btn-${project.id}`}
            onClick={handleVisit}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer truncate"
            title="Trải nghiệm nhanh mô phỏng"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{lang === 'vi' ? 'Trải nghiệm' : 'Launch'}</span>
          </button>

          {/* Discussion Button: Biểu tượng + Số lượng bình luận */}
          <button
            id={`discuss-btn-${project.id}`}
            onClick={() => onOpenDiscussion(project)}
            className="py-2 px-2.5 rounded-xl border border-[#E2EDF8] text-[#0785F9] hover:bg-[#E2F1FF] hover:border-[#0785F9]/30 text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer shrink-0"
            title="Bình luận & trao đổi kinh nghiệm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">
              {project.commentCount || 0}
            </span>
          </button>

          {/* Secondary Action: QR Code Button */}
          <button
            id={`qr-btn-${project.id}`}
            onClick={() => onOpenQR(project)}
            className="p-2 rounded-xl border border-[#E2EDF8] text-[#23466F] hover:bg-[#E2F1FF] hover:text-[#0785F9] text-xs transition-colors cursor-pointer"
            title={t.generateQR}
          >
            <QrCode className="w-3.5 h-3.5 text-[#0785F9]" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-[#E2EDF8] text-[#58779B] hover:text-[#23466F] hover:bg-slate-50 transition-colors cursor-pointer"
            title={t.shareLinkTitle}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Admin Edit Action Button */}
          {isAdmin && (
            <button
              id={`edit-btn-${project.id}`}
              onClick={() => onEditProject(project)}
              className="p-2 rounded-xl border border-[#E2EDF8] text-[#58779B] hover:text-[#0785F9] hover:border-[#0785F9]/30 hover:bg-[#E2F1FF] transition-colors cursor-pointer"
              title={t.amEdit}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Admin Delete Action Button */}
          {isAdmin && (
            <button
              id={`delete-btn-${project.id}`}
              onClick={() => onDeleteRequest(project)}
              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.deleteAdminTitle}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
