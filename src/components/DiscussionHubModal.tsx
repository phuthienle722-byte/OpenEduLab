import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Heart,
  Eye,
  Download,
  Gift,
  Sparkles,
  Star,
  User,
  ExternalLink,
  QrCode,
  Send,
  Lightbulb,
  Wrench,
  HelpCircle,
  GraduationCap,
  CheckCircle2,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import {
  WebProject,
  Language,
  ProjectComment,
  CommentRole,
  CommentCategory,
} from '../types';
import { translations } from '../translations';
import { BrowserMockupFrame } from './BrowserMockupFrame';
import { getGoUrl } from '../utils/goLink';
import { formatTimeAgo } from '../utils/screenshot';
import { countryDisplayName } from '../data/countries';

interface DiscussionHubModalProps {
  project: WebProject | null;
  isOpen: boolean;
  onClose: () => void;
  comments: ProjectComment[];
  onAddComment: (
    commentData: Omit<ProjectComment, 'id' | 'createdAt' | 'likes'>
  ) => void;
  onLikeComment: (commentId: string) => void;
  onLikeProject: (projectId: string) => void;
  onVisitProject: (projectId: string, url: string) => void;
  onDownloadResource: (projectId: string, type: 'qr' | 'guide' | 'data') => void;
  onContributeResource: (projectId: string) => void;
  onOpenQR?: (project: WebProject) => void;
  lang: Language;
  isAdmin: boolean;
}

export const DiscussionHubModal: React.FC<DiscussionHubModalProps> = ({
  project,
  isOpen,
  onClose,
  comments = [],
  onAddComment,
  onLikeComment,
  onLikeProject,
  onVisitProject,
  onDownloadResource,
  onContributeResource,
  onOpenQR,
  lang,
  isAdmin,
}) => {
  const t = translations[lang] || translations.vi;

  // Comment filter & form state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'ALL' | CommentCategory
  >('ALL');
  const [authorName, setAuthorName] = useState(() => {
    try {
      return localStorage.getItem('openedulab_user_name') || '';
    } catch {
      return '';
    }
  });
  const [authorRole, setAuthorRole] = useState<CommentRole>('teacher');
  const [commentCategory, setCommentCategory] =
    useState<CommentCategory>('experience');
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false);
  const [isAISummaryExpanded, setIsAISummaryExpanded] = useState(true);
  const [hasContributed, setHasContributed] = useState(false);

  // An toàn lọc bình luận của mô phỏng này
  const projectComments = useMemo(() => {
    if (!project || !project.id) return [];
    const list = Array.isArray(comments) ? comments : [];
    return list.filter((c) => c && c.projectId === project.id);
  }, [comments, project]);

  const displayedComments = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return projectComments;
    return projectComments.filter((c) => c && c.category === activeCategoryFilter);
  }, [projectComments, activeCategoryFilter]);

  // Xử lý an toàn danh sách Tags: chấp nhận cả Array lẫn chuỗi phân tách bằng dấu phẩy
  const safeTags = useMemo(() => {
    if (!project || !project.tags) return [];
    if (Array.isArray(project.tags)) {
      return project.tags.map(String).map((t) => t.trim()).filter(Boolean);
    }
    if (typeof project.tags === 'string') {
      return (project.tags as string)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }, [project]);

  // Tên quốc gia hiển thị an toàn
  const countryName = useMemo(() => {
    if (!project) return 'Việt Nam';
    const code = project.country || 'VN';
    return (
      (t.countryNames && t.countryNames[code]) ||
      countryDisplayName(code, t.countryNames) ||
      'Việt Nam'
    );
  }, [project, t]);

  // Link bảo vệ / điều hướng an toàn
  const goUrl = useMemo(() => {
    if (!project) return '';
    try {
      return (
        project.goLink ||
        getGoUrl(window.location, project.url, {
          title: project.title,
          authorName: project.authorName,
          authorEmail: project.authorContact,
        })
      );
    } catch {
      return project.url || '';
    }
  }, [project]);

  const displayUrl = isAdmin ? (project?.url || goUrl) : goUrl;

  if (!isOpen || !project) return null;

  const handleLaunchSimulation = () => {
    try {
      onVisitProject(project.id, project.url);
      window.open(displayUrl || project.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Failed to launch simulation', e);
    }
  };

  const handleDownloadQR = () => {
    try {
      onDownloadResource(project.id, 'qr');
      if (typeof onOpenQR === 'function') {
        onOpenQR(project);
      }
    } catch (e) {
      console.warn('Failed to open QR modal', e);
    }
  };

  const handleContribute = () => {
    onContributeResource(project.id);
    setHasContributed(true);
    setTimeout(() => setHasContributed(false), 4000);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('openedulab_user_name', authorName.trim());
    } catch {
      // ignore
    }

    onAddComment({
      projectId: project.id,
      authorName: authorName.trim(),
      authorRole,
      category: commentCategory,
      content: content.trim(),
      rating,
    });

    setContent('');
    setIsSubmitting(false);
    setSubmitSuccessMsg(true);
    setTimeout(() => setSubmitSuccessMsg(false), 3000);
  };

  // AI Insights Generation based on existing comments
  const aiInsightSummary = useMemo(() => {
    if (projectComments.length === 0) {
      return {
        strengths: 'Mô phỏng trực quan, dễ thao tác và bám sát chương trình GDPT.',
        considerations: 'Nên chuẩn bị phiếu học tập có câu hỏi định hướng trước khi cho học sinh tương tác.',
        tips: 'Thích hợp dùng cho phần Khởi động hoặc Khám phá kiến thức mới.',
      };
    }

    const expComments = projectComments.filter((c) => c && c.category === 'experience');
    const feedbackComments = projectComments.filter((c) => c && c.category === 'feedback');

    return {
      strengths:
        expComments.length > 0
          ? `${expComments.length} thầy cô/học sinh đánh giá mô phỏng giúp hiểu nhanh bản chất hiện tượng.`
          : 'Được cộng đồng đánh giá cao về tính tương tác và trực quan sinh động.',
      considerations:
        feedbackComments.length > 0
          ? 'Một số phản hồi đề xuất tối ưu phím bấm trên màn hình điện thoại và bổ sung thêm bài tập mẫu.'
          : 'Nên kiểm tra đường truyền mạng trong phòng máy trước giờ thực hành.',
      tips: 'Tích hợp kết hợp với bảng phụ hoặc phiếu học tập nhóm để đạt hiệu quả sư phạm tối đa.',
    };
  }, [projectComments]);

  return (
    <div
      id="discussion-hub-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="discussion-hub-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E2EDF8] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2EDF8] bg-[#F8FBFF]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0785F9] text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0785F9] bg-[#E2F1FF] px-2 py-0.5 rounded-md">
                  Khu vực Trao đổi Kinh nghiệm & Bình luận
                </span>
                <span className="text-[10px] font-semibold text-[#58779B]">
                  {countryName}
                </span>
              </div>
              <h3 className="font-bold text-[#0B3B78] text-sm sm:text-base truncate">
                {project.title || 'Mô phỏng học tập'}
              </h3>
            </div>
          </div>

          <button
            id="hub-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#58779B] hover:text-[#0B3B78] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Section 1: Showcase Card & 5 Golden Interaction Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 bg-[#F8FBFF] rounded-2xl border border-[#E2EDF8]">
            {/* Left: Thumbnail Preview */}
            <div className="md:col-span-5">
              <BrowserMockupFrame
                url={project.url}
                title={project.title}
                previewImage={project.previewImage}
                authorName={project.authorName}
                displayUrl={displayUrl}
                onClick={handleLaunchSimulation}
                aspectRatio="video"
                lang={lang}
              />
              <div className="mt-2.5 flex items-center justify-between text-xs text-[#58779B]">
                <span className="flex items-center space-x-1 font-medium truncate max-w-[180px]">
                  <User className="w-3.5 h-3.5 text-[#0785F9] shrink-0" />
                  <span className="truncate">{project.authorName || 'Thành viên'}</span>
                </span>
                <span className="text-[11px] font-mono shrink-0">
                  {formatTimeAgo(project.createdAt, lang)}
                </span>
              </div>
            </div>

            {/* Right: Actions & 5 Metrics */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs text-[#23466F] leading-relaxed line-clamp-3">
                  {project.description ||
                    'Mô phỏng học tập tương tác giúp người học khám phá hiện tượng khoa học và thực hành thí nghiệm số.'}
                </p>

                {/* Safe Tags */}
                {safeTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {safeTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#E2EDF8] text-[#58779B] text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 5 Golden Metrics Cards */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2 border-t border-[#E2EDF8]">
                {/* 1. Views */}
                <div className="p-2 rounded-xl bg-white border border-[#E2EDF8] text-center shadow-2xs">
                  <Eye className="w-3.5 h-3.5 text-[#0785F9] mx-auto mb-1" />
                  <div className="text-xs font-bold text-[#0B3B78]">
                    {project.views || 0}
                  </div>
                  <div className="text-[9px] text-[#58779B]">Truy cập</div>
                </div>

                {/* 2. Likes */}
                <button
                  onClick={() => onLikeProject(project.id)}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E2EDF8] hover:border-rose-200 text-center shadow-2xs transition-colors cursor-pointer group"
                  title="Thả tim ủng hộ"
                >
                  <Heart className="w-3.5 h-3.5 text-[#FF3B4E] mx-auto mb-1 group-hover:scale-110 transition-transform fill-[#FF3B4E]" />
                  <div className="text-xs font-bold text-[#FF3B4E]">
                    {project.likes || 0}
                  </div>
                  <div className="text-[9px] text-[#58779B]">Yêu thích</div>
                </button>

                {/* 3. Downloads */}
                <div className="p-2 rounded-xl bg-white border border-[#E2EDF8] text-center shadow-2xs">
                  <Download className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-emerald-700">
                    {project.downloads || 0}
                  </div>
                  <div className="text-[9px] text-[#58779B]">Tải về</div>
                </div>

                {/* 4. Comments */}
                <div className="p-2 rounded-xl bg-white border border-[#E2EDF8] text-center shadow-2xs">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
                  <div className="text-xs font-bold text-amber-600">
                    {projectComments.length || project.commentCount || 0}
                  </div>
                  <div className="text-[9px] text-[#58779B]">Bình luận</div>
                </div>

                {/* 5. Contributions */}
                <div className="p-2 rounded-xl bg-white border border-[#E2EDF8] text-center shadow-2xs">
                  <Gift className="w-3.5 h-3.5 text-purple-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-purple-700">
                    {project.contributions || 0}
                  </div>
                  <div className="text-[9px] text-[#58779B]">Đóng góp</div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  id="hub-launch-sim-btn"
                  onClick={handleLaunchSimulation}
                  className="flex-1 min-w-[150px] py-2 px-3 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Trải nghiệm mô phỏng →</span>
                </button>

                <button
                  id="hub-download-qr-btn"
                  onClick={handleDownloadQR}
                  className="py-2 px-3 rounded-xl border border-[#E2EDF8] bg-white hover:bg-[#E2F1FF] text-[#0785F9] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Tải mã QR để trình chiếu hoặc in vào phiếu học tập (+1 Tải về)"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải QR (+1)</span>
                </button>

                <button
                  id="hub-contribute-btn"
                  onClick={handleContribute}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    hasContributed
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'border-[#E2EDF8] bg-white hover:bg-purple-50 text-purple-700'
                  }`}
                  title="Ghi nhận đóng góp tài liệu / biến thể học tập (+1 Đóng góp)"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{hasContributed ? 'Đã ghi nhận!' : 'Đóng góp bài'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: AI Pedagogical & Insight Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-indigo-50/60 to-blue-50/80 border border-amber-200/60 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#0B3B78]">
                  AI Phân tích & Tóm tắt kinh nghiệm sư phạm
                </h4>
              </div>
              <button
                onClick={() => setIsAISummaryExpanded(!isAISummaryExpanded)}
                className="text-[11px] font-semibold text-[#0785F9] hover:underline cursor-pointer"
              >
                {isAISummaryExpanded ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
              </button>
            </div>

            {isAISummaryExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-100 shadow-2xs">
                  <div className="font-bold text-emerald-700 flex items-center space-x-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Điểm mạnh nổi bật</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {aiInsightSummary.strengths}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-100 shadow-2xs">
                  <div className="font-bold text-amber-700 flex items-center space-x-1 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Mẹo áp dụng bài giảng</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {aiInsightSummary.tips}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-100 shadow-2xs">
                  <div className="font-bold text-indigo-700 flex items-center space-x-1 mb-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Góp ý & Lưu ý sư phạm</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {aiInsightSummary.considerations}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Comment Streams & Submit Form */}
          <div className="space-y-4">
            {/* Stream Filter Tabs */}
            <div className="flex items-center justify-between border-b border-[#E2EDF8] pb-2 flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveCategoryFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategoryFilter === 'ALL'
                      ? 'bg-[#0785F9] text-white shadow-xs'
                      : 'text-[#58779B] hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({projectComments.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('experience')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                    activeCategoryFilter === 'experience'
                      ? 'bg-[#24B34B] text-white shadow-xs'
                      : 'text-[#58779B] hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Kinh nghiệm dạy</span>
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('feedback')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                    activeCategoryFilter === 'feedback'
                      ? 'bg-[#FF8A18] text-white shadow-xs'
                      : 'text-[#58779B] hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>Góp ý cải tiến</span>
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('question')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                    activeCategoryFilter === 'question'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-[#58779B] hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Hỏi đáp STEM</span>
                </button>
              </div>

              <span className="text-[11px] text-[#58779B]">
                {displayedComments.length} bình luận & đánh giá
              </span>
            </div>

            {/* New Comment Form */}
            <form
              onSubmit={handleSubmitComment}
              className="p-4 bg-white rounded-2xl border border-[#E2EDF8] shadow-xs space-y-3"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0B3B78]">
                <MessageSquare className="w-4 h-4 text-[#0785F9]" />
                <span>Chia sẻ kinh nghiệm hoặc góp ý cho mô phỏng này</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Author Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="VD: Thầy Nam, Bạn Minh..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20 focus:border-[#0785F9]"
                  />
                </div>

                {/* Author Role */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vai trò của bạn
                  </label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value as CommentRole)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0785F9]"
                  >
                    <option value="teacher">👩‍🏫 Giáo viên / Giảng viên</option>
                    <option value="student">👨‍🎓 Học sinh / Sinh viên</option>
                    <option value="creator">✍️ Tác giả / Người sáng tạo</option>
                    <option value="guest">🌐 Khách / Thành viên</option>
                  </select>
                </div>

                {/* Comment Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chủ đề chia sẻ
                  </label>
                  <select
                    value={commentCategory}
                    onChange={(e) =>
                      setCommentCategory(e.target.value as CommentCategory)
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0785F9]"
                  >
                    <option value="experience">💡 Kinh nghiệm dạy học</option>
                    <option value="feedback">🛠️ Góp ý kỹ thuật & tính năng</option>
                    <option value="question">❓ Hỏi đáp kiến thức</option>
                  </select>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-slate-700">
                  Đánh giá mô phỏng:
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {rating}/5 sao
                </span>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ cách bạn áp dụng mô phỏng này vào tiết dạy, lỗi bạn phát hiện, hoặc ý tưởng cải tiến..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0785F9]/20 focus:border-[#0785F9] resize-none"
                />
              </div>

              {/* Submit Button & Status */}
              <div className="flex items-center justify-between">
                {submitSuccessMsg ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã ghi nhận bình luận & đồng bộ thành công!</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[#58779B]">
                    Ý kiến của bạn là tư liệu quý báu để AI và tác giả nâng cấp mô phỏng.
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi bình luận</span>
                </button>
              </div>
            </form>

            {/* Comments Feed */}
            <div className="space-y-3 pt-2">
              {displayedComments.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FBFF] rounded-2xl border border-dashed border-[#E2EDF8]">
                  <MessageSquare className="w-8 h-8 text-[#58779B]/50 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#0B3B78]">
                    Chưa có ý kiến nào trong mục này
                  </p>
                  <p className="text-[11px] text-[#58779B] mt-1">
                    Hãy là người đầu tiên chia sẻ kinh nghiệm giảng dạy hoặc gửi góp ý!
                  </p>
                </div>
              ) : (
                displayedComments.map((c) => {
                  if (!c) return null;
                  const safeAuthor = (c.authorName || 'Thành viên').trim();
                  const initialLetter =
                    safeAuthor.length > 0 ? safeAuthor.charAt(0).toUpperCase() : 'U';

                  const roleLabel =
                    c.authorRole === 'teacher'
                      ? '👩‍🏫 Giáo viên'
                      : c.authorRole === 'student'
                      ? '👨‍🎓 Học sinh'
                      : c.authorRole === 'creator'
                      ? '✍️ Tác giả'
                      : '🌐 Thành viên';

                  const categoryLabel =
                    c.category === 'experience'
                      ? '💡 Kinh nghiệm dạy học'
                      : c.category === 'feedback'
                      ? '🛠️ Góp ý cải tiến'
                      : '❓ Hỏi đáp STEM';

                  const badgeClass =
                    c.category === 'experience'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : c.category === 'feedback'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  const safeRating = Math.min(
                    5,
                    Math.max(1, Math.round(Number(c.rating) || 5))
                  );

                  return (
                    <div
                      key={c.id || Math.random().toString()}
                      className="p-3.5 rounded-2xl bg-white border border-[#E2EDF8] shadow-xs space-y-2 hover:border-[#0785F9]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#E2F1FF] text-[#0785F9] font-bold text-xs flex items-center justify-center shrink-0">
                            {initialLetter}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs text-[#0B3B78]">
                                {safeAuthor}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-medium">
                                {roleLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#58779B]">
                              {formatTimeAgo(c.createdAt, lang)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {c.rating != null && (
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: safeRating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-amber-400"
                                />
                              ))}
                            </div>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}
                          >
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#23466F] leading-relaxed pl-9">
                        {c.content}
                      </p>

                      <div className="pl-9 pt-1 flex items-center justify-between">
                        <button
                          onClick={() => onLikeComment(c.id)}
                          className="flex items-center space-x-1 text-[11px] text-[#58779B] hover:text-[#FF3B4E] transition-colors cursor-pointer"
                        >
                          <Heart className="w-3 h-3" />
                          <span>Hữu ích ({c.likes || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
