import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  GitBranch,
  Globe,
  MessageSquareText,
  Sparkles,
  Target,
  UploadCloud,
  Wand2,
  Wrench,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { RocketFlying } from './RocketFlying';

interface SimulationGuideProps {
  lang: Language;
  onSubmit: () => void;
}

interface GuideStep {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  images?: { src: string; alt: string }[];
  extra?: React.ReactNode;
}

const GUIDE_FILE = 'SIMBOT_UNIVERSAL_PROMPT_GUIDE_V24.md';

export const SimulationGuide: React.FC<SimulationGuideProps> = ({ lang, onSubmit }) => {
  const t = translations[lang];

  const gitSteps = [t.guideGit1, t.guideGit2, t.guideGit3, t.guideGit4, t.guideGit5];

  // Mục con "Tải Prompt Guide" nằm trong Bước 3
  const downloadExtra = (
    <div className="mt-3 rounded-xl bg-white border border-emerald-200 p-3.5">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Download className="w-3.5 h-3.5" />
        </div>
        <h5 className="text-xs font-extrabold text-slate-900">{t.guideDownloadTitle}</h5>
      </div>
      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mb-3">{t.guideDownloadDesc}</p>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
        <p className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 mb-2">
          SimBot Universal Prompt Guide v24
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={'/' + GUIDE_FILE}
            download={GUIDE_FILE}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.guideDownloadBtn}</span>
          </a>
          <a
            href={'/' + GUIDE_FILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">SIMBOT_V24.md</span>
          </a>
        </div>
      </div>
    </div>
  );

  // Chi tiết lồng ghép vào đúng bước (Bước 7 = GitHub, Bước 8 = Vercel)
  const githubExtra = (
    <ol className="mt-3 space-y-2">
      {gitSteps.slice(0, 3).map((step, idx) => (
        <li key={idx} className="flex items-start space-x-2.5">
          <span className="w-5 h-5 rounded-md bg-orange-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
            {idx + 1}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );

  const vercelExtra = (
    <ol className="mt-3 space-y-2">
      {gitSteps.slice(3).map((step, idx) => (
        <li key={idx} className="flex items-start space-x-2.5">
          <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
            {idx + 4}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );

  const steps: GuideStep[] = [
    {
      title: t.guideStep1T,
      desc: t.guideStep1D,
      icon: <Target className="w-4 h-4" />,
      accent: 'bg-indigo-600 text-white',
    },
    {
      title: t.guideStep2T,
      desc: t.guideStep2D,
      icon: <MessageSquareText className="w-4 h-4" />,
      accent: 'bg-violet-600 text-white',
    },
    {
      title: t.guideStep3T,
      desc: t.guideStep3D,
      icon: <FileText className="w-4 h-4" />,
      accent: 'bg-emerald-600 text-white',
      extra: downloadExtra,
    },
    {
      title: t.guideStep4T,
      desc: t.guideStep4D,
      icon: <Wand2 className="w-4 h-4" />,
      accent: 'bg-amber-500 text-white',
      images: [{ src: '/PMCA_Show_Share_2026/guide-5-empower-ai.png', alt: t.guideStep4T }],
    },
    {
      title: t.guideStep5T,
      desc: t.guideStep5D,
      icon: <Wrench className="w-4 h-4" />,
      accent: 'bg-rose-500 text-white',
      images: [{ src: '/PMCA_Show_Share_2026/guide-6-ai-studio.png', alt: t.guideStep5T }],
    },
    {
      title: t.guideStep6T,
      desc: t.guideStep6D,
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: 'bg-teal-600 text-white',
      images: [{ src: '/PMCA_Show_Share_2026/guide-6-test.png', alt: t.guideStep6T }],
    },
    {
      title: t.guideStep7T,
      desc: t.guideStep7D,
      icon: <GitBranch className="w-4 h-4" />,
      accent: 'bg-orange-500 text-white',
      extra: githubExtra,
      images: [{ src: '/PMCA_Show_Share_2026/guide-hd6-github.png', alt: t.guideStep7T }],
    },
    {
      title: t.guideStep8T,
      desc: t.guideStep8D,
      icon: <RocketFlying className="w-4 h-4" />,
      accent: 'bg-sky-600 text-white',
      extra: vercelExtra,
      images: [{ src: '/PMCA_Show_Share_2026/guide-hd7-vercel.png', alt: t.guideStep8T }],
    },
  ];

  const criteria = [
    t.guideCriterion1,
    t.guideCriterion2,
    t.guideCriterion3,
    t.guideCriterion4,
    t.guideCriterion5,
    t.guideCriterion6,
    t.guideCriterion7,
  ];

  const tools = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      name: t.guideToolStudio,
      desc: t.guideToolStudioDesc,
      url: 'https://aistudio.google.com',
      signup: t.guideToolStudioSignup,
      login: t.guideToolStudioLogin,
      accent: 'bg-violet-50 text-violet-600 border-violet-200',
    },
    {
      icon: <GitBranch className="w-5 h-5" />,
      name: t.guideToolGit,
      desc: t.guideToolGitDesc,
      url: 'https://github.com',
      signup: t.guideToolGitSignup,
      login: t.guideToolGitLogin,
      accent: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    {
      icon: <RocketFlying className="w-5 h-5" />,
      name: t.guideToolVercel,
      desc: t.guideToolVercelDesc,
      url: 'https://vercel.com',
      signup: t.guideToolVercelSignup,
      login: t.guideToolVercelLogin,
      accent: 'bg-sky-50 text-sky-600 border-sky-200',
    },
  ];

  return (
    <div id="simulation-guide" className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 mb-5">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {t.guideTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
              {t.guideIntro}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <span
                  key={idx}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-[10px] sm:text-xs font-extrabold"
                >
                  {idx + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tiêu chí của một sản phẩm học tập tốt */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 mb-5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{t.guideCriterionTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {criteria.map((c, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-700 leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline 8 bước */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 mb-5">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{t.guideTitle}</h3>
        </div>

        <div className="relative space-y-4 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative flex items-start space-x-3.5 pl-0">
              <div
                className={`w-8 h-8 rounded-xl ${step.accent} flex items-center justify-center shadow-sm shrink-0 relative z-10`}
              >
                {step.icon}
              </div>
              <div className="flex-1 min-w-0 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-[10px] font-extrabold text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>

                {step.extra && <div className="mt-3">{step.extra}</div>}

                {step.images && step.images.length > 0 && (
                  <div
                    className={`mt-3 grid gap-2.5 ${step.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'}`}
                  >
                    {step.images.map((img) => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="w-full h-36 sm:h-40 object-contain rounded-lg border border-slate-200 bg-white p-1"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools journey Studio -> GitHub -> Vercel */}
      <div
        id="guide-tools"
        className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-5 sm:p-7 mb-5"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold tracking-tight">{t.guideToolsTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">{t.guideToolsDesc}</p>

        <div className="flex items-start space-x-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 p-3.5 mb-4">
          <CheckCircle2 className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">{t.guideAccountNote}</p>
        </div>

        <div className="space-y-4">
          {tools.map((tool) => (
            <div key={tool.name} className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4 sm:p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${tool.accent}`}
                >
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{tool.url}</p>
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.guideToolOpenSite}</span>
                </a>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">{tool.desc}</p>

              <div className="space-y-2">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wide">
                      {t.guideToolSignupLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-300 leading-relaxed block">
                      {tool.signup}
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                      {t.guideToolLoginLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-300 leading-relaxed block">
                      {tool.login}
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                      {t.guideToolUseLabel}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-300 leading-relaxed block">
                      {tool.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2">
          {[t.guideToolStudio, t.guideToolGit, t.guideToolVercel].map((label, idx) => (
            <React.Fragment key={label}>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 text-slate-300 border border-slate-700">
                {idx === 0 ? (
                  <Sparkles className="w-3 h-3 text-violet-300" />
                ) : idx === 1 ? (
                  <GitBranch className="w-3 h-3 text-slate-300" />
                ) : (
                  <RocketFlying className="w-3 h-3 text-sky-300" />
                )}
                <span>{label}</span>
              </span>
              {idx < 2 && <span className="text-slate-600 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Share on this website */}
      <div
        id="guide-share"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 mb-5"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{t.guideUploadSiteTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">{t.guideUploadSiteDesc}</p>
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm shadow-slate-500/20 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t.guideUploadSiteBtn}</span>
        </button>
      </div>

      {/* Final note */}
      <div className="mt-5 flex items-center justify-center text-[11px] sm:text-xs text-slate-500 text-center px-4">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
        <span>{t.guideTitle}</span>
      </div>
    </div>
  );
};