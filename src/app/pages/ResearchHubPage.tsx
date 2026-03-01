import { useState, useMemo } from 'react';
import { Plus, Search, FlaskConical, Users, BookOpen, Handshake, ShieldCheck, Lightbulb, TrendingUp, Trophy, Star } from 'lucide-react';
import { ResearchRequest, ResearchType } from '../types';
import { ResearchCard } from '../components/ResearchCard';
import { PublicationCard } from '../components/PublicationCard';
import { PostResearchModal } from '../components/PostResearchModal';
import { PostPublicationModal } from '../components/PostPublicationModal';
import { toast } from 'sonner';

// ── Seed data ──────────────────────────────────────────────────────────────────
const now = Date.now();
const ago = (ms: number) => new Date(now - ms).toISOString();

const SEED_RESEARCH: ResearchRequest[] = [
  // ── Variation D: Publication Showcase ────────────────────────────────────────
  {
    id: 'research-seed-pub-1',
    type: 'PUBLICATION',
    title: 'Just published: A novel approach to defending against zero-day IoT exploits',
    abstract:
      'This paper presents a real-time machine learning defense system for detecting and neutralizing zero-day attacks targeting IoT firmware. Evaluated on 3 consumer device classes with 98.4% detection rate at sub-10ms latency.',
    researcherName: 'Kai Nakamura',
    department: 'Cybersecurity',
    tags: ['Published', 'Showcase', 'Cybersecurity', 'Capstone'],
    compensation: { type: 'AUTHORSHIP' },
    irbApproved: false,
    location: 'VIRTUAL',
    createdAt: ago(3 * 3600_000),
    aiSummary:
      "We found a new way to stop hackers from taking over smart-home devices like your speaker or doorbell, even from brand-new tricks they've never used before. We trained a computer to spot dangerous patterns super fast — like a guard dog that never sleeps — so your devices stay safe without you doing anything.",
    paperUrl: 'https://arxiv.org/',
    venue: 'IEEE S&P 2025',
    congratulations: 14,
  },
  {
    id: 'research-seed-pub-2',
    type: 'PUBLICATION',
    title: 'Adaptive UI scaffolding for screen-reader users: a CHI 2025 study',
    abstract:
      'We designed and evaluated a dynamic UI scaffolding framework that automatically restructures web layouts to optimize screen-reader navigation efficiency. A/B testing with 30 blind participants showed a 42% reduction in task completion time.',
    researcherName: 'Leila Hassan',
    department: 'HCI / iSchool',
    tags: ['Published', 'Showcase', 'HCI', 'Accessibility'],
    compensation: { type: 'AUTHORSHIP' },
    irbApproved: false,
    location: 'VIRTUAL',
    createdAt: ago(2 * 86400_000),
    aiSummary:
      "We built a smarter website layout that automatically reorganizes itself to be much easier to navigate for people who are blind and use a computer voice to browse. By testing it with 30 real users, we proved it cuts down the time it takes to finish tasks by nearly half.",
    paperUrl: 'https://dl.acm.org/',
    venue: 'CHI 2025',
    congratulations: 31,
  },

  // ── Variation A: Study Participants ──────────────────────────────────────────
  {
    id: 'research-seed-1',
    type: 'PARTICIPANTS',
    title: 'Need 20 left-handed students for eye-tracking study',
    abstract:
      'We are conducting a cognitive psychology experiment investigating reading patterns and saccadic movements in left-handed individuals. The study involves 30 minutes of eye-tracking tasks on a calibrated monitor. No prior experience needed.',
    researcherName: 'Dr. Sarah Hoffman',
    department: 'Psychology',
    tags: ['Eye Tracking', 'Cognitive Science', 'Psychology'],
    compensation: { type: 'CREDITS', credits: 50 },
    irbApproved: true,
    location: 'IN_PERSON',
    participantsNeeded: 20,
    createdAt: ago(2 * 3600_000),
  },
  {
    id: 'research-seed-4',
    type: 'PARTICIPANTS',
    title: 'Online survey: stress & academic performance in co-op students',
    abstract:
      'Quick 15-minute Qualtrics survey examining the relationship between stress levels and academic performance during co-op terms. All RIT students with at least one co-op experience are eligible.',
    researcherName: 'Jordan Kim',
    department: 'Psychology / COLA',
    tags: ['Survey', 'Co-op', 'Quantitative'],
    compensation: { type: 'CREDITS', credits: 15 },
    irbApproved: true,
    location: 'VIRTUAL',
    participantsNeeded: 100,
    createdAt: ago(8 * 3600_000),
  },

  // ── Variation B: Peer Review ──────────────────────────────────────────────────
  {
    id: 'research-seed-2',
    type: 'PEER_REVIEW',
    title: 'Seeking a second set of eyes on my CHI conference paper draft',
    abstract:
      'I am submitting to CHI 2026 and need a peer reviewer familiar with HCI or accessibility research. Paper is ~8 pages on adaptive UI for screen-reader users. Looking for constructive feedback on methodology and clarity of contribution.',
    researcherName: 'Marcus Chen',
    department: 'HCI / iSchool',
    tags: ['HCI', 'Accessibility', 'Publication'],
    compensation: { type: 'CREDITS', credits: 30 },
    irbApproved: false,
    location: 'VIRTUAL',
    createdAt: ago(5 * 3600_000),
  },
  {
    id: 'research-seed-5',
    type: 'PEER_REVIEW',
    title: 'Review needed for undergraduate thesis on NLP sentiment analysis',
    abstract:
      'Completed my thesis on multilingual sentiment analysis using transformer models. Looking for someone in CS or linguistics to review the related work and experimental sections before my final submission. Should take about 1–1.5 hours.',
    researcherName: 'Alex Rivera',
    department: 'Computer Science',
    tags: ['NLP', 'Peer Review', 'Thesis'],
    compensation: { type: 'CREDITS', credits: 40 },
    irbApproved: false,
    location: 'VIRTUAL',
    createdAt: ago(2 * 86400_000),
  },

  // ── Variation C: Collaboration ─────────────────────────────────────────────
  {
    id: 'research-seed-3',
    type: 'COLLABORATION',
    title: 'Looking for an ML student to help train a model on dataset for capstone',
    abstract:
      'My capstone involves training a classification model on a custom plant disease dataset (~12k images). I have the dataset and domain knowledge but need someone strong in PyTorch or TensorFlow to help with model architecture and training pipeline. Long-term collab with co-authorship.',
    researcherName: 'Priya Nair',
    department: 'Bioinformatics',
    tags: ['Machine Learning', 'Computer Vision', 'Capstone'],
    compensation: { type: 'AUTHORSHIP' },
    irbApproved: false,
    location: 'FLEXIBLE',
    createdAt: ago(1 * 86400_000),
  },
  {
    id: 'research-seed-6',
    type: 'COLLABORATION',
    title: 'Seeking a statistics / R expert to co-author a social science study',
    abstract:
      "I'm studying the effect of remote learning on student engagement in liberal arts courses. Data is collected — I need someone who can run the mixed-effects regression analysis in R and help interpret results. Targeting a publication in an education journal.",
    researcherName: 'Taylor Brooks',
    department: 'Sociology / COLA',
    tags: ['Statistics', 'Research Collaboration', 'Education'],
    compensation: { type: 'AUTHORSHIP' },
    irbApproved: true,
    location: 'FLEXIBLE',
    createdAt: ago(3 * 86400_000),
  },
];

// ── Filter config ──────────────────────────────────────────────────────────────
const FILTERS: {
  value: ResearchType | 'ALL';
  label: string;
  icon: React.ReactNode;
  activeStyle: React.CSSProperties;
}[] = [
  { value: 'ALL',           label: 'All',              icon: <FlaskConical className="w-3.5 h-3.5" />, activeStyle: { background: '#1C1C1E' } },
  { value: 'PARTICIPANTS',  label: 'Study Participants',icon: <Users className="w-3.5 h-3.5" />,       activeStyle: { background: '#7c3aed' } },
  { value: 'PEER_REVIEW',   label: 'Peer Review',      icon: <BookOpen className="w-3.5 h-3.5" />,    activeStyle: { background: '#2563eb' } },
  { value: 'COLLABORATION', label: 'Collaboration',    icon: <Handshake className="w-3.5 h-3.5" />,   activeStyle: { background: '#F76902' } },
  {
    value: 'PUBLICATION', label: 'Showcase',
    icon: <Star className="w-3.5 h-3.5" />,
    activeStyle: { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  },
];

export function ResearchHubPage() {
  const [filter, setFilter]           = useState<ResearchType | 'ALL'>('ALL');
  const [search, setSearch]           = useState('');
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [pubModalOpen, setPubModalOpen]           = useState(false);
  const [requests, setRequests]       = useState<ResearchRequest[]>(SEED_RESEARCH);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (filter !== 'ALL' && r.type !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.abstract.toLowerCase().includes(q) ||
          r.researcherName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [requests, filter, search]);

  const handlePublish    = (req: ResearchRequest) => setRequests(prev => [req, ...prev]);

  const handleCardAction = (req: ResearchRequest) => {
    const messages: Record<ResearchType, string> = {
      PARTICIPANTS:  `You've signed up for "${req.title.slice(0, 45)}…"! The researcher will contact you soon.`,
      PEER_REVIEW:   `Review request sent! Check your RIT email for details.`,
      COLLABORATION: `Message sent to ${req.researcherName}! They'll reach out to discuss collaboration.`,
      PUBLICATION:   ``,
    };
    toast.success(messages[req.type]);
  };

  // Stats
  const pubCount   = requests.filter(r => r.type === 'PUBLICATION').length;
  const partCount  = requests.filter(r => r.type === 'PARTICIPANTS').length;
  const prCount    = requests.filter(r => r.type === 'PEER_REVIEW').length;
  const colabCount = requests.filter(r => r.type === 'COLLABORATION').length;
  const irbCount   = requests.filter(r => r.irbApproved).length;

  return (
    <>
      <div className="min-h-screen bg-[#F8F8FA]">

        {/* ── Hero banner ──────────────────────────────────────────────────────── */}
        <div className="bg-[#1C1C1E] border-b border-[#2C2C2E]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <FlaskConical className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-violet-400 border border-violet-800 bg-violet-900/30 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                    Research Hub
                  </span>
                </div>
                <h1 className="text-white" style={{ fontWeight: 700, fontSize: '1.4rem' }}>
                  🔬 RIT Research Hub
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Find participants, reviewers & collaborators — or showcase your published work.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Showcase Paper (amber) */}
                <button
                  onClick={() => setPubModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 600, boxShadow: '0 8px 20px rgba(245,158,11,0.35)' }}
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Showcase Paper</span>
                  <span className="sm:hidden">Showcase</span>
                </button>
                {/* Post Request (violet→orange) */}
                <button
                  onClick={() => setResearchModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white hover:opacity-90 transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #F76902)', fontWeight: 600, boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Post Research Request</span>
                  <span className="sm:hidden">Post Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Main content ──────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Filter tabs */}
              <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1 mb-4 shadow-sm overflow-x-auto">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      filter === f.value
                        ? 'text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    style={filter === f.value ? { ...f.activeStyle, fontWeight: 700 } : { fontWeight: 500 }}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                    {f.value !== 'ALL' && (
                      <span
                        className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs"
                        style={
                          filter === f.value
                            ? { background: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }
                            : { background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }
                        }
                      >
                        {f.value === 'PUBLICATION'  ? pubCount
                         : f.value === 'PARTICIPANTS' ? partCount
                         : f.value === 'PEER_REVIEW'  ? prCount
                         : colabCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, researcher, field, or tag..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                />
              </div>

              {/* Cards grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-3">🔬</div>
                  <p className="text-gray-500" style={{ fontWeight: 500 }}>No research requests found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? 'Try a different search term' : 'Be the first to post on this board!'}
                  </p>
                  <button
                    onClick={() => setResearchModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl text-white text-sm transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #F76902)', fontWeight: 600 }}
                  >
                    Post Research Request
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map(req =>
                    req.type === 'PUBLICATION' ? (
                      <PublicationCard key={req.id} request={req} />
                    ) : (
                      <ResearchCard key={req.id} request={req} onAction={handleCardAction} />
                    )
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ────────────────────────────────────────────────────────── */}
            <div className="w-full lg:w-72 space-y-4 flex-shrink-0">

              {/* Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  Research Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '⭐ Published Papers',    value: pubCount,   color: 'text-amber-600'  },
                    { label: '🧪 Study Participants',  value: partCount,  color: 'text-violet-600' },
                    { label: '📝 Peer Reviews',        value: prCount,    color: 'text-blue-600'   },
                    { label: '🤝 Collaborations',      value: colabCount, color: 'text-[#F76902]'  },
                    { label: '🛡️ IRB-Approved Studies', value: irbCount,   color: 'text-emerald-600'},
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{s.label}</span>
                      <span className={`text-sm ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend: card types */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>Card Types</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: '⭐', label: 'Publication Showcase', desc: 'Share your published paper + AI TL;DR', color: 'border-l-amber-400 bg-amber-50/60' },
                    { icon: '🧪', label: 'Study Participants',   desc: 'Recruit students, earn rewards',         color: 'border-l-violet-500 bg-violet-50/60' },
                    { icon: '📝', label: 'Peer Review',          desc: 'Review papers & get credits',           color: 'border-l-blue-500 bg-blue-50/60' },
                    { icon: '🤝', label: 'Collaboration',        desc: 'Co-author or research together',        color: 'border-l-[#F76902] bg-orange-50/60' },
                  ].map(t => (
                    <div key={t.label} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border-l-4 ${t.color}`}>
                      <span className="text-base flex-shrink-0">{t.icon}</span>
                      <div>
                        <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IRB Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>IRB & Research Ethics</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Studies involving human subjects require IRB approval from RIT's Institutional Review Board before recruiting participants.
                </p>
                <a
                  href="https://www.rit.edu/research/hsro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-violet-600 hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  RIT IRB Office →
                </a>
              </div>

              {/* Tips */}
              <div className="rounded-xl border p-4" style={{ background: 'linear-gradient(135deg, #7c3aed08, #F7690208)', borderColor: '#7c3aed20' }}>
                <p className="text-sm mb-2 flex items-center gap-1.5" style={{ fontWeight: 700, color: '#7c3aed' }}>
                  <Lightbulb className="w-4 h-4" />
                  Research Tips
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• Upload a PDF for a richer AI TL;DR on your showcase card</li>
                  <li>• Include time commitment so participants can plan ahead</li>
                  <li>• Get IRB approval before posting participant studies</li>
                  <li>• Be clear about co-authorship terms upfront</li>
                  <li>• Use the AI appraiser to set fair TigerCredit rewards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PostResearchModal
        open={researchModalOpen}
        onClose={() => setResearchModalOpen(false)}
        onPublish={handlePublish}
      />
      <PostPublicationModal
        open={pubModalOpen}
        onClose={() => setPubModalOpen(false)}
        onPublish={handlePublish}
      />
    </>
  );
}
