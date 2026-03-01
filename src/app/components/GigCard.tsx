import { Link } from 'react-router';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Gig } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface GigCardProps {
  gig: Gig;
}

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ACCEPTED: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const BOARD_CONFIG = {
  ACADEMIC: { label: '📚 Academic', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  LIFE: { label: '🏠 Campus Life', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
};

export function GigCard({ gig }: GigCardProps) {
  const status = STATUS_CONFIG[gig.status];
  const board = BOARD_CONFIG[gig.boardType];
  const timeAgo = formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true });

  return (
    <Link
      to={`/gig/${gig.id}`}
      className="block group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#F76902]/30 transition-all duration-200"
    >
      <div className="p-5">
        {/* Top row: board type + status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${board.color}`} style={{ fontWeight: 500 }}>
            {board.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`} style={{ fontWeight: 500 }}>
            {status.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 mb-4">
          {gig.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gig.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Compensation (if present) */}
        {gig.compensation && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-600 line-clamp-2">
              <span style={{ fontWeight: 600 }}>Compensation:</span> {gig.compensation}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Requester avatar */}
            <div className="w-7 h-7 rounded-full bg-[#F76902] flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
              {gig.requesterName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>{gig.requesterName.split(' ')[0]}</p>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{timeAgo}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Price */}
            <div className="text-right">
              {gig.suggestedPrice === 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm">❤️</span>
                  <span className="text-xs text-pink-500" style={{ fontWeight: 600 }}>Volunteer</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-sm">🐾</span>
                  <span className="text-sm text-[#F76902]" style={{ fontWeight: 700 }}>{gig.suggestedPrice}</span>
                  <span className="text-xs text-gray-400">TC</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F76902] transition-colors" />
          </div>
        </div>

        {/* Location (if present) */}
        {gig.location && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 truncate">{gig.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
