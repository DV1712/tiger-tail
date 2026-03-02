import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, AlertTriangle, ChevronLeft, CheckCircle, MapPin } from 'lucide-react';
import { appraiseGig } from '../services/appraiser';
import { AppraiserResult, BoardType } from '../types';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface PostGigModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'compose' | 'loading' | 'result';

const BOARD_LABELS: Record<BoardType, string> = {
  ACADEMIC: '📚 Academic Board',
  LIFE: '🏠 Campus Life Board',
};

export function PostGigModal({ open, onClose }: PostGigModalProps) {
  const { postGig } = useApp();
  const [step, setStep] = useState<Step>('compose');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [appraisal, setAppraisal] = useState<AppraiserResult | null>(null);
  const [manualPrice, setManualPrice] = useState<number>(25);
  const [manualBoard, setManualBoard] = useState<BoardType>('ACADEMIC');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [userSuggestion, setUserSuggestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const reset = () => {
    setStep('compose');
    setDescription('');
    setLocation('');
    setAppraisal(null);
    setManualPrice(25);
    setFallbackMode(false);
    setManualBoard('ACADEMIC');
    setUserSuggestion('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAppraise = async () => {
    if (description.trim().length < 20) {
      toast.error('Please describe your gig in at least 20 characters.');
      return;
    }
    setStep('loading');
    const result = await appraiseGig(description);
    if (result) {
      setAppraisal(result);
      setManualPrice(result.price);
      setManualBoard(result.board);
      setFallbackMode(false);
    } else {
      // AI failed — fallback to manual
      setFallbackMode(true);
      setAppraisal(null);
    }
    setStep('result');
  };

  const handlePost = () => {
    const price = appraisal ? manualPrice : manualPrice;
    const board = appraisal ? appraisal.board : manualBoard;
    const tags = appraisal?.tags ?? ['Campus Help', 'Peer Support', 'Quick Task'];

    postGig({
      boardType: board,
      description: description.trim(),
      suggestedPrice: price,
      tags,
      location: location.trim() || undefined,
      compensation: userSuggestion.trim() || undefined,
    });

    toast.success('Gig posted! 🐯 Your request is now live on the feed.');
    handleClose();
  };

  const dots = Array.from({ length: 3 });

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {step === 'result' && (
                <button
                  onClick={() => setStep('compose')}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mr-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="TigerTail Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <Dialog.Title className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Post a Gig</Dialog.Title>
                <p className="text-xs text-gray-400">
                  {step === 'compose' && 'Describe what you need'}
                  {step === 'loading' && 'AI is analyzing your request...'}
                  {step === 'result' && (fallbackMode ? 'Set your price manually' : 'Review AI appraisal')}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step: Compose */}
          {step === 'compose' && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  What do you need help with?
                </label>
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Be specific! e.g. 'URGENT: My CSCI 243 midterm is in 3 hours and I cannot understand dynamic memory allocation in C++...'"
                  className="w-full h-36 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">More detail = better AI appraisal</p>
                  <p className={`text-xs ${description.length < 20 ? 'text-gray-400' : 'text-emerald-500'}`}>
                    {description.length} chars
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Preferred Location <span className="text-gray-400" style={{ fontWeight: 400 }}>(optional)</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Wallace Library, The SHED, Zoom, Global Village..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
              </div>

              <button
                onClick={handleAppraise}
                disabled={description.trim().length < 20}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#F76902] text-white transition-all hover:bg-[#e05e00] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
              >
                <Sparkles className="w-4 h-4" />
                <span style={{ fontWeight: 600 }}>Appraise with AI Engine</span>
              </button>

              <p className="text-center text-xs text-gray-400">
                Our Gemini-powered engine will suggest a fair TigerCredit price and categorize your gig.
              </p>
            </div>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="p-10 flex flex-col items-center gap-6">
              {/* Animated tiger */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#F76902]/10 flex items-center justify-center">
                  <img src="/logo.png" alt="TigerTail Logo" className="w-12 h-12 object-contain animate-bounce" />
                </div>
                {/* Orbit dots */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F76902]/30 animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              <div className="text-center space-y-1">
                <p className="text-gray-900" style={{ fontWeight: 600 }}>Consulting the AI Engine</p>
                <p className="text-sm text-gray-500">Analyzing your gig and checking campus market rates...</p>
              </div>

              {/* Loading bar */}
              <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F76902] rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {['Parsing description', 'Estimating value', 'Tagging category'].map((label, i) => (
                  <div key={label} className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#F76902] animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && (
            <div className="p-6 space-y-5">
              {fallbackMode ? (
                /* Fallback: AI failed */
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800" style={{ fontWeight: 600 }}>AI engine temporarily unavailable</p>
                    <p className="text-xs text-amber-700 mt-0.5">No worries — set your price and category manually below.</p>
                  </div>
                </div>
              ) : (
                /* AI success banner */
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-800" style={{ fontWeight: 600 }}>AI appraisal complete!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Review and adjust the suggestion before posting.</p>
                  </div>
                </div>
              )}

              {/* Description preview */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Your request</p>
                <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
              </div>

              {/* AI Suggestion (Read-only reference) */}
              {appraisal && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs text-blue-500 font-semibold mb-2">💡 AI Suggestion</p>
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">{appraisal.price} TigerCredits</span> • {appraisal.tags.join(', ')}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Use this value or type your own details below</p>
                </div>
              )}

              {/* Price control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>TigerCredit Price</p>
                  {manualPrice === 0 && (
                    <span className="text-xs text-pink-500 flex items-center gap-1">
                      ❤️ Volunteer / Mutual Aid
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={manualPrice}
                    onChange={e => setManualPrice(Number(e.target.value))}
                    className="flex-1 accent-[#F76902]"
                  />
                  <div className="flex items-center gap-1 min-w-[70px] justify-end">
                    <span className="text-lg">🐾</span>
                    <span className="text-xl text-[#F76902]" style={{ fontWeight: 700 }}>{manualPrice}</span>
                    <span className="text-sm text-gray-400">TC</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 (Volunteer)</span>
                  <span>100 TC max</span>
                </div>
              </div>

              {/* Compensation Field - User's Own Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                  Compensation <span className="text-gray-400" style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={userSuggestion}
                  onChange={e => setUserSuggestion(e.target.value)}
                  placeholder="E.g. 'Actually willing to do this for 20 TC if completed tonight' or additional requirements..."
                  className="w-full h-20 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#F76902]/40 focus:border-[#F76902] transition-all"
                />
              </div>

              {/* AI Tags (shown only when AI succeeded) */}
              {appraisal && (
                <div>
                  <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Suggested Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {appraisal.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-[#F76902]/10 text-[#F76902] text-sm border border-[#F76902]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Board selector (always shown, AI pre-fills if available) */}
              <div>
                <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>Board</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['ACADEMIC', 'LIFE'] as BoardType[]).map(b => (
                    <button
                      key={b}
                      onClick={() => setManualBoard(b)}
                      className={`py-2.5 rounded-xl text-sm border transition-all ${
                        (appraisal ? appraisal.board : manualBoard) === b
                          ? 'bg-[#F76902] text-white border-[#F76902] shadow-lg shadow-orange-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ fontWeight: 500 }}
                      disabled={!!appraisal}
                    >
                      {BOARD_LABELS[b]}
                    </button>
                  ))}
                </div>
                {appraisal && (
                  <p className="text-xs text-gray-400 mt-1.5 text-center">Board auto-selected by AI</p>
                )}
              </div>

              {/* Post button */}
              <button
                onClick={handlePost}
                className="w-full py-3.5 rounded-xl bg-[#F76902] text-white hover:bg-[#e05e00] transition-colors shadow-lg shadow-orange-200"
                style={{ fontWeight: 600 }}
              >
                🚀 Post Gig to Feed
              </button>

              <p className="text-center text-xs text-gray-400">
                TigerCredits are exchanged off-platform after gig completion.
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
