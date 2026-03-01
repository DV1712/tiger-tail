import { useState, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, AlertTriangle, ChevronLeft, Upload, FileText, CheckCircle, Trophy, Pencil } from 'lucide-react';
import { ResearchRequest } from '../types';
import { generatePaperTldr } from '../services/tldrGenerator';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface PostPublicationModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (request: ResearchRequest) => void;
}

type Step = 'compose' | 'analyzing' | 'preview';

const FIELD_OPTIONS = [
  'Cybersecurity', 'Machine Learning', 'HCI', 'NLP', 'Computer Vision',
  'Bioinformatics', 'Robotics', 'Networking', 'Education', 'Psychology',
  'Chemistry', 'Biology', 'Physics', 'Statistics', 'Social Science',
  'Software Engineering', 'Data Science', 'Cloud Computing',
];

export function PostPublicationModal({ open, onClose, onPublish }: PostPublicationModalProps) {
  const { currentUser } = useApp();

  const [step, setStep]             = useState<Step>('compose');
  const [title, setTitle]           = useState('');
  const [department, setDepartment] = useState('');
  const [venue, setVenue]           = useState('');
  const [paperUrl, setPaperUrl]     = useState('');
  const [fieldTags, setFieldTags]   = useState<string[]>([]);
  const [customTag, setCustomTag]   = useState('');
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tldr, setTldr]             = useState('');
  const [editingTldr, setEditingTldr] = useState(false);
  const [fallback, setFallback]     = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('compose'); setTitle(''); setDepartment(''); setVenue('');
    setPaperUrl(''); setFieldTags([]); setCustomTag('');
    setPdfFile(null); setTldr(''); setEditingTldr(false); setFallback(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const canGenerate = title.trim().length >= 5 && (pdfFile !== null || fieldTags.length > 0);

  // ── Drag-and-drop PDF zone ──────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') setPdfFile(file);
    else toast.error('Please drop a PDF file.');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === 'application/pdf') setPdfFile(file);
    else if (file) toast.error('Please select a PDF file.');
  };

  // ── Tag management ──────────────────────────────────────────────────────────
  const toggleTag = (tag: string) => {
    setFieldTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 4),
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !fieldTags.includes(t) && fieldTags.length < 4) {
      setFieldTags(prev => [...prev, t]);
      setCustomTag('');
    }
  };

  // ── AI TL;DR generation ──────────────────────────────────────────────────────
  const handleGenerateTldr = async () => {
    if (!canGenerate) {
      toast.error('Add a title and at least one tag or PDF to generate an AI summary.');
      return;
    }
    setStep('analyzing');
    const result = await generatePaperTldr(title, fieldTags, pdfFile !== null);
    if (result) {
      setTldr(result);
      setFallback(false);
    } else {
      setTldr('');
      setFallback(true);
    }
    setStep('preview');
  };

  // ── Publish ──────────────────────────────────────────────────────────────────
  const handlePublish = () => {
    const allTags = ['Published', 'Showcase', ...fieldTags].slice(0, 6);

    const pub: ResearchRequest = {
      id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'PUBLICATION',
      title: title.trim(),
      abstract: tldr || `Published research by ${currentUser?.name ?? 'Anonymous'} from ${department || 'RIT'}.`,
      researcherName: currentUser?.name ?? 'Anonymous Researcher',
      department: department.trim() || 'RIT',
      tags: allTags,
      compensation: { type: 'AUTHORSHIP' },
      irbApproved: false,
      location: 'VIRTUAL',
      createdAt: new Date().toISOString(),
      aiSummary: tldr || undefined,
      paperUrl: paperUrl.trim() || undefined,
      venue: venue.trim() || undefined,
      congratulations: 0,
    };

    onPublish(pub);
    toast.success('Paper showcased on the Research Hub! 🎉');
    handleClose();
  };

  const analyzeSteps = ['Reading PDF...', 'Extracting key findings...', 'Writing ELI5 summary...'];

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[92vh] overflow-y-auto"
          aria-describedby="pub-modal-desc"
        >
          {/* ── Header ─────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              {step === 'preview' && (
                <button onClick={() => setStep('compose')} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mr-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                  Showcase Your Research
                </Dialog.Title>
                <p id="pub-modal-desc" className="text-xs text-gray-400">
                  {step === 'compose'   && 'Share your published paper with the RIT community'}
                  {step === 'analyzing' && 'Gemini is reading your paper…'}
                  {step === 'preview'   && 'Review your AI summary before publishing'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ══ Step 1: Compose ════════════════════════════════════════════════════ */}
          {step === 'compose' && (
            <div className="p-6 space-y-5">

              {/* Title */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>Paper Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. A novel approach to defending against zero-day IoT exploits"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
              </div>

              {/* Department + Venue */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Department <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. CS, Psychology"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Venue <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="e.g. IEEE S&P 2025"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Paper URL */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Paper URL <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={paperUrl}
                  onChange={e => setPaperUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/... or doi.org/..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
              </div>

              {/* Field tags */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Research Field Tags
                  <span className="text-gray-400 ml-1.5" style={{ fontWeight: 400 }}>({fieldTags.length}/4 selected)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {FIELD_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-0.5 rounded-full text-xs border transition-all ${
                        fieldTags.includes(tag)
                          ? 'text-white border-amber-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                      style={fieldTags.includes(tag) ? { background: '#f59e0b', fontWeight: 600 } : { fontWeight: 500 }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Custom tag input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                    placeholder="Add custom tag..."
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                  />
                  <button
                    onClick={addCustomTag}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700 text-sm transition-all border border-gray-200"
                    style={{ fontWeight: 600 }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* PDF Upload Zone */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Upload PDF <span className="text-gray-400 font-normal">(for best AI summary)</span>
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !pdfFile && fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-amber-400 bg-amber-50'
                      : pdfFile
                        ? 'border-emerald-400 bg-emerald-50 cursor-default'
                        : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-emerald-800 truncate max-w-[220px]" style={{ fontWeight: 600 }}>
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF ready
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="ml-auto p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                        Drop your PDF here or <span className="text-amber-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Gemini will read it and generate an ELI5 summary for your card
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Generate AI Summary button */}
              <button
                onClick={handleGenerateTldr}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
                style={{
                  background: canGenerate
                    ? 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)'
                    : '#d1d5db',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: canGenerate ? '0 8px 24px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {canGenerate && <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />}
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">✨ Generate AI TL;DR with Gemini</span>
              </button>

              <p className="text-center text-xs text-gray-400">
                Gemini reads your PDF and writes a 2-sentence "Explain Like I'm 5" summary so everyone can understand your work.
              </p>
            </div>
          )}

          {/* ══ Step 2: Analyzing ══════════════════════════════════════════════════ */}
          {step === 'analyzing' && (
            <div className="p-10 flex flex-col items-center gap-6">
              {/* Animated document + sparkles */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', border: '2px solid #fbbf24' }}>
                  <span className="text-4xl animate-bounce">📄</span>
                </div>
                {/* Rotating sparkle ring */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-400/50 animate-spin"
                  style={{ animationDuration: '4s', margin: '-6px' }}
                />
                {/* Gemini icon top-right */}
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-lg animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  ✨
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-gray-900" style={{ fontWeight: 600 }}>Gemini is reading your paper</p>
                <p className="text-sm text-gray-500">Distilling your research into 2 plain-English sentences...</p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ width: '70%', background: 'linear-gradient(90deg, #7c3aed, #f59e0b)' }}
                />
              </div>

              {/* Animated step labels */}
              <div className="space-y-2 text-center">
                {analyzeSteps.map((label, i) => (
                  <div key={label} className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce flex-shrink-0"
                      style={{ animationDelay: `${i * 0.25}s` }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ Step 3: Preview ════════════════════════════════════════════════════ */}
          {step === 'preview' && (
            <div className="p-6 space-y-5">
              {/* Status banner */}
              {fallback ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800" style={{ fontWeight: 600 }}>Gemini is temporarily unavailable</p>
                    <p className="text-xs text-amber-700 mt-0.5">Write your own TL;DR below, or publish without one.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-800" style={{ fontWeight: 600 }}>AI TL;DR generated!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Review and edit before publishing — it should appear on your card exactly as written.</p>
                  </div>
                </div>
              )}

              {/* Paper info preview */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2" style={{ fontWeight: 700 }}>{title}</p>
                    {venue && <p className="text-xs text-amber-600 mt-0.5" style={{ fontWeight: 500 }}>{venue}</p>}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Published', 'Showcase', ...fieldTags].slice(0, 5).map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200" style={{ fontWeight: 500 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary preview / editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    ✨ AI Summary (ELI5)
                  </p>
                  <button
                    onClick={() => setEditingTldr(v => !v)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    {editingTldr ? 'Done' : 'Edit'}
                  </button>
                </div>

                {editingTldr || fallback ? (
                  <textarea
                    value={tldr}
                    onChange={e => setTldr(e.target.value)}
                    rows={4}
                    placeholder="Write a 2-sentence ELI5 explanation of your paper..."
                    className="w-full rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all placeholder-gray-400"
                  />
                ) : (
                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: 'linear-gradient(135deg, #f8f7ff, #f3f4f6)', borderColor: '#e9d5ff' }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{tldr}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Publish button */}
              <button
                onClick={handlePublish}
                className="w-full py-3.5 rounded-xl text-white transition-colors shadow-lg"
                style={{ background: '#F76902', fontWeight: 700 }}
              >
                🎉 Publish to Research Hub
              </button>

              <p className="text-center text-xs text-gray-400">
                Your paper will appear as a "Published Research" showcase card on the Research Hub.
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
