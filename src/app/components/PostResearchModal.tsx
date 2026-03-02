import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, AlertTriangle, ChevronLeft, CheckCircle, FlaskConical } from 'lucide-react';
import { ResearchType, ResearchRequest, ResearchAppraisalResult } from '../types';
import { appraiseResearch } from '../services/researchAppraiser';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

interface PostResearchModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (request: ResearchRequest) => void;
}

type Step = 'compose' | 'loading' | 'result';

const TYPE_OPTIONS: { value: ResearchType; label: string; icon: string; desc: string }[] = [
  { value: 'PARTICIPANTS', icon: '🧪', label: 'Study Participants',  desc: 'Recruiting people to participate in your study' },
  { value: 'PEER_REVIEW',  icon: '📝', label: 'Peer Review',         desc: 'Getting feedback on your paper or draft' },
  { value: 'COLLABORATION',icon: '🤝', label: 'Co-Researcher',       desc: 'Finding a collaborator or co-author' },
];

const LOCATION_OPTIONS = [
  { value: 'IN_PERSON', label: '📍 In-Person' },
  { value: 'VIRTUAL',   label: '💻 Virtual'   },
  { value: 'FLEXIBLE',  label: '🔄 Flexible'  },
] as const;

export function PostResearchModal({ open, onClose, onPublish }: PostResearchModalProps) {
  const { currentUser } = useApp();

  const [step, setStep]               = useState<Step>('compose');
  const [type, setType]               = useState<ResearchType>('PARTICIPANTS');
  const [title, setTitle]             = useState('');
  const [abstract, setAbstract]       = useState('');
  const [department, setDepartment]   = useState('');
  const [irbApproved, setIrbApproved] = useState(false);
  const [location, setLocation]       = useState<'IN_PERSON' | 'VIRTUAL' | 'FLEXIBLE'>('VIRTUAL');
  const [participants, setParticipants] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [paperFile, setPaperFile]     = useState<File | null>(null);
  const [appraisal, setAppraisal]     = useState<ResearchAppraisalResult | null>(null);
  const [credits, setCredits]         = useState(30);
  const [fallback, setFallback]       = useState(false);

  const reset = () => {
    setStep('compose'); setType('PARTICIPANTS'); setTitle(''); setAbstract('');
    setDepartment(''); setIrbApproved(false); setLocation('VIRTUAL'); setParticipants('');
    setRegistrationLink(''); setPaperFile(null);
    setAppraisal(null); setCredits(30); setFallback(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const canAppraise = title.trim().length >= 5 && abstract.trim().length >= 20;

  const handleAppraise = async () => {
    if (!canAppraise) {
      toast.error('Please fill in a title and at least 20 characters of abstract.');
      return;
    }
    setStep('loading');
    const result = await appraiseResearch(type, title, abstract);
    if (result) {
      setAppraisal(result);
      setCredits(result.credits);
      setFallback(false);
    } else {
      setAppraisal(null);
      setFallback(true);
    }
    setStep('result');
  };

  const handlePublish = () => {
    const tags = appraisal?.tags ?? ['Research', 'RIT', type === 'PARTICIPANTS' ? 'User Study' : type === 'PEER_REVIEW' ? 'Peer Review' : 'Collaboration'];
    const compensation =
      type === 'COLLABORATION'
        ? { type: 'AUTHORSHIP' as const }
        : credits === 0
          ? { type: 'CREDITS' as const, credits: 0 }
          : { type: 'CREDITS' as const, credits };

    const newRequest: ResearchRequest = {
      id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title: title.trim(),
      abstract: abstract.trim(),
      researcherName: currentUser?.name ?? 'Anonymous Researcher',
      department: department.trim() || 'RIT',
      tags,
      compensation,
      irbApproved,
      location,
      registrationLink: type === 'PARTICIPANTS' && registrationLink.trim() ? registrationLink.trim() : undefined,
      paperFileName: type === 'PEER_REVIEW' && paperFile ? paperFile.name : undefined,
      participantsNeeded: type === 'PARTICIPANTS' && participants ? Number(participants) : undefined,
      createdAt: new Date().toISOString(),
    };

    onPublish(newRequest);
    toast.success('Research request published to the Hub! 🔬');
    handleClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[92vh] overflow-y-auto"
          aria-describedby="post-research-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              {step === 'result' && (
                <button
                  onClick={() => setStep('compose')}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mr-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {/* Icon with subtle gradient */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                  Publish Research Request
                </Dialog.Title>
                <p id="post-research-desc" className="text-xs text-gray-400">
                  {step === 'compose' && 'Share your research need with the RIT community'}
                  {step === 'loading' && 'AI is evaluating your research request...'}
                  {step === 'result' && (fallback ? 'Set reward manually' : 'Review AI reward suggestion')}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Step: Compose ─────────────────────────────────────────────────────── */}
          {step === 'compose' && (
            <div className="p-6 space-y-5">

              {/* Type of Request */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Type of Request
                </label>
                <div className="space-y-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        type === opt.value
                          ? 'border-[#F76902] bg-[#F76902]/5 ring-2 ring-[#F76902]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                      <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                        type === opt.value ? 'border-[#F76902] bg-[#F76902]' : 'border-gray-300'
                      }`}>
                        {type === opt.value && <div className="w-full h-full rounded-full scale-50 bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={
                    type === 'PARTICIPANTS' ? 'e.g. Eye-tracking study on reading patterns in left-handed students'
                    : type === 'PEER_REVIEW'  ? 'e.g. Seeking peer reviewer for my CHI 2026 paper draft'
                    : 'e.g. Looking for ML collaborator for capstone project on NLP'
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
              </div>

              {/* Abstract / Details */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Abstract / Details
                </label>
                <textarea
                  value={abstract}
                  onChange={e => setAbstract(e.target.value)}
                  rows={4}
                  placeholder="Describe your research project, what you need from participants/reviewers/collaborators, time commitment, and any prerequisites..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">More detail = better AI reward suggestion</p>
                  <p className={`text-xs ${abstract.length >= 20 ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {abstract.length} chars
                  </p>
                </div>
              </div>

              {/* Department + Location row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                    Department <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. CS, Psychology"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Format</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value as typeof location)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                  >
                    {LOCATION_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Participants needed (only for PARTICIPANTS type) */}
              {type === 'PARTICIPANTS' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                    Participants Needed <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={participants}
                    onChange={e => setParticipants(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                  />
                </div>
              )}

              {/* Registration Link (only for PARTICIPANTS type) */}
              {type === 'PARTICIPANTS' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                    Registration Link <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={registrationLink}
                    onChange={e => setRegistrationLink(e.target.value)}
                    placeholder="e.g. https://forms.gle/... or https://qualtrics.com/..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Link where participants can register for your study</p>
                </div>
              )}

              {/* Paper Upload (only for PEER_REVIEW type) */}
              {type === 'PEER_REVIEW' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                    Upload Paper <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setPaperFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="paper-upload"
                    />
                    <label
                      htmlFor="paper-upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-all"
                    >
                      <span className="text-xl">📄</span>
                      <span className="text-sm text-gray-600">
                        {paperFile ? paperFile.name : 'Choose PDF or Word document'}
                      </span>
                    </label>
                  </div>
                  {paperFile && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-emerald-600">✓ File selected: {paperFile.name}</span>
                      <button
                        onClick={() => setPaperFile(null)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* IRB Approved Toggle */}
              <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>IRB Approved?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Required for human subjects research at RIT</p>
                </div>
                <button
                  role="switch"
                  aria-checked={irbApproved}
                  onClick={() => setIrbApproved(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 ${
                    irbApproved ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      irbApproved ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* AI Appraise Button */}
              <button
                onClick={handleAppraise}
                disabled={!canAppraise}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg relative overflow-hidden"
                style={{
                  background: canAppraise
                    ? 'linear-gradient(135deg, #7c3aed 0%, #F76902 100%)'
                    : '#d1d5db',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {/* Shimmer effect */}
                {canAppraise && (
                  <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-xl" />
                )}
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">✨ Appraise Reward with AI</span>
              </button>

              <p className="text-center text-xs text-gray-400">
                Our Gemini-powered engine will suggest a fair TigerCredit reward based on your research type and commitment level.
              </p>
            </div>
          )}

          {/* ── Step: Loading ─────────────────────────────────────────────────────── */}
          {step === 'loading' && (
            <div className="p-10 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed20, #F7690220)' }}>
                  <span className="text-4xl animate-bounce">🔬</span>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-400/40 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-gray-900" style={{ fontWeight: 600 }}>Consulting the AI Engine</p>
                <p className="text-sm text-gray-500">Evaluating research type, time commitment & campus norms...</p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ width: '65%', background: 'linear-gradient(90deg, #7c3aed, #F76902)' }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {['Parsing request type', 'Estimating effort', 'Setting reward'].map((label, i) => (
                  <div key={label} className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step: Result ──────────────────────────────────────────────────────── */}
          {step === 'result' && (
            <div className="p-6 space-y-5">
              {/* Status banner */}
              {fallback ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800" style={{ fontWeight: 600 }}>AI engine temporarily unavailable</p>
                    <p className="text-xs text-amber-700 mt-0.5">Set your TigerCredit reward manually below.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-800" style={{ fontWeight: 600 }}>AI appraisal complete!</p>
                    {appraisal?.rationale && (
                      <p className="text-xs text-emerald-700 mt-0.5">{appraisal.rationale}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Your request</p>
                <p className="text-sm text-gray-800 line-clamp-1" style={{ fontWeight: 600 }}>{title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{abstract}</p>
              </div>

              {/* Suggested tags */}
              {appraisal && (
                <div>
                  <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Suggested Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {appraisal.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-sm border" style={{ background: 'linear-gradient(135deg, #7c3aed10, #F7690210)', color: '#7c3aed', borderColor: '#7c3aed30', fontWeight: 500 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit reward slider (hidden for COLLABORATION) */}
              {type !== 'COLLABORATION' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>TigerCredit Reward</p>
                    {credits === 0 && (
                      <span className="text-xs text-pink-500 flex items-center gap-1">❤️ Volunteer</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={credits}
                      onChange={e => setCredits(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: '#7c3aed' }}
                    />
                    <div className="flex items-center gap-1 min-w-[70px] justify-end">
                      <span className="text-lg">🪙</span>
                      <span className="text-xl text-violet-600" style={{ fontWeight: 700 }}>{credits}</span>
                      <span className="text-sm text-gray-400">TC</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 (Volunteer)</span>
                    <span>100 TC max</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600" style={{ fontWeight: 600 }}>✍️ Compensation: Co-Authorship / Mutual</p>
                  <p className="text-xs text-gray-400 mt-1">Collaborators share credit in the final publication or project.</p>
                </div>
              )}

              {/* IRB reminder */}
              {!irbApproved && type === 'PARTICIPANTS' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>Reminder:</strong> Human subjects research at RIT requires IRB approval. Make sure your study is approved before recruiting participants.
                  </p>
                </div>
              )}

              {/* Publish button */}
              <button
                onClick={handlePublish}
                className="w-full py-3.5 rounded-xl text-white hover:bg-[#e05e00] transition-colors shadow-lg shadow-orange-200"
                style={{ background: '#F76902', fontWeight: 700 }}
              >
                🚀 Publish to Research Hub
              </button>

              <p className="text-center text-xs text-gray-400">
                Your request will be visible to all RIT students on the Research Hub.
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
