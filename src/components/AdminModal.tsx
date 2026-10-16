import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
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
  Zap,
} from 'lucide-react';
import { WebProject, Language } from '../types';
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
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  setIsAdmin,
  projects,
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
}) => {
  const t = translations[lang];

  // Login credentials
  const [adminId, setAdminId] = useState(() => {
    return localStorage.getItem('webhub_admin_id') || 'admin';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'backup'>('pending');

  const [editingProject, setEditingProject] = useState<WebProject | null>(null);
  const [isPendingSyncing, setIsPendingSyncing] = useState(false);
  const [pendingSyncMsg, setPendingSyncMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

              {/* TAB 3: BACKUP & EXPORT/IMPORT JSON */}
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
    </div>
  );
};
