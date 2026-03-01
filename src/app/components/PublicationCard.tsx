import { useState } from 'react';
import { Sparkles, Clock, ExternalLink, BookOpen, Trophy } from 'lucide-react';
import { ResearchRequest } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface PublicationCardProps {
  request: ResearchRequest;
}

export function PublicationCard({ request }: PublicationCardProps) {
  const [clapped, setClapped]     = useState(false);
  const [clapCount, setClapCount] = useState(request.congratulations ?? 0);
  const [burst, setBurst]         = useState(false);

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  const handleClap = () => {
    if (clapped) {
      setClapped(false);
      setClapCount(n => n - 1);
    } else {
      setClapped(true);
      setClapCount(n => n + 1);
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-amber-200/60 shadow-sm hover:shadow-lg hover:border-amber-300/80 transition-all duration-200 relative">

      {/* ── Gold shimmer top strip ───────────────────────────────────────────── */}
      <div
        className="h-1"
        style={{
          background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b, #d97706)',
          backgroundSize: '200% 100%',
        }}
      />

      {/* ── Subtle warm card tint ────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background: 'linear-gradient(160deg, #fffbeb08 0%, transparent 60%)' }} />

      {/* Amber left-border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-400 to-yellow-500 rounded-l-xl" />

      <div className="p-5 pl-6 relative">

        {/* ── Top row ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
              borderColor: '#fbbf24',
              color: '#92400e',
              fontWeight: 700,
            }}
          >
            <Trophy className="w-3 h-3" style={{ color: '#f59e0b' }} />
            Published Research
          </span>

          {/* Venue badge */}
          {request.venue && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontWeight: 500 }}>
              <BookOpen className="w-3 h-3" />
              {request.venue}
            </span>
          )}
        </div>

        {/* ── Tags ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {request.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full border"
              style={{
                background: tag === 'Published'  ? '#fef3c7'
                          : tag === 'Showcase'   ? '#fdf4ff'
                          : '#f9fafb',
                borderColor: tag === 'Published'  ? '#fcd34d'
                           : tag === 'Showcase'   ? '#e9d5ff'
                           : '#e5e7eb',
                color: tag === 'Published'  ? '#92400e'
                     : tag === 'Showcase'   ? '#6b21a8'
                     : '#4b5563',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Title ────────────────────────────────────────────────────────────── */}
        <h3 className="text-gray-900 text-sm leading-snug mb-3 line-clamp-2" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          {request.title}
        </h3>

        {/* ── AI Summary box ────────────────────────────────────────────────────── */}
        {request.aiSummary ? (
          <div
            className="rounded-xl p-3.5 mb-4 border"
            style={{
              background: 'linear-gradient(135deg, #f8f7ff, #f3f4f6)',
              borderColor: '#e9d5ff',
            }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ fontWeight: 700, color: '#7c3aed' }}>
                  ✨ AI Summary
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {request.aiSummary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback: show abstract snippet if no AI summary */
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">
            {request.abstract}
          </p>
        )}

        {/* ── Footer: author + actions ──────────────────────────────────────────── */}
        <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-3">
          {/* Researcher info */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 700 }}
            >
              {request.researcherName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-800 truncate" style={{ fontWeight: 600 }}>
                {request.researcherName}
              </p>
              <p className="text-xs text-gray-400 truncate">{request.department}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Congratulate button */}
            <button
              onClick={handleClap}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                clapped
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
              }`}
              style={{ fontWeight: 600 }}
            >
              <span
                className={`text-sm transition-transform ${burst ? 'scale-150' : 'scale-100'}`}
                style={{ display: 'inline-block', transitionDuration: '150ms' }}
              >
                👏
              </span>
              <span>{clapCount}</span>

              {/* Burst particles */}
              {burst && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs pointer-events-none animate-bounce">
                  +1
                </span>
              )}
            </button>

            {/* Read Paper button */}
            {request.paperUrl ? (
              <a
                href={request.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs text-white transition-all"
                style={{ background: '#1C1C1E', fontWeight: 600 }}
              >
                Read Paper
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs text-white transition-all opacity-80 cursor-not-allowed"
                style={{ background: '#1C1C1E', fontWeight: 600 }}
                title="No paper link provided"
                disabled
              >
                Read Paper
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50/80">
          <Clock className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}