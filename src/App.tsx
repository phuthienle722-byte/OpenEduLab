/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FilterState,
  Language,
  LANGUAGE_CODES,
  ProjectComment,
  ProjectStatsDirty,
  ViewMode,
  WebProject,
} from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { localizeProject } from './data/projectLocalizations';
import { translations } from './translations';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { Sidebar } from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { TimelineLayerCard } from './components/TimelineLayerCard';
import { CompactListItem } from './components/CompactListItem';
import { SimulationGuide } from './components/SimulationGuide';
import { QRCodeModal } from './components/QRCodeModal';
import { SubmitModal } from './components/SubmitModal';
import { AdminModal } from './components/AdminModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DiscussionHubModal } from './components/DiscussionHubModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Globe, Plus, Sparkles } from 'lucide-react';
import {
  getStoredScriptUrl,
  isAutoSyncEnabled,
  ensureGoLink,
  pushSingleProjectToSheet,
  upsertProjectToSheet,
  fetchProjectsFromSheet,
  fetchSubmissionsFromSheet,
  deleteSubmissionsFromSheet,
  updateStatsInSheet,
  fetchCommentsFromSheet,
  pushCommentToSheet,
  deleteCommentFromSheet,
  updateCommentInSheet,
  STORAGE_KEY_COMMENTS,
  STORAGE_KEY_DELETED_COMMENTS,
} from './services/googleSync';
import {
  isCommunityApprovedOnly,
  setCommunityApprovedOnly,
} from './config';

const STORAGE_KEY_PROJECTS = 'webhub_projects_data_v3';
const STORAGE_KEY_LANG = 'webhub_language_preference';
const STORAGE_KEY_ADMIN = 'webhub_admin_session';

const getDeletedCommentIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_COMMENTS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

const addDeletedCommentId = (id: string | string[]) => {
  try {
    const current = getDeletedCommentIds();
    const ids = Array.isArray(id) ? id : [id];
    ids.forEach((i) => current.add(i));
    localStorage.setItem(STORAGE_KEY_DELETED_COMMENTS, JSON.stringify(Array.from(current)));
  } catch {}
};

const DEFAULT_SEED_COMMENTS: ProjectComment[] = [
  {
    id: 'comm-seed-lk-1',
    projectId: 'proj-1792199361860',
    authorName: 'Thầy Quốc Dũng (GV KHTN 9)',
    authorRole: 'teacher',
    category: 'experience',
    content: 'Mô phỏng tán sắc ánh sáng qua lăng kính rất trực quan! Học sinh quan sát rõ góc lệch và dải màu cầu vồng khi thay đổi góc tới và chiết suất của lăng kính trong bài học KHTN 9.',
    rating: 5,
    createdAt: '2026-03-01T08:00:00.000Z',
    likes: 12,
  },
  {
    id: 'comm-seed-lk-2',
    projectId: 'proj-1792199361860',
    authorName: 'Minh Quân (Học sinh 9A1)',
    authorRole: 'student',
    category: 'feedback',
    content: 'Em thích nhất phần điều chỉnh bước sóng ánh sáng đơn sắc để quan sát tia khúc xạ đổi hướng. Trực quan và dễ hiểu hơn nhiều so với hình vẽ tĩnh trong SGK ạ!',
    rating: 5,
    createdAt: '2026-03-01T09:30:00.000Z',
    likes: 7,
  },
  {
    id: 'comm-seed-lk-3',
    projectId: 'proj-1792199361860',
    authorName: 'Cô Hoàng Mai (GV Vật Lý THCS)',
    authorRole: 'teacher',
    category: 'question',
    content: 'Tác giả có thể bổ sung tùy chọn hiển thị đường pháp tuyến và số đo góc tới $i_1$, góc ló $i_2$ trên hình vẽ để học sinh đối chiếu số liệu lý thuyết không thầy Liêm?',
    rating: 5,
    createdAt: '2026-03-01T11:15:00.000Z',
    likes: 4,
  },
  {
    id: 'comm-seed-1',
    projectId: 'proj-1741697206385',
    authorName: 'Thầy Lê Minh (GV KHTN 7)',
    authorRole: 'teacher',
    category: 'experience',
    content: 'Đã ứng dụng trong tiết đo tốc độ chuyển động bài 8 KHTN 7. Học sinh thao tác bấm giờ trực tiếp trên điện thoại rất hào hứng, số liệu đo giữa các nhóm đồng đều!',
    rating: 5,
    createdAt: '2026-03-02T08:00:00.000Z',
    likes: 8,
  },
  {
    id: 'comm-seed-2',
    projectId: 'proj-1741697206385',
    authorName: 'Hồng Anh (Học sinh 7A2)',
    authorRole: 'student',
    category: 'feedback',
    content: 'Giao diện đồng hồ số to rõ, dễ nhìn từ xa khi làm thí nghiệm. Nếu tác giả bổ sung thêm nút lưu lịch sử 5 lần bấm gần nhất (lap time) thì làm báo cáo nhóm sẽ tiện hơn rất nhiều ạ!',
    rating: 4,
    createdAt: '2026-03-02T09:30:00.000Z',
    likes: 5,
  },
  {
    id: 'comm-seed-3',
    projectId: 'proj-1741697206385',
    authorName: 'Cô Thu Trang (Tổ trưởng Chuyên môn)',
    authorRole: 'teacher',
    category: 'question',
    content: 'Mô phỏng này có xuất bảng dữ liệu sang file Excel hoặc đồng bộ trực tiếp vào Google Sheets cho học sinh không thầy Liêm?',
    rating: 5,
    createdAt: '2026-03-02T11:00:00.000Z',
    likes: 3,
  },
];

// Helper to ensure famous platforms and community submissions are cleanly separated
const sanitizeAndMigrateProjects = (loadedList: WebProject[]): WebProject[] => {
  // CĂ¡c dá»¯ liá»‡u máº«u cÅ© Ä‘Ă£ Ä‘Æ°á»£c gá»¡ khá»i báº£n khá»Ÿi táº¡o (demo bĂ i Ä‘Äƒng táº£i, pending, má»¥c ghĂ©p cÅ©)
  const deprecatedSampleIds = new Set<string>([
    'proj-phys-1',
    'proj-chem-1',
    'proj-math-1',
    'proj-bio-1',
    'proj-hist-1',
    'proj-lit-1',
    'proj-eng-1',
    'proj-pending-1',
  ]);

  const famousKeywords = [
    'phet',
    'geogebra',
    'netsim',
    'packet-tracer',
    'falstad',
    'desmos',
    'scratch',
    'biodigital',
    'algorithm-visualizer',
    'molview',
  ];

  const initialFamous = INITIAL_PROJECTS.filter((p) => p.isFamous);

  const updated: WebProject[] = loadedList
    .filter((p) => !deprecatedSampleIds.has(p.id))
    .map((p) => {
      const isFamousMatch = famousKeywords.some(
        (kw) =>
          p.url.toLowerCase().includes(kw) ||
          p.id.toLowerCase().includes(kw) ||
          p.title.toLowerCase().includes(kw)
      );
      const isFamousActual = isFamousMatch || !!p.isFamous;
      // Giá»¯ dá»¯ liá»‡u cÅ©: bĂ i approved khĂ´ng ná»•i tiáº¿ng â†’ coi lĂ  bĂ i admin Ä‘Ă£ duyá»‡t
      // (cĂ¡c bĂ i máº«u khá»Ÿi táº¡o Ä‘á»u lĂ  famous nĂªn khĂ´ng bá»‹ tĂ­nh nháº§m)
      const isUserSubmission =
        p.isUserSubmission === true ||
        (p.status === 'approved' && !isFamousActual);
      const safeTags = Array.isArray(p.tags)
        ? p.tags.map(String).map((t) => t.trim()).filter(Boolean)
        : typeof p.tags === 'string'
        ? (p.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      return {
        ...p,
        tags: safeTags,
        views: Number(p.views) || 0,
        likes: Number(p.likes) || 0,
        downloads: Number(p.downloads) || 0,
        contributions: Number(p.contributions) || 0,
        commentCount: Number(p.commentCount) || 0,
        isFamous: isFamousActual,
        isUserSubmission,
      };
    });

  // Ensure all standard famous simulations from INITIAL_PROJECTS are included
  for (const fam of initialFamous) {
    if (!updated.some((p) => p.id === fam.id || p.url === fam.url)) {
      updated.push(fam);
    }
  }

  return updated;
};

// Há»£p nháº¥t dá»¯ liá»‡u cloud (bĂ i Ä‘Ă£ duyá»‡t) vá»›i báº£n local Ä‘á»ƒ KHĂ”NG lĂ m máº¥t cĂ¡c cá»
// Ä‘Ă£ biáº¿t nhÆ° isUserSubmission / isFamous, vĂ  KHĂ”NG lĂ m giáº£m Views/Likes.
// LĂ½ do: Apps Script cÅ© / dá»¯ liá»‡u cÅ© trong Sheets chÆ°a cĂ³ cá»™t IsUserSubmission
// nĂªn dá»¯ liá»‡u táº£i vá» thiáº¿u cá» -> náº¿u ghi Ä‘Ă¨ trá»±c tiáº¿p, bĂ i Ä‘Ă£ duyá»‡t vá»¥t máº¥t khá»i
// tab "BĂ i Ä‘Äƒng táº£i" (cá»™ng Ä‘á»“ng).
const mergeCloudProject = (
  local: WebProject,
  cloud: WebProject
): WebProject => {
  const cloudTags = Array.isArray(cloud.tags) && cloud.tags.length > 0
    ? cloud.tags
    : typeof cloud.tags === 'string'
    ? (cloud.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  const localTags = Array.isArray(local.tags) ? local.tags : [];
  return {
    ...cloud,
    tags: cloudTags.length > 0 ? cloudTags : localTags,
    views: Math.max(local.views || 0, cloud.views || 0),
    likes: Math.max(local.likes || 0, cloud.likes || 0),
    downloads: Math.max(local.downloads || 0, cloud.downloads || 0),
    contributions: Math.max(local.contributions || 0, cloud.contributions || 0),
    commentCount: Math.max(local.commentCount || 0, cloud.commentCount || 0),
    isFamous: local.isFamous === true || cloud.isFamous === true,
    isUserSubmission:
      local.isUserSubmission === true || cloud.isUserSubmission === true,
  };
};

export default function App() {
  // 1. Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    // Tránh giá trị cũ không còn được hỗ trợ -> quay về tiếng Việt
    return LANGUAGE_CODES.includes(saved as Language) ? (saved as Language) : 'vi';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
  };

  const t = translations[lang];

  // 2. Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
  });

  const handleSetIsAdmin = (val: boolean) => {
    setIsAdmin(val);
    localStorage.setItem(STORAGE_KEY_ADMIN, val ? 'true' : 'false');
  };

  // Biến kiểm soát chế độ cộng đồng: tab "Bài đăng tải" chỉ hiển thị bài admin duyệt
  const [communityOnly, setCommunityOnly] = useState<boolean>(() =>
    isCommunityApprovedOnly()
  );

  const handleCommunityOnlyChange = (val: boolean) => {
    setCommunityApprovedOnly(val);
    setCommunityOnly(val);
  };

  // 3. Projects State (Loaded from localStorage with clean migration across all versions or Initial Seed)
  const [projects, setProjects] = useState<WebProject[]>(() => {
    try {
      const storageKeys = [
        'webhub_projects_data_v4',
        'webhub_projects_data_v3',
        'webhub_projects_data_v2',
        'webhub_projects_data_v1',
        'webhub_projects_data',
      ];
      const mergedList: WebProject[] = [];
      for (const key of storageKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (
                  item &&
                  item.id &&
                  !mergedList.some(
                    (existing) => existing.id === item.id || existing.url === item.url
                  )
                ) {
                  // Giữ nguyên trạng thái (approved / pending / rejected) khi tải lại
                  mergedList.push({ ...item });
                }
              }
            }
          } catch {
            // ignore JSON error
          }
        }
      }

      if (mergedList.length > 0) {
        return sanitizeAndMigrateProjects(mergedList);
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROJECTS;
  });

  // Save projects to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [projects]);

  // 3b. Comments State (Local-first with persistent storage + Google Sheets sync)
  const [comments, setComments] = useState<ProjectComment[]>(() => {
    try {
      const deletedIds = getDeletedCommentIds();
      const saved = localStorage.getItem(STORAGE_KEY_COMMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seedMap = new Map(DEFAULT_SEED_COMMENTS.map((s) => [s.id, s.createdAt]));
          return parsed
            .filter((c: ProjectComment) => c && c.id && !deletedIds.has(c.id))
            .map((c: ProjectComment) => {
              if (c && c.id && seedMap.has(c.id)) {
                return { ...c, createdAt: seedMap.get(c.id)! };
              }
              return c;
            });
        }
      }
      return DEFAULT_SEED_COMMENTS.filter((c) => !deletedIds.has(c.id));
    } catch (e) {
      console.warn('Failed to load comments from localStorage', e);
    }
    return DEFAULT_SEED_COMMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    } catch (e) {
      console.error('Failed to save comments to localStorage', e);
    }
  }, [comments]);

  const [selectedDiscussionProject, setSelectedDiscussionProject] = useState<WebProject | null>(null);

  // Theo dõi các thay đổi thống kê (Views, Likes, Downloads, Contributions, CommentCount) chưa kịp đồng bộ lên Google Sheets.
  const statsDirtyRef = useRef<Map<string, ProjectStatsDirty>>(new Map());
  const statsTimerRef = useRef<number | null>(null);

  const flushStatsSync = useCallback(() => {
    if (statsTimerRef.current !== null) {
      window.clearTimeout(statsTimerRef.current);
      statsTimerRef.current = null;
    }
    const dirty = statsDirtyRef.current;
    if (dirty.size === 0) return;
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      const items = Array.from(dirty.values()) as ProjectStatsDirty[];
      updateStatsInSheet(scriptUrl, items);
    }
    dirty.clear();
  }, []);

  // Gộp các thay đổi stats và gửi lên Sheets sau 4 giây trễ (debounce)
  const markStatsDirty = useCallback(
    (id: string, partial: Partial<ProjectStatsDirty>) => {
      const currentProject = projects.find((p) => p.id === id);
      const prev = statsDirtyRef.current.get(id) || {
        projectId: id,
        views: currentProject?.views || 0,
        likes: currentProject?.likes || 0,
        downloads: currentProject?.downloads || 0,
        contributions: currentProject?.contributions || 0,
        commentCount: currentProject?.commentCount || 0,
      };
      statsDirtyRef.current.set(id, {
        projectId: id,
        views: partial.views !== undefined ? Math.max(prev.views || 0, partial.views) : (prev.views || 0),
        likes: partial.likes !== undefined ? Math.max(prev.likes || 0, partial.likes) : (prev.likes || 0),
        downloads: partial.downloads !== undefined ? Math.max(prev.downloads || 0, partial.downloads) : (prev.downloads || 0),
        contributions: partial.contributions !== undefined ? Math.max(prev.contributions || 0, partial.contributions) : (prev.contributions || 0),
        commentCount: partial.commentCount !== undefined ? Math.max(prev.commentCount || 0, partial.commentCount) : (prev.commentCount || 0),
      });
      if (statsTimerRef.current !== null) window.clearTimeout(statsTimerRef.current);
      statsTimerRef.current = window.setTimeout(flushStatsSync, 4000);
    },
    [flushStatsSync, projects]
  );

  // Dọn dẹp timer và đẩy stats còn dang dở khi đóng trang
  useEffect(() => {
    const flushOnUnload = () => {
      const dirty = statsDirtyRef.current;
      if (dirty.size === 0) return;
      const scriptUrl = getStoredScriptUrl();
      if (!scriptUrl || !isAutoSyncEnabled()) return;
      const items = Array.from(dirty.values()) as ProjectStatsDirty[];
      updateStatsInSheet(scriptUrl, items);
    };
    window.addEventListener('beforeunload', flushOnUnload);
    return () => {
      window.removeEventListener('beforeunload', flushOnUnload);
      if (statsTimerRef.current !== null) window.clearTimeout(statsTimerRef.current);
    };
  }, []);

  // Trạng thái đồng bộ dữ liệu đám mây (background non-blocking sync)
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [isCommentsSyncing, setIsCommentsSyncing] = useState<boolean>(false);

  // 4. View Mode & Filter State
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'ALL',
    educationLevel: 'ALL',
    sortBy: 'newest',
    onlyFamous: false,
  });
  // Tab "Hướng dẫn tạo mô phỏng" — khi bật, ẩn danh sách web và hiện hướng dẫn
  const [showGuide, setShowGuide] = useState(false);

  const handleOpenGuide = () => setShowGuide(true);

  const handleExitGuide = () => setShowGuide(false);

  // 5. Modals State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  // BĂ i Ä‘ang Ä‘Æ°á»£c admin chá»‰nh sá»­a (má»Ÿ tháº³ng SubmitModal á»Ÿ cháº¿ Ä‘á»™ sá»­a)
  const [editingProject, setEditingProject] = useState<WebProject | null>(null);

  const handleOpenEditProject = (p: WebProject) => {
    // Luôn chỉnh sửa bản GỐC (raw) trong state — không lấy bản localized
    // từ card, tránh ghi đè nội dung gốc / mất các cờ quan trọng.
    const raw = projects.find((item) => item.id === p.id) || p;
    setEditingProject(raw);
    setIsSubmitOpen(true);
  };

  const handleOpenSubmitNew = () => {
    setEditingProject(null);
    setIsSubmitOpen(true);
  };
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedQRProject, setSelectedQRProject] = useState<WebProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<WebProject | null>(null);

  /**
   * KĂ©o cĂ¡c bĂ i CHá»œ DUYá»†T / Tá»ª CHá»I tá»« tab WebHub_Submissions trĂªn Google Sheets vá»
   * vĂ  há»£p nháº¥t vĂ o state local. Nhá» váº­y admin má»Ÿ trĂªn thiáº¿t bá»‹ Báº¤T Ká»² nĂ o
   * cÅ©ng tháº¥y Ä‘Æ°á»£c bĂ i mĂ  ngÆ°á»i dĂ¹ng vá»«a gá»­i tá»« thiáº¿t bá»‹ khĂ¡c (cross-device).
   */
  const syncPendingFromCloud = useCallback(() => {
    const scriptUrl = getStoredScriptUrl();
    if (!scriptUrl || !isAutoSyncEnabled()) return;

    return fetchSubmissionsFromSheet(scriptUrl)
      .then((result) => {
        if (!result.success || !result.data) return;
        setProjects((prev) => {
          const cloudProjects = result.data as WebProject[];
          let changed = false;
          const merged = [...prev];
          for (const cp of cloudProjects) {
            // Bá» qua bĂ i Ä‘Ă£ APPROVED cĂ²n sĂ³t trong tab chá» duyá»‡t (Ä‘Ă£ chuyá»ƒn sang
            // WebHub_Projects khi admin duyá»‡t) â€” trĂ¡nh hiá»‡n nháº§m trong danh sĂ¡ch chá».
            if (cp.status !== 'pending' && cp.status !== 'rejected') continue;
            const idx = merged.findIndex((p) => p.id === cp.id);
            // Chá»‰ thĂªm/cáº­p nháº­t bĂ i CHÆ¯A duyá»‡t (pending/rejected) tá»›i tá»« Ä‘Ă¡m mĂ¢y,
            // trĂ¡nh Ä‘Ă¨ lĂªn dá»¯ liá»‡u approved Ä‘ang hiá»ƒn thá»‹.
            const effectiveStatus =
              cp.status === 'rejected' ? 'rejected' : 'pending';
            if (idx >= 0) {
              if (
                merged[idx].status === 'pending' ||
                merged[idx].status === 'rejected'
              ) {
                merged[idx] = {
                  ...merged[idx],
                  ...cp,
                  status: effectiveStatus,
                  isUserSubmission:
                    merged[idx].isUserSubmission === true ||
                    cp.isUserSubmission === true,
                };
                changed = true;
              }
            } else {
              merged.push({
                ...cp,
                status: effectiveStatus,
                isUserSubmission: cp.isUserSubmission === true,
              });
              changed = true;
            }
          }
          return changed ? merged : prev;
        });
      })
      .catch((err) => {
        console.warn('Background pending sync notice:', err);
      });
  }, []);

  /**
   * Kéo bình luận mới nhất từ Google Sheets và hợp nhất vào state.
   * Đồng thời cập nhật số lượng commentCount trên card mô phỏng nếu có bình luận mới.
   */
  const syncCommentsFromCloud = useCallback((targetProjectId?: string) => {
    const scriptUrl = getStoredScriptUrl();
    if (!scriptUrl || !isAutoSyncEnabled()) return Promise.resolve();

    setIsCommentsSyncing(true);
    return fetchCommentsFromSheet(scriptUrl, targetProjectId)
      .then((result) => {
        if (!result.success || !result.data || !Array.isArray(result.data)) return;
        const deletedIds = getDeletedCommentIds();
        const cloudComments = (result.data as ProjectComment[]).filter(
          (c) => c && c.id && !deletedIds.has(c.id)
        );
        setComments((prev) => {
          const merged = prev.filter((c) => !deletedIds.has(c.id));
          let changed = false;
          for (const cc of cloudComments) {
            const idx = merged.findIndex((c) => c.id === cc.id);
            if (idx >= 0) {
              const maxLikes = Math.max(merged[idx].likes || 0, cc.likes || 0);
              if (
                merged[idx].likes !== maxLikes ||
                merged[idx].content !== cc.content ||
                merged[idx].authorName !== cc.authorName ||
                merged[idx].authorRole !== cc.authorRole ||
                merged[idx].category !== cc.category ||
                merged[idx].rating !== cc.rating
              ) {
                merged[idx] = { ...merged[idx], ...cc, likes: maxLikes };
                changed = true;
              }
            } else {
              merged.push(cc);
              changed = true;
            }
          }
          return changed ? merged : prev;
        });

        // Cập nhật commentCount trên từng project nếu đám mây có thêm bình luận
        setProjects((prev) => {
          let updated = false;
          const nextProjects = prev.map((proj) => {
            const count = cloudComments.filter((c) => c && c.projectId === proj.id).length;
            if (count > (proj.commentCount || 0)) {
              updated = true;
              return { ...proj, commentCount: count };
            }
            return proj;
          });
          return updated ? nextProjects : prev;
        });
      })
      .catch((err) => console.warn('Background comments sync notice:', err))
      .finally(() => {
        setIsCommentsSyncing(false);
      });
  }, []);

  // Background non-blocking auto-sync from Google Sheets on initial load
  useEffect(() => {
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      setIsCloudSyncing(true);
      const syncApprovedPromise = fetchProjectsFromSheet(scriptUrl)
        .then((result) => {
          if (!result.success || !result.data || result.data.length === 0) return;
          setProjects((prev) => {
            const cloudApproved = result.data as WebProject[];
            const merged = [...prev];
            let changed = false;
            for (const cp of cloudApproved) {
              const idx = merged.findIndex((p) => p.id === cp.id);
              if (idx >= 0) {
                if (merged[idx].status !== 'approved') {
                  merged[idx] = {
                    ...mergeCloudProject(merged[idx], cp),
                    status: 'approved',
                  };
                  changed = true;
                } else {
                  // Há»£p nháº¥t giá»¯ cá» + sá»‘ liá»‡u cao hÆ¡n, khĂ´ng lĂ m máº¥t isUserSubmission
                  const mergedItem = {
                    ...mergeCloudProject(merged[idx], cp),
                    status: 'approved',
                  };
                  if (JSON.stringify(merged[idx]) !== JSON.stringify(mergedItem)) {
                    merged[idx] = mergedItem;
                    changed = true;
                  }
                }
              } else {
                merged.push({ ...cp, status: 'approved' });
                changed = true;
              }
            }
            return changed ? merged : prev;
          });
        })
        .catch((err) => {
          console.warn('Background Google Sheets sync notice:', err);
        });
      // Äá»“ng thá»i kĂ©o danh sĂ¡ch bĂ i chá» duyá»‡t tá»« Ä‘Ă¡m mĂ¢y vá»
      const syncPendingPromise = syncPendingFromCloud();
      const syncCommentsPromise = syncCommentsFromCloud();

      Promise.allSettled([syncApprovedPromise, syncPendingPromise, syncCommentsPromise]).finally(() => {
        setIsCloudSyncing(false);
      });
    }
  }, [syncPendingFromCloud, syncCommentsFromCloud]);

  // Äá»‹nh ká»³ (má»—i 45 giĂ¢y) táº£i láº¡i dá»¯ liá»‡u ÄĂƒ DUYá»†T tá»« Google Sheets.
  // Nhá» váº­y khi admin duyá»‡t bĂ i á»Ÿ báº¥t ká»³ thiáº¿t bá»‹ nĂ o, cĂ¡c thiáº¿t bá»‹ khĂ¡c
  // sáº½ tá»± Ä‘á»™ng cáº­p nháº­t vĂ  hiá»ƒn thá»‹ bĂ i ngay mĂ  khĂ´ng cáº§n reload trang.
  useEffect(() => {
    const scriptUrl = getStoredScriptUrl();
    if (!scriptUrl || !isAutoSyncEnabled()) return;

    const pollApproved = () => {
      fetchProjectsFromSheet(scriptUrl)
        .then((result) => {
          if (!result.success || !result.data) return;
          setProjects((prev) => {
            let cloudApproved = result.data as WebProject[];
            let changed = false;
            const merged = [...prev];

            // GhĂ©p bĂ i Ä‘Ă£ duyá»‡t tá»« Ä‘Ă¡m mĂ¢y (giá»¯ láº¡i pending/rejected local)
            for (let cp of cloudApproved) {
              // Äá»«ng Ä‘á»ƒ dá»¯ liá»‡u Ä‘Ă¡m mĂ¢y ghi Ä‘Ă¨ Views/Likes local chÆ°a ká»‹p Ä‘á»“ng bá»™
              const dirty = statsDirtyRef.current.get(cp.id);
              if (dirty) {
                cp = {
                  ...cp,
                  views: Math.max(cp.views || 0, dirty.views || 0),
                  likes: Math.max(cp.likes || 0, dirty.likes || 0),
                  downloads: Math.max(cp.downloads || 0, dirty.downloads || 0),
                  contributions: Math.max(cp.contributions || 0, dirty.contributions || 0),
                  commentCount: Math.max(cp.commentCount || 0, dirty.commentCount || 0),
                };
              }
              const idx = merged.findIndex((p) => p.id === cp.id);
              if (idx >= 0) {
                const mergedItem = {
                  ...mergeCloudProject(merged[idx], cp),
                  status: 'approved',
                };
                if (JSON.stringify(merged[idx]) !== JSON.stringify(mergedItem)) {
                  merged[idx] = mergedItem;
                  changed = true;
                }
              } else {
                merged.push({ ...cp, status: 'approved' });
                changed = true;
              }
            }
            return changed ? merged : prev;
          });
        })
        .catch((err) => {
          console.warn('Polling approved sync notice:', err);
        });

      // Kéo bình luận định kỳ từ đám mây
      syncCommentsFromCloud();
    };

    pollApproved();
    const interval = setInterval(pollApproved, 20000);
    return () => clearInterval(interval);
  }, [syncCommentsFromCloud]);

  // 6. Action Handlers (Views, Likes, Downloads, Contributions, Comments)
  const handleLike = (projectId: string) => {
    let updatedLikes = 0;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedLikes = (p.likes || 0) + 1;
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );
    markStatsDirty(projectId, { likes: updatedLikes });
  };

  const handleVisit = (projectId: string) => {
    let updatedViews = 0;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedViews = (p.views || 0) + 1;
          return { ...p, views: updatedViews };
        }
        return p;
      })
    );
    markStatsDirty(projectId, { views: updatedViews });
  };

  const handleDownload = (projectId: string, _type?: 'qr' | 'doc' | 'offline') => {
    let updatedDownloads = 0;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedDownloads = (p.downloads || 0) + 1;
          return { ...p, downloads: updatedDownloads };
        }
        return p;
      })
    );
    markStatsDirty(projectId, { downloads: updatedDownloads });
  };

  const handleContribute = (projectId: string) => {
    let updatedContributions = 0;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          updatedContributions = (p.contributions || 0) + 1;
          return { ...p, contributions: updatedContributions };
        }
        return p;
      })
    );
    markStatsDirty(projectId, { contributions: updatedContributions });
  };

  const handleOpenDiscussion = (p: WebProject) => {
    const fresh = projects.find((x) => x.id === p.id) || p;
    setSelectedDiscussionProject(fresh);
    // Kéo ngay lập tức bình luận mới nhất từ Google Sheets ngay khi mở modal
    syncCommentsFromCloud(p.id);
  };

  const handleAddComment = (commentData: Omit<ProjectComment, 'id' | 'createdAt' | 'likes'>) => {
    const newComment: ProjectComment = {
      ...commentData,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setComments((prev) => [newComment, ...prev]);

    // Tăng commentCount trên project
    let updatedCommentCount = 0;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === commentData.projectId) {
          updatedCommentCount = (p.commentCount || 0) + 1;
          return { ...p, commentCount: updatedCommentCount };
        }
        return p;
      })
    );
    markStatsDirty(commentData.projectId, { commentCount: updatedCommentCount });

    // Đẩy comment lên Google Sheets trong nền (non-blocking) và tự động đồng bộ lại
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      pushCommentToSheet(scriptUrl, newComment).then(() => {
        syncCommentsFromCloud(commentData.projectId);
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );
  };

  const handleDeleteComment = (commentId: string) => {
    // 1. Tìm comment để biết thuộc project nào nhằm giảm commentCount
    const target = comments.find((c) => c.id === commentId);
    const projectId = target?.projectId;

    // 2. Ghi nhận vào danh sách đã xóa để cloud sync không kéo lại
    addDeletedCommentId(commentId);

    // 3. Xóa khỏi state comments
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    // 4. Giảm commentCount trên project tương ứng
    if (projectId) {
      let nextCount = 0;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            nextCount = Math.max(0, (p.commentCount || 1) - 1);
            return { ...p, commentCount: nextCount };
          }
          return p;
        })
      );
      markStatsDirty(projectId, { commentCount: nextCount });
    }

    // 5. Gửi lệnh xóa lên Google Sheets nếu đã liên kết
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      deleteCommentFromSheet(scriptUrl, commentId);
    }
  };

  const handleDeleteAllCommentsForProject = (projectId: string) => {
    const commentsForProject = comments.filter((c) => c.projectId === projectId);
    const ids = commentsForProject.map((c) => c.id);
    if (ids.length === 0) return;

    // Ghi nhận vào danh sách đã xóa
    addDeletedCommentId(ids);

    // Xóa toàn bộ khỏi state
    setComments((prev) => prev.filter((c) => c.projectId !== projectId));

    // Đưa commentCount về 0
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, commentCount: 0 } : p))
    );
    markStatsDirty(projectId, { commentCount: 0 });

    // Gửi lệnh xóa lên Google Sheets
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      deleteCommentFromSheet(scriptUrl, ids);
    }
  };

  const handleUpdateComment = (updatedComment: ProjectComment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? { ...c, ...updatedComment } : c))
    );

    // Gửi cập nhật lên Google Sheets
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      updateCommentInSheet(scriptUrl, updatedComment);
    }
  };

  const handleSubmitNewProject = (
    data: Omit<WebProject, 'id' | 'createdAt' | 'views' | 'likes'>
  ) => {
    const id = `proj-${Date.now()}`;
    // Không auto-tạo thumbnail tại thời điểm submit: project đang pending nên
    // link che /go/<code> chưa hoạt động → mshots sẽ chụp trang 404 bị cache.
    // BrowserMockupFrame sẽ tự sinh thumbnail từ go-link khi bài đã được duyệt.
    const thumbnail = (data.previewImage && data.previewImage.trim()) || undefined;

    const newProject: WebProject = {
      ...data,
      id,
      status: 'pending', // Chá» admin duyá»‡t trÆ°á»›c khi hiá»ƒn thá»‹ cĂ´ng khai
      isUserSubmission: true, // BĂ i ngÆ°á»i dĂ¹ng Ä‘Äƒng â†’ thuá»™c tab "BĂ i Ä‘Äƒng táº£i" khi Ä‘Æ°á»£c duyá»‡t
      createdAt: new Date().toISOString(),
      views: 1,
      likes: 0,
      previewImage: thumbnail,
      goLink: '',
    };
    // Tạo goLink lần đầu (link /go/<mã>) và lưu vào cột GoLink trên Google Sheets;
    // sau này chỉ đọc ra dùng, không sinh lại.
    const newProjectWithGoLink = ensureGoLink(newProject);
    setProjects((prev) => [newProjectWithGoLink, ...prev]);
    // Chuyá»ƒn vá» tab "BĂ i Ä‘Äƒng táº£i" máº·c Ä‘á»‹nh
    setFilters((prev) => ({ ...prev, onlyFamous: false }));

    // Äáº©y bĂ i má»›i (tráº¡ng thĂ¡i pending) lĂªn Google Sheets náº¿u Ä‘Ă£ cáº¥u hĂ¬nh
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      pushSingleProjectToSheet(scriptUrl, newProjectWithGoLink);
    }
  };

  const handleApprove = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );

    // Äá»“ng bá»™ toĂ n bá»™ thĂ´ng tin bĂ i (gá»“m áº£nh Ä‘áº¡i diá»‡n) lĂªn Google Sheets
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      // BĂ i Ä‘Æ°á»£c admin duyá»‡t â†’ luĂ´n coi lĂ  bĂ i cá»™ng Ä‘á»“ng (hiá»ƒn thá»‹ á»Ÿ "BĂ i Ä‘Äƒng táº£i")
      upsertProjectToSheet(scriptUrl, {
        ...project,
        status: 'approved',
        isUserSubmission: true,
      });
      // Sau khi duyá»‡t, kĂ©o láº¡i danh sĂ¡ch chá» duyá»‡t tá»« Ä‘Ă¡m mĂ¢y
      syncPendingFromCloud();
    }
  };

  const handleReject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );

    // Äá»“ng bá»™ tráº¡ng thĂ¡i tá»« chá»‘i (kĂ¨m toĂ n bá»™ thĂ´ng tin) lĂªn Google Sheets
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      upsertProjectToSheet(scriptUrl, { ...project, status: 'rejected' });
      // Sau khi tá»« chá»‘i, kĂ©o láº¡i danh sĂ¡ch chá» duyá»‡t tá»« Ä‘Ă¡m mĂ¢y
      syncPendingFromCloud();
    }
  };

  const handleConfirmDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));

    // Äá»“ng bá»™ xĂ³a lĂªn Google Sheets (cáº£ tab Ä‘Ă£ duyá»‡t láº«n chá» duyá»‡t)
    // Ä‘á»ƒ bĂ i Ä‘Ă£ xĂ³a khĂ´ng quay láº¡i khi táº£i dá»¯ liá»‡u tá»« Sheets / duyá»‡t tá»« xa.
    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      deleteSubmissionsFromSheet(scriptUrl, [id]);
    }
  };

const handleUpdateProject = (updated: WebProject) => {
    // Chỉnh sửa KHÔNG thay đổi trạng thái duyệt & không làm mất các cờ/quyền:
    // giữ nguyên status (approve/reject/pending), id, ngày tạo, thống kê,
    // isFamous và isUserSubmission từ bản ghi hiện có.
    const existing = projects.find((p) => p.id === updated.id);
    const merged: WebProject = existing
      ? {
          ...updated,
          id: existing.id,
          createdAt: existing.createdAt || updated.createdAt,
          status: existing.status || updated.status,
          views: Math.max(existing.views, updated.views),
          likes: Math.max(existing.likes, updated.likes),
          isFamous: existing.isFamous === true ? true : updated.isFamous === true,
          isUserSubmission:
            existing.isUserSubmission === true
              ? true
              : updated.isUserSubmission === true,
        }
      : updated;

    setProjects((prev) =>
      prev.map((p) => (p.id === merged.id ? merged : p))
    );

    const scriptUrl = getStoredScriptUrl();
    if (scriptUrl && isAutoSyncEnabled()) {
      upsertProjectToSheet(scriptUrl, merged);
    }
  };

  const handleExportData = () => {
    const jsonStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webhub-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (imported: WebProject[]) => {
    setProjects(imported);
    alert(t.amImportSuccess.replace('{count}', String(imported.length)));
  };

  const handleResetData = () => {
    if (window.confirm(t.amResetConfirm)) {
      setProjects(INITIAL_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
    }
  };

  // 7. Filtering & Sorting Logic
  const approvedProjects = useMemo(
    () => projects.filter((p) => p.status === 'approved'),
    [projects]
  );
  const localizedProjects = useMemo(
    () => approvedProjects.map((p) => localizeProject(p, lang)),
    [approvedProjects, lang]
  );
  const defaultApprovedCount = useMemo(
    () =>
      approvedProjects.filter(
        (p) => !p.isFamous && (communityOnly ? p.isUserSubmission : true)
      ).length,
    [approvedProjects, communityOnly]
  );
  const famousCount = useMemo(
    () => approvedProjects.filter((p) => !!p.isFamous).length,
    [approvedProjects]
  );

  const filteredProjects = useMemo(() => {
    return localizedProjects
      .filter((project) => {
        // Không hiển thị 17 dự án nổi tiếng mẫu theo yêu cầu
        if (project.isFamous) return false;

        // Chỉ hiển thị bài do người dùng / cộng đồng đăng tải đã duyệt
        if (communityOnly && !project.isUserSubmission) return false;

        // Category / Subject filter (Hỗ trợ đầy đủ các môn học THCS)
        if (filters.category !== 'ALL') {
          const cat = filters.category;
          const subjectAliases: Record<string, string[]> = {
            toan: ['toan', 'math'],
            math: ['toan', 'math'],
            khtn: ['khtn', 'natural_sciences', 'physics', 'chemistry', 'biology', 'vat_ly', 'hoa_hoc', 'sinh_hoc', 'stem', 'khtn_stem'],
            natural_sciences: ['khtn', 'natural_sciences', 'physics', 'chemistry', 'biology', 'vat_ly', 'hoa_hoc', 'sinh_hoc', 'stem', 'khtn_stem'],
            physics: ['physics', 'vat_ly'],
            vat_ly: ['physics', 'vat_ly'],
            chemistry: ['chemistry', 'hoa_hoc'],
            hoa_hoc: ['chemistry', 'hoa_hoc'],
            biology: ['biology', 'sinh_hoc', 'health_medicine'],
            sinh_hoc: ['biology', 'sinh_hoc', 'health_medicine'],
            tin_hoc: ['tin_hoc', 'cong_nghe', 'informatics', 'computer_science', 'tools_utilities'],
            informatics: ['tin_hoc', 'cong_nghe', 'informatics', 'computer_science', 'tools_utilities'],
            cong_nghe: ['tin_hoc', 'cong_nghe', 'informatics', 'computer_science', 'tools_utilities'],
            ngu_van: ['ngu_van', 'literature'],
            literature: ['ngu_van', 'literature'],
            tieng_anh: ['tieng_anh', 'english', 'languages'],
            english: ['tieng_anh', 'english', 'languages'],
            history: ['history', 'geography', 'lich_su', 'dia_li', 'history_society'],
            lich_su: ['history', 'geography', 'lich_su', 'dia_li', 'history_society'],
            dia_li: ['history', 'geography', 'lich_su', 'dia_li', 'history_society'],
            general: ['general', 'khac', 'arts_design', 'gdcd'],
            khac: ['general', 'khac', 'arts_design', 'gdcd'],
          };
          const aliasList = subjectAliases[cat] || [cat];
          const matches = aliasList.some(alias => 
            project.category === alias || 
            (project.tags && project.tags.some(t => t.toLowerCase().includes(alias.toLowerCase())))
          );
          if (!matches) return false;
        }

        // Education Level filter
        if (
          filters.educationLevel !== 'ALL' &&
          project.educationLevel !== filters.educationLevel
        ) {
          return false;
        }

        // Search Query
        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase();
          const matchTitle = project.title.toLowerCase().includes(query);
          const matchDesc = project.description.toLowerCase().includes(query);
          const matchAuthor = project.authorName.toLowerCase().includes(query);
          const matchUrl = project.url.toLowerCase().includes(query);
          const matchTags = project.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );
          if (!matchTitle && !matchDesc && !matchAuthor && !matchUrl && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filters.sortBy === 'most_liked') {
          return b.likes - a.likes;
        }
        if (filters.sortBy === 'most_viewed') {
          return b.views - a.views;
        }
        return 0;
      });
  }, [localizedProjects, filters, communityOnly]);

  const pendingCount = projects.filter((p) => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8FBFF] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => setFilters({ ...filters, searchQuery: query })}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSubmit={handleOpenSubmitNew}
        onOpenGuide={handleOpenGuide}
        showGuide={showGuide}
        pendingCount={pendingCount}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Main Container with Left Sidebar & Right Library */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-3 sm:px-5 lg:px-7 py-4 sm:py-5 flex gap-5 items-start">
        {/* Left Navigation Sidebar (~208–224px desktop) */}
        <Sidebar
          currentCategory={filters.category}
          onSelectCategory={(category) => {
            setFilters({ ...filters, category: category as any });
            if (showGuide) handleExitGuide();
          }}
          showGuide={showGuide}
          onOpenGuide={handleOpenGuide}
          onCloseGuide={handleExitGuide}
          onOpenSubmit={handleOpenSubmitNew}
          lang={lang}
          totalCount={filteredProjects.length}
        />

        {/* Right Simulation Library Area */}
        <div className="flex-1 min-w-0">
          {/* Library Header (Tiêu đề "Mô phỏng nổi bật" + "Xem tất cả →") */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2EDF8]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E2F1FF] text-[#0785F9] flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4 fill-[#0785F9]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0B3B78] tracking-tight">
                  {showGuide ? 'Kiến tạo — Cẩm nang tạo mô phỏng AI' : (filters.category === 'ALL' ? 'Mô phỏng học tập THCS' : 'Mô phỏng theo môn học')}
                </h2>
                <p className="text-xs text-[#58779B]">
                  Cùng thử mô phỏng, khám phá điều hay và chia sẻ ý tưởng học tập!
                </p>
              </div>
            </div>

            {!showGuide && (
              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    category: 'ALL',
                    educationLevel: 'ALL',
                    sortBy: 'newest',
                    onlyFamous: false,
                  })
                }
                className="text-xs font-bold text-[#0785F9] hover:text-[#006FE6] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>Xem tất cả →</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lang={lang}
            totalResults={filteredProjects.length}
          />

          {/* Tab "Hướng dẫn tạo mô phỏng" */}
          {showGuide ? (
            <SimulationGuide
              lang={lang}
              onSubmit={() => {
                handleExitGuide();
                handleOpenSubmitNew();
              }}
            />
          ) : (
            /* Empty State */
            <>
              {filteredProjects.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-[#E2EDF8] p-8 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#E2F1FF] text-[#0785F9] flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#0B3B78] mb-1">
                    {t.noWebsitesFound}
                  </h3>
                  <p className="text-xs text-[#58779B] max-w-sm mx-auto mb-5">
                    {t.emptyStateHint}
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() =>
                        setFilters({
                          searchQuery: '',
                          category: 'ALL',
                          educationLevel: 'ALL',
                          sortBy: 'newest',
                          onlyFamous: false,
                        })
                      }
                      className="px-4 py-2 rounded-xl border border-[#E2EDF8] text-xs font-semibold text-[#23466F] hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {t.clearFilters}
                    </button>
                    <button
                      onClick={handleOpenSubmitNew}
                      className="px-4 py-2 rounded-xl bg-[#0785F9] text-white text-xs font-bold hover:bg-[#006FE6] shadow-xs cursor-pointer transition-colors"
                    >
                      {t.submitWebsite}
                    </button>
                  </div>
                </div>
              ) : (
                /* Render based on View Mode: Expanded (Lưới 4 cột) vs Compact (Rút gọn) */
                <>
                  {viewMode === 'expanded' ? (
                    <div
                      id="projects-expanded-view"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
                    >
                      {filteredProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          lang={lang}
                          isAdmin={isAdmin}
                          onOpenQR={(p) => setSelectedQRProject(p)}
                          onOpenDiscussion={handleOpenDiscussion}
                          onEditProject={handleOpenEditProject}
                          onDeleteRequest={(p) => setProjectToDelete(p)}
                          onLike={handleLike}
                          onVisit={handleVisit}
                        />
                      ))}
                    </div>
                  ) : (
                    <div id="projects-compact-view" className="space-y-2 max-w-4xl">
                      {filteredProjects.map((project) => (
                        <CompactListItem
                          key={project.id}
                          project={project}
                          lang={lang}
                          isAdmin={isAdmin}
                          onOpenQR={(p) => setSelectedQRProject(p)}
                          onOpenDiscussion={handleOpenDiscussion}
                          onEditProject={handleOpenEditProject}
                          onDeleteRequest={(p) => setProjectToDelete(p)}
                          onLike={handleLike}
                          onVisit={handleVisit}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* THÔNG TIN TÁC GIẢ */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-5">
              {t.footerAuthorInfo ?? 'Author Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
              <div className="space-y-1.5 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerAuthorDev ?? 'Author & Development'}:
                  </span>
                  <span className="ml-1.5">Lê Thanh Liêm</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerField ?? 'Field'}:
                  </span>
                  <span className="ml-1.5">
                    {t.footerFieldValue ?? 'Education · STEM · Technology · AI'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerLocation ?? 'Location'}:
                  </span>
                  <span className="ml-1.5">
                    {t.footerLocationValue ?? 'Cần Thơ City, Vietnam'}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-800">
                  {t.footerContact ?? 'Contact'}:
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerEmail ?? 'Email'}:
                  </span>
                  <a
                    href="mailto:ltliem89@gmail.com"
                    className="ml-1.5 text-indigo-600 hover:underline"
                  >
                    ltliem89@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerWorkEmail ?? 'Work Email'}:
                  </span>
                  <a
                    href="mailto:liemlt2@fe.edu.vn"
                    className="ml-1.5 text-indigo-600 hover:underline"
                  >
                    liemlt2@fe.edu.vn
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    {t.footerPhone ?? 'Phone / Zalo / LINE'}:
                  </span>
                  <a
                    href="tel:0978152896"
                    className="ml-1.5 text-indigo-600 hover:underline"
                  >
                    0978152896
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bản quyền */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[13px] font-semibold text-slate-800">
              © {new Date().getFullYear()} Lê Thanh Liêm. All rights reserved.
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {t.footerCopyrightNote ??
                'The design, content and development of this website belong to the author, except for third-party components, libraries, resources or content used under their respective licenses.'}
            </p>
          </div>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        project={selectedQRProject}
        isOpen={!!selectedQRProject}
        onClose={() => setSelectedQRProject(null)}
        lang={lang}
        isAdmin={isAdmin}
        onDownload={(p) => handleDownload(p.id, 'qr')}
        onVisit={(p) => handleVisit(p.id)}
      />

      {/* Website Submission Modal (cũng dùng cho Admin chỉnh sửa bài) */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={handleSubmitNewProject}
        editingProject={editingProject}
        onUpdate={handleUpdateProject}
        lang={lang}
        isAdmin={isAdmin}
      />

      {/* Admin Panel & Moderation Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdmin={isAdmin}
        setIsAdmin={handleSetIsAdmin}
        projects={projects}
        comments={comments}
        onApprove={handleApprove}
        onReject={handleReject}
        onDeleteRequest={(p) => setProjectToDelete(p)}
        onUpdateProject={handleUpdateProject}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onSyncProjects={(syncedProjects) => setProjects(syncedProjects)}
        onRefreshPending={syncPendingFromCloud}
        communityOnly={communityOnly}
        onCommunityOnlyChange={handleCommunityOnlyChange}
        lang={lang}
        onDeleteComment={handleDeleteComment}
        onUpdateComment={handleUpdateComment}
      />

      {/* Discussion & Experience Exchange Hub Modal */}
      {selectedDiscussionProject && (
        <ErrorBoundary
          fallbackTitle="Không thể hiển thị khu vực bình luận"
          onReset={() => setSelectedDiscussionProject(null)}
        >
          <DiscussionHubModal
            project={
              projects.find((p) => p.id === selectedDiscussionProject.id) || selectedDiscussionProject
            }
            isOpen={true}
            onClose={() => setSelectedDiscussionProject(null)}
            comments={comments.filter(
              (c) => c && c.projectId === selectedDiscussionProject.id
            )}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onLikeProject={handleLike}
            onVisitProject={handleVisit}
            onDownloadResource={handleDownload}
            onContributeResource={handleContribute}
            onOpenQR={(p) => setSelectedQRProject(p)}
            lang={lang}
            isAdmin={isAdmin}
            onRefreshComments={() => syncCommentsFromCloud(selectedDiscussionProject.id)}
            isRefreshing={isCommentsSyncing}
            onDeleteComment={handleDeleteComment}
            onDeleteAllProjectComments={handleDeleteAllCommentsForProject}
            onUpdateComment={handleUpdateComment}
          />
        </ErrorBoundary>
      )}

      {/* Delete Confirmation Modal (Admin safety requirement) */}
      <DeleteConfirmModal
        project={projectToDelete}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        lang={lang}
      />
    </div>
  );
}
