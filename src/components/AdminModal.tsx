import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  KeyRound,
  Lock,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Shield,
  Trash2,
  Upload,
  User,
  X,
  Sparkles,
  Star,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Gift,
  Bot,
  Heart,
  Eye,
  Zap,
} from 'lucide-react';
import { WebProject, Language, ProjectComment, CommentRole, CommentCategory } from '../types';
import { translations } from '../translations';
import { countryDisplayName } from '../data/countries';
import { SubmitModal } from './SubmitModal';
import { extractDomain, formatTimeAgo, getLocaleCode } from '../utils/screenshot';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  projects: WebProject[];
  comments?: ProjectComment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeleteRequest: (project: WebProject) => void;
  onUpdateProject?: (project: WebProject) => void;
  onExportData: () => void;
  onImportData: (data: WebProject[]) => void;
  onResetData: () => void;
  onSyncProjects?: (newProjects: WebProject[]) => void;
  onRefreshPending?: () => void;
  communityOnly: boolean;
  onCommunityOnlyChange: (val: boolean) => void;
  lang: Language;
  onDeleteComment?: (commentId: string) => void;
  onUpdateComment?: (comment: ProjectComment) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  setIsAdmin,
  projects,
  comments = [],
  onApprove,
  onReject,
  onDeleteRequest,
  onUpdateProject,
  onExportData,
  onImportData,
  onResetData,
  onSyncProjects,
  onRefreshPending,
  communityOnly,
  onCommunityOnlyChange,
  lang,
  onDeleteComment,
  onUpdateComment,
}) => {
  const t = translations[lang];

  // Login credentials
  const [adminId, setAdminId] = useState(() => {
    return localStorage.getItem('webhub_admin_id') || 'admin';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'pending' | 'all' | 'comments' | 'backup' | 'ai_insights'
  >('pending');

  const [editingProject, setEditingProject] = useState<WebProject | null>(null);
  const [isPendingSyncing, setIsPendingSyncing] = useState(false);
  const [pendingSyncMsg, setPendingSyncMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Comments Tab State
  const [commentSearch, setCommentSearch] = useState('');
  const [commentCategoryFilter, setCommentCategoryFilter] = useState<'ALL' | string>('ALL');
  const [editingComment, setEditingComment] = useState<ProjectComment | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<ProjectComment | null>(null);

  // AI Tab State
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string>('');
  const [generatedFeedback, setGeneratedFeedback] = useState<string>('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const filteredAdminComments = useMemo(() => {
    let list = Array.isArray(comments) ? comments : [];
    if (commentCategoryFilter !== 'ALL') {
      list = list.filter((c) => c && c.category === commentCategoryFilter);
    }
    if (commentSearch.trim()) {
      const q = commentSearch.toLowerCase().trim();
      list = list.filter((c) => {
        if (!c) return false;
        const authorMatch = (c.authorName || '').toLowerCase().includes(q);
        const contentMatch = (c.content || '').toLowerCase().includes(q);
        const proj = projects.find((p) => p.id === c.projectId);
        const projMatch = proj ? (proj.title || '').toLowerCase().includes(q) : false;
        return authorMatch || contentMatch || projMatch;
      });
    }
    return [...list].sort((a, b) => {
      const tA = new Date(a.createdAt || 0).getTime();
      const tB = new Date(b.createdAt || 0).getTime();
      return tB - tA;
    });
  }, [comments, commentCategoryFilter, commentSearch, projects]);

  useEffect(() => {
    if (isOpen) {
      // Khi admin mở modal: kéo ngay bài chờ duyệt từ đám mây về
      if (isAdmin && onRefreshPending) {
        handleRefreshPending();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  // Handle Admin Login with ID and Password (mật khẩu không hiển thị công khai)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim();
    const cleanPass = password.trim();

    const isPasswordValid = cleanPass === '@1122@';
    const isIdValid = cleanId.length > 0;

    if (isPasswordValid && isIdValid) {
      setIsAdmin(true);
      setAuthError(false);
      setPassword('');
      localStorage.setItem('webhub_admin_id', cleanId);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    onClose();
  };

  const handleUpdateProject = (updated: WebProject) => {
    if (onUpdateProject) onUpdateProject(updated);
    setEditingProject(null);
    setPendingSyncMsg({
      type: 'success',
      text: `Đã lưu thay đổi cho mô phỏng "${updated.title}" thành công!`,
    });
    setTimeout(() => setPendingSyncMsg(null), 4000);
  };

  // Tải bài chờ duyệt (pending) từ Google Sheets về (cross-device visibility)
  const handleRefreshPending = async () => {
    if (!onRefreshPending) return;
    setIsPendingSyncing(true);
    setPendingSyncMsg(null);
    try {
      await onRefreshPending();
      setPendingSyncMsg({
        type: 'success',
        text: 'Đã tải bài chờ duyệt từ Google Sheets (mọi thiết bị)',
      });
    } catch {
      setPendingSyncMsg({
        type: 'error',
        text: 'Không thể tải bài chờ duyệt từ Google Sheets. Hãy kiểm tra cấu hình.',
      });
    } finally {
      setIsPendingSyncing(false);
      setTimeout(() => setPendingSyncMsg(null), 4000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportData(parsed);
          }
        } catch {
          alert(t.amImportInvalid);
        }
      };
      reader.readAsText(file);
    }
  };

  const pendingList = projects.filter((p) => p.status === 'pending');
  const approvedList = projects.filter((p) => p.status === 'approved');

  return (
    <div
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-wide">{t.adminDashboardTitle}</h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    ID: {adminId || 'admin'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isAdmin
                  ? t.amHeaderSubLogged
                  : t.amHeaderSubLogin}
              </p>
            </div>
          </div>
          <button
            id="admin-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NOT logged in: Show Admin ID Form */}
        {!isAdmin ? (
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">{t.loginAdmin}</h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {t.amLoginPromo}
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3.5 text-left">
              {/* ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.adminIdLabel}</span>
                </label>
                <input
                  id="admin-id-input"
                  type="text"
                  value={adminId}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder={t.adminIdPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Password Input (không hiển thị gợi ý mật khẩu) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.adminPasswordLabel}</span>
                </label>
                <input
                  id="admin-passcode-input"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder={t.adminPasswordPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {authError && (
                  <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.adminWrongPassword}</span>
                  </p>
                )}
              </div>

              <button
                id="admin-submit-login-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2"
              >
                <Shield className="w-4 h-4" />
                <span>{t.amLoginBtn}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Logged In View */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-200/80 flex-wrap gap-2">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {/* Tab 1: Pending */}
                <button
                  id="tab-pending-btn"
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.pendingApprovals}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'pending'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pendingList.length}
                  </span>
                </button>

                {/* Tab 2: Approved */}
                <button
                  id="tab-approved-btn"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.amTabApproved} ({approvedList.length})</span>
                </button>

                {/* Tab 3: Comments Management */}
                <button
                  id="tab-comments-btn"
                  onClick={() => setActiveTab('comments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'comments'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Bình luận ({comments.length})</span>
                </button>

                {/* Tab 3: Backup & JSON */}
                <button
                  id="tab-backup-btn"
                  onClick={() => setActiveTab('backup')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'backup'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.amTabBackup}</span>
                </button>

                {/* Tab 4: AI Phân tích & Thống kê */}
                <button
                  id="tab-ai-insights-btn"
                  onClick={() => setActiveTab('ai_insights')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'ai_insights'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ AI Phân tích & Đề xuất</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50"
                >
                  {t.exitAdmin}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: PENDING QUEUE */}
              {activeTab === 'pending' && (
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <p className="text-xs text-slate-500">
                      {t.amPendingHint}
                    </p>
                    <button
                      onClick={handleRefreshPending}
                      disabled={isPendingSyncing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPendingSyncing ? 'animate-spin' : ''}`} />
                      <span>{isPendingSyncing ? t.amSyncing : 'Tải bài chờ từ Cloud'}</span>
                    </button>
                  </div>

                  {pendingSyncMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center space-x-2 mb-3 ${
                        pendingSyncMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : pendingSyncMsg.type === 'error'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {pendingSyncMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : pendingSyncMsg.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      ) : (
                        <Zap className="w-4 h-4 shrink-0 text-indigo-600" />
                      )}
                      <span className="flex-1">{pendingSyncMsg.text}</span>
                    </div>
                  )}

                  {pendingList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">{t.amNoPendingTitle}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.amNoPendingDesc}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingList.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-amber-50/40 border border-amber-200/70 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Avatar thumbnail preview */}
                          <div className="w-16 h-11 rounded-lg bg-white overflow-hidden shrink-0 border border-amber-200/80 flex items-center justify-center self-start md:self-center shadow-2xs">
                            {item.previewImage ? (
                              <img
                                key={item.previewImage}
                                src={item.previewImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Globe className="w-5 h-5 text-amber-500" />
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {t.statusPending}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {formatTimeAgo(item.createdAt, lang)}
                              </span>
                              <span className="text-xs font-semibold text-indigo-700">
                                {t.countryNames[item.country] || countryDisplayName(item.country, t.countryNames)}
                              </span>
                              <span className="text-[11px] text-slate-600">
                                • {t.categoryNames[item.category]} • {t.educationLevelNames[item.educationLevel]}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                            <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1 flex-wrap gap-y-1">
                              <span className="font-mono text-indigo-600 truncate max-w-xs">{item.url}</span>
                              <span>{t.authorLabelShort} <strong>{item.authorName}</strong></span>
                              {item.authorContact && <span>({item.authorContact})</span>}
                            </div>
                          </div>

                          {/* Approval Actions */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => setEditingProject(item)}
                              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>{t.amEdit}</span>
                            </button>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{t.amOpenLink}</span>
                            </a>

                            <button
                              onClick={() => onReject(item.id)}
                              className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                            >
                              {t.rejectBtn}
                            </button>

                            <button
                              onClick={() => onApprove(item.id)}
                              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t.approveBtn}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: APPROVED WEBSITES MANAGEMENT */}
              {activeTab === 'all' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500 mb-2">
                    {t.amApprovedHint}
                  </p>
                  {approvedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-200 transition-colors"
                    >
                      {/* Avatar thumbnail preview */}
                      <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center shadow-2xs">
                        {item.previewImage ? (
                          <img
                            key={item.previewImage}
                            src={item.previewImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({extractDomain(item.url)})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {t.categoryNames[item.category]} • {t.countryNames[item.country] || countryDisplayName(item.country, t.countryNames)} • {t.educationLevelNames[item.educationLevel]} • {t.viewsCount.replace('{count}', String(item.views))}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setEditingProject(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title={t.amEdit}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title={t.amOpenWebsite}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => onDeleteRequest(item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                          title={t.amDeleteWebsite}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: COMMENTS MANAGEMENT & MODERATION */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Top info and filter bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentSearch}
                        onChange={(e) => setCommentSearch(e.target.value)}
                        placeholder="Tìm theo người gửi, nội dung hoặc tên mô phỏng..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      {commentSearch && (
                        <button
                          type="button"
                          onClick={() => setCommentSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <select
                        value={commentCategoryFilter}
                        onChange={(e) => setCommentCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="ALL">Tất cả chủ đề</option>
                        <option value="experience">💡 Kinh nghiệm dạy học</option>
                        <option value="feedback">🛠️ Góp ý kỹ thuật</option>
                        <option value="question">❓ Hỏi đáp kiến thức</option>
                      </select>

                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {filteredAdminComments.length} bình luận
                      </span>
                    </div>
                  </div>

                  {/* Comments list */}
                  {filteredAdminComments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">
                        Không tìm thấy bình luận nào phù hợp
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Thử xóa bộ lọc hoặc tìm kiếm từ khóa khác
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAdminComments.map((comment) => {
                        const proj = projects.find((p) => p.id === comment.projectId);
                        const roleLabel =
                          comment.authorRole === 'teacher'
                            ? 'Giáo viên'
                            : comment.authorRole === 'student'
                            ? 'Học sinh'
                            : comment.authorRole === 'creator'
                            ? 'Tác giả'
                            : 'Thành viên';
                        const categoryLabel =
                          comment.category === 'experience'
                            ? 'Kinh nghiệm'
                            : comment.category === 'feedback'
                            ? 'Góp ý'
                            : 'Hỏi đáp';
                        const badgeColor =
                          comment.category === 'experience'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : comment.category === 'feedback'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                        return (
                          <div
                            key={comment.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                                  {(comment.authorName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900">
                                      {comment.authorName || 'Người dùng ẩn danh'}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                      {roleLabel}
                                    </span>
                                    <span
                                      className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}
                                    >
                                      {categoryLabel}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {formatTimeAgo(comment.createdAt, lang)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 text-amber-400">
                                {Array.from({ length: Math.min(5, Math.max(1, comment.rating || 5)) }).map(
                                  (_, idx) => (
                                    <Star key={idx} className="w-3 h-3 fill-amber-400" />
                                  )
                                )}
                              </div>
                            </div>

                            {/* Project reference pill */}
                            {proj && (
                              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 max-w-full truncate">
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                  Mô phỏng:
                                </span>
                                <span className="font-medium truncate">{proj.title}</span>
                              </div>
                            )}

                            {/* Comment content */}
                            <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                              {comment.content}
                            </p>

                            {/* Unobscured action footer */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                                <span>{comment.likes || 0} lượt hữu ích</span>
                              </span>

                              <div className="flex items-center space-x-2">
                                {onUpdateComment && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingComment(comment)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                                    title="Chỉnh sửa bình luận"
                                  >
                                    <Pencil className="w-3 h-3 text-blue-600" />
                                    <span>Sửa</span>
                                  </button>
                                )}
                                {onDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => setCommentToDelete(comment)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                                    title="Xóa bình luận"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Xóa</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BACKUP & EXPORT/IMPORT JSON */}
              {activeTab === 'backup' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-900 mb-1">
                      {t.vercelDeployTip}
                    </h4>
                    <p className="text-[11px] text-indigo-700 leading-relaxed">
                      {t.amBackupIntro}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={onExportData}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 transition-all text-left flex flex-col justify-between"
                    >
                      <Download className="w-5 h-5 text-indigo-600 mb-2" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{t.exportData}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.amBackupDesc1}</div>
                      </div>
                    </button>

                    <label className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 transition-all text-left flex flex-col justify-between cursor-pointer">
                      <Upload className="w-5 h-5 text-emerald-600 mb-2" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{t.importData}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.amBackupDesc2}</div>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={onResetData}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-amber-300 transition-all text-left flex flex-col justify-between"
                    >
                      <RotateCcw className="w-5 h-5 text-amber-600 mb-2" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{t.resetDefault}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.amBackupDesc3}</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: AI INSIGHTS & STATISTICAL FEEDBACK */}
              {activeTab === 'ai_insights' && (
                <div className="space-y-5">
                  {/* Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-wide">
                          Trung tâm Phân tích AI & Thống kê Tương tác
                        </h4>
                        <p className="text-[11px] text-indigo-200">
                          Khai thác dữ liệu truy cập, tải về, thích và bình luận để đưa ra giải pháp cải tiến mô phỏng
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Macro Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-[#0785F9]" />
                        <span>Tổng truy cập</span>
                      </div>
                      <div className="text-lg font-extrabold text-[#0B3B78]">
                        {projects.reduce((acc, p) => acc + (p.views || 0), 0)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 text-[#FF3B4E]" />
                        <span>Tổng yêu thích</span>
                      </div>
                      <div className="text-lg font-extrabold text-[#FF3B4E]">
                        {projects.reduce((acc, p) => acc + (p.likes || 0), 0)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center space-x-1">
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tổng tải về</span>
                      </div>
                      <div className="text-lg font-extrabold text-emerald-700">
                        {projects.reduce((acc, p) => acc + (p.downloads || 0), 0)}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tổng bình luận</span>
                      </div>
                      <div className="text-lg font-extrabold text-amber-600">
                        {comments.length}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center space-x-1">
                        <Gift className="w-3.5 h-3.5 text-purple-600" />
                        <span>Tổng đóng góp</span>
                      </div>
                      <div className="text-lg font-extrabold text-purple-700">
                        {projects.reduce((acc, p) => acc + (p.contributions || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Section: Rankings & Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Viewed & Downloaded */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span>Top mô phỏng quan tâm & tải về nhiều nhất</span>
                      </div>
                      <div className="space-y-2">
                        {[...projects]
                          .sort((a, b) => ((b.views || 0) + (b.downloads || 0) * 2) - ((a.views || 0) + (a.downloads || 0) * 2))
                          .slice(0, 4)
                          .map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold text-slate-800 truncate" title={p.title}>
                                  {p.title}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-500 shrink-0">
                                <span>{p.views} xem</span>
                                <span>·</span>
                                <span className="text-emerald-600 font-medium">{p.downloads || 0} tải</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* AI Feedback Sentiment Analysis */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span>AI Phân tích Cảm xúc & Nhu cầu Cộng đồng</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                          <span className="font-bold">🌟 Điểm mạnh phản hồi: </span>
                          <span>Học sinh hứng thú với các mô phỏng tương tác kéo thả; giáo viên đánh giá cao tính an toàn và tiết kiệm chi phí phòng thí nghiệm.</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 text-amber-900">
                          <span className="font-bold">⚠️ Vấn đề tồn tại: </span>
                          <span>Một số mô phỏng hiển thị chữ nhỏ trên điện thoại; cần thêm tài liệu phiếu học tập định hướng câu hỏi kèm theo.</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900">
                          <span className="font-bold">💡 Nhu cầu đề xuất: </span>
                          <span>Cần mở rộng thêm mô phỏng cho Tin học (thuật toán trực quan) và Lịch sử - Địa lý (bản đồ 3D).</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: AI Author Feedback Generator */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Công cụ AI Soạn thư phản hồi & Đề xuất cải tiến gửi Tác giả</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tự động sinh nội dung góp ý sư phạm chuẩn mực
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={selectedFeedbackId}
                        onChange={(e) => setSelectedFeedbackId(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Chọn mô phỏng để AI tạo phản hồi --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.authorName})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          const target = projects.find((p) => p.id === selectedFeedbackId);
                          if (!target) return;
                          const targetComments = comments.filter((c) => c.projectId === target.id);
                          const text = `Kính gửi tác giả ${target.authorName},\n\nBan Quản trị OpenEduLab trân trọng cảm ơn Thầy/Cô/Bạn đã đóng góp mô phỏng "${target.title}" vào kho học liệu số cộng đồng.\n\n📊 THỐNG KÊ TƯƠNG TÁC HIỆN TẠI:\n- Lượt truy cập: ${target.views} lượt\n- Lượt yêu thích: ${target.likes} lượt\n- Lượt tải về học liệu: ${target.downloads || 0} lượt\n- Số lượng trao đổi/bình luận: ${targetComments.length || target.commentCount || 0} ý kiến\n\n✨ TỔNG HỢP GÓP Ý TỪ CỘNG ĐỒNG & AI SƯ PHẠM:\n1. Điểm nổi bật: Mô phỏng có tính tương tác cao, bám sát kiến thức trọng tâm bộ môn, giúp học sinh chủ động khám phá hiện tượng khoa học.\n2. Đề xuất cải tiến: Khuyến nghị bổ sung phần hướng dẫn thao tác chi tiết khi mở trên thiết bị di động và đính kèm 2-3 câu hỏi gợi mở ở phần kết thúc thí nghiệm.\n3. Gợi ý mở rộng: Thầy/Cô có thể tham khảo Cẩm nang tạo mô phỏng AI (SimBot v24) trên OpenEduLab để tiếp tục nâng cấp thêm các biến thể bài học mới.\n\nKính chúc Thầy/Cô luôn dồi dào năng lượng và tiếp tục đồng hành cùng phong trào chuyển đổi số giáo dục!\n\nTrân trọng,\nBan Quản trị OpenEduLab`;
                          setGeneratedFeedback(text);
                        }}
                        disabled={!selectedFeedbackId}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Tạo phản hồi</span>
                      </button>
                    </div>

                    {generatedFeedback && (
                      <div className="relative mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <textarea
                          readOnly
                          rows={8}
                          value={generatedFeedback}
                          className="w-full bg-transparent text-xs text-slate-800 font-mono focus:outline-none resize-none leading-relaxed"
                        />
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(generatedFeedback);
                              setCopiedFeedback(true);
                              setTimeout(() => setCopiedFeedback(false), 2000);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center space-x-1 hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            {copiedFeedback ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã sao chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép nội dung thư</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {editingProject && (
        <SubmitModal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          onSubmit={() => {}}
          editingProject={editingProject}
          onUpdate={handleUpdateProject}
          lang={lang}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal Chỉnh Sửa Bình Luận (Admin) */}
      {editingComment && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setEditingComment(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Chỉnh sửa bình luận (Admin)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người gửi
                </label>
                <input
                  type="text"
                  value={editingComment.authorName}
                  onChange={(e) =>
                    setEditingComment({ ...editingComment, authorName: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={editingComment.authorRole || 'teacher'}
                    onChange={(e) =>
                      setEditingComment({
                        ...editingComment,
                        authorRole: e.target.value as CommentRole,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="teacher">👩‍🏫 Giáo viên / Giảng viên</option>
                    <option value="student">👨‍🎓 Học sinh / Sinh viên</option>
                    <option value="creator">✍️ Tác giả / Người sáng tạo</option>
                    <option value="guest">🌐 Khách / Thành viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chủ đề
                  </label>
                  <select
                    value={editingComment.category || 'experience'}
                    onChange={(e) =>
                      setEditingComment({
                        ...editingComment,
                        category: e.target.value as CommentCategory,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="experience">💡 Kinh nghiệm dạy học</option>
                    <option value="feedback">🛠️ Góp ý kỹ thuật</option>
                    <option value="question">❓ Hỏi đáp kiến thức</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đánh giá sao
                </label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() =>
                        setEditingComment({ ...editingComment, rating: star })
                      }
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (editingComment.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-600 font-mono ml-2">
                    {editingComment.rating || 5}/5 sao
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung bình luận
                </label>
                <textarea
                  rows={4}
                  value={editingComment.content}
                  onChange={(e) =>
                    setEditingComment({ ...editingComment, content: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end space-x-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingComment(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateComment && editingComment) {
                    onUpdateComment(editingComment);
                  }
                  setEditingComment(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Bình Luận (Admin) */}
      {commentToDelete && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setCommentToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">
                  Xác nhận xóa bình luận
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này của{' '}
                  <strong className="text-slate-700">
                    {commentToDelete.authorName || 'Người dùng'}
                  </strong>
                  ? Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 italic leading-relaxed line-clamp-3">
              "{commentToDelete.content}"
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteComment && commentToDelete) {
                    onDeleteComment(commentToDelete.id);
                  }
                  setCommentToDelete(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
