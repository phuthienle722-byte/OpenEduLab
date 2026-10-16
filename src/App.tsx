/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FilterState,
  Language,
  LANGUAGE_CODES,
  ViewMode,
  WebProject,
} from './types';
import { INITIAL_PROJECTS } from './data/initialData';
import { localizeProject } from './data/projectLocalizations';
import { translations } from './translations';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { TimelineLayerCard } from './components/TimelineLayerCard';
import { CompactListItem } from './components/CompactListItem';
import { SimulationGuide } from './components/SimulationGuide';
import { QRCodeModal } from './components/QRCodeModal';
import { SubmitModal } from './components/SubmitModal';
import { AdminModal } from './components/AdminModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
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
} from './services/googleSync';
import {
  isCommunityApprovedOnly,
  setCommunityApprovedOnly,
} from './config';

const STORAGE_KEY_PROJECTS = 'webhub_projects_data_v3';
const STORAGE_KEY_LANG = 'webhub_language_preference';
const STORAGE_KEY_ADMIN = 'webhub_admin_session';

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
      return {
        ...p,
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
): WebProject => ({
  ...cloud,
  views: Math.max(local.views, cloud.views),
  likes: Math.max(local.likes, cloud.likes),
  isFamous: local.isFamous === true || cloud.isFamous === true,
  isUserSubmission:
    local.isUserSubmission === true || cloud.isUserSubmission === true,
});

export default function App() {
  // 1. Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    // TrĂ¡nh giĂ¡ trá»‹ cÅ© (ja/fr) khĂ´ng cĂ²n Ä‘Æ°á»£c há»— trá»£ â†’ quay vá» tiáº¿ng Viá»‡t
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

  // Biáº¿n kiá»ƒm soĂ¡t cháº¿ Ä‘á»™ cá»™ng Ä‘á»“ng: tab "BĂ i Ä‘Äƒng táº£i" chá»‰ hiá»ƒn thá»‹ bĂ i admin duyá»‡t
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
                  // Giá»¯ nguyĂªn tráº¡ng thĂ¡i (approved / pending / rejected) khi táº£i láº¡i
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

  // Theo dĂµi cĂ¡c thay Ä‘á»•i Views/Likes cá»¥c bá»™ chÆ°a ká»‹p Ä‘á»“ng bá»™ lĂªn Google Sheets.
  const statsDirtyRef = useRef<Map<string, { views: number; likes: number }>>(new Map());
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
      const items = Array.from(dirty.entries()).map(([projectId, s]) => ({
        projectId,
        views: s.views,
        likes: s.likes,
      }));
      updateStatsInSheet(scriptUrl, items);
    }
    dirty.clear();
  }, []);

  // Gá»™p cĂ¡c thay Ä‘á»•i stats vĂ  gá»­i lĂªn Sheets sau 4 giĂ¢y trá»… (debounce)
  const markStatsDirty = useCallback(
    (id: string, views: number, likes: number) => {
      const prev = statsDirtyRef.current.get(id) || { views: 0, likes: 0 };
      statsDirtyRef.current.set(id, {
        views: Math.max(prev.views, views),
        likes: Math.max(prev.likes, likes),
      });
      if (statsTimerRef.current !== null) window.clearTimeout(statsTimerRef.current);
      statsTimerRef.current = window.setTimeout(flushStatsSync, 4000);
    },
    [flushStatsSync]
  );

  // Dá»n dáº¹p timer vĂ  Ä‘áº©y stats cĂ²n dang dá»Ÿ khi Ä‘Ă³ng trang
  useEffect(() => {
    const flushOnUnload = () => {
      const dirty = statsDirtyRef.current;
      if (dirty.size === 0) return;
      const scriptUrl = getStoredScriptUrl();
      if (!scriptUrl || !isAutoSyncEnabled()) return;
      const items = Array.from(dirty.entries()).map(([projectId, s]) => ({
        projectId,
        views: s.views,
        likes: s.likes,
      }));
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
      Promise.allSettled([syncApprovedPromise, syncPendingPromise]).finally(() => {
        setIsCloudSyncing(false);
      });
    }
  }, [syncPendingFromCloud]);

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
                  views: Math.max(cp.views, dirty.views),
                  likes: Math.max(cp.likes, dirty.likes),
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
    };

    pollApproved();
    const interval = setInterval(pollApproved, 45000);
    return () => clearInterval(interval);
  }, []);

  // 6. Action Handlers
  const handleLike = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, likes: p.likes + 1 } : p))
    );
    const p = projects.find((x) => x.id === projectId);
    if (p) markStatsDirty(projectId, p.views, p.likes + 1);
  };

  const handleVisit = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, views: p.views + 1 } : p))
    );
    const p = projects.find((x) => x.id === projectId);
    if (p) markStatsDirty(projectId, p.views + 1, p.likes);
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
        // Náº¿u ngÆ°á»i dĂ¹ng báº­t nĂºt "Ná»•i tiáº¿ng": hiá»ƒn thá»‹ cĂ¡c mĂ´ phá»ng ná»•i tiáº¿ng (PhET, GeoGebra, NetSim...)
        // Máº·c Ä‘á»‹nh: hiá»ƒn thá»‹ cĂ¡c bĂ i do admin duyá»‡t (tab "BĂ i Ä‘Äƒng táº£i" - cháº¿ Ä‘á»™ cá»™ng Ä‘á»“ng)
        if (filters.onlyFamous) {
          if (!project.isFamous) return false;
        } else {
          if (project.isFamous) return false;
          // BIáº¾N KIá»‚M SOĂT Cá»˜NG Äá»’NG: náº¿u báº­t, chá»‰ hiá»‡n bĂ i ngÆ°á»i dĂ¹ng Ä‘Äƒng Ä‘Ă£ duyá»‡t,
          // má»i bĂ i máº«u (khĂ´ng pháº£i ná»•i tiáº¿ng) Ä‘á»u bá»‹ áº©n khá»i tab "BĂ i Ä‘Äƒng táº£i".
          if (communityOnly && !project.isUserSubmission) return false;
        }

        // Category / Subject filter
        if (filters.category !== 'ALL') {
          const cat = filters.category;
          const subjectAliases: Record<string, string[]> = {
            toan: ['toan', 'math'],
            vat_ly: ['vat_ly', 'physics', 'stem'],
            hoa_hoc: ['hoa_hoc', 'chemistry'],
            sinh_hoc: ['sinh_hoc', 'biology', 'health_medicine'],
            tin_hoc: ['tin_hoc', 'informatics', 'computer_science'],
            ngu_van: ['ngu_van', 'literature'],
            tieng_anh: ['tieng_anh', 'english', 'languages'],
            lich_su: ['lich_su', 'history', 'history_society'],
            dia_li: ['dia_li', 'geography'],
            khtn_stem: ['khtn_stem', 'stem', 'natural_sciences'],
            cong_nghe: ['cong_nghe', 'tools_utilities'],
            khac: ['khac', 'general', 'arts_design'],
          };
          const matches = (subjectAliases[cat] || [cat]).includes(project.category);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => setFilters({ ...filters, searchQuery: query })}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSubmit={handleOpenSubmitNew}
        pendingCount={pendingCount}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Streamlined Banner Hero */}
        <StatsBanner
          projects={projects}
          lang={lang}
          onOpenSubmit={handleOpenSubmitNew}
        />

        {/* Filter and View Mode Switcher */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          lang={lang}
          totalResults={filteredProjects.length}
          approvedCount={defaultApprovedCount}
          famousCount={famousCount}
          onOpenSubmit={handleOpenSubmitNew}
          showGuide={showGuide}
          onOpenGuide={handleOpenGuide}
          onCloseGuide={handleExitGuide}
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
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {t.noWebsitesFound}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
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
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t.clearFilters}
              </button>
              <button
                onClick={handleOpenSubmitNew}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
              >
                {t.submitWebsite}
              </button>
            </div>
          </div>
        ) : (
          /* Render based on View Mode: Expanded (Äáº§y Ä‘á»§ mockup, QR, mĂ´ táº£) vs Compact (Chá»‰ TĂªn & LÄ©nh vá»±c) */
          <>
            {viewMode === 'expanded' ? (
              <div
                id="projects-expanded-view"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    lang={lang}
                    isAdmin={isAdmin}
                    onOpenQR={(p) => setSelectedQRProject(p)}
                    onEditProject={handleOpenEditProject}
                    onDeleteRequest={(p) => setProjectToDelete(p)}
                    onLike={handleLike}
                    onVisit={handleVisit}
                  />
                ))}
              </div>
            ) : (
              <div id="projects-compact-view" className="space-y-2 max-w-4xl mx-auto">
                {filteredProjects.map((project) => (
                  <CompactListItem
                    key={project.id}
                    project={project}
                    lang={lang}
                    isAdmin={isAdmin}
                    onOpenQR={(p) => setSelectedQRProject(p)}
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
      />

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
