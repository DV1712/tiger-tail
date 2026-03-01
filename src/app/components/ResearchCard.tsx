import { Clock, MapPin, Users, ShieldCheck, ExternalLink } from 'lucide-react';
import { ResearchRequest, ResearchType } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ResearchCardProps {
  request: ResearchRequest;
  onAction?: (request: ResearchRequest) => void;
}

// ── Per-type visual config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ResearchType, {
  icon: string;
  label: string;
  borderColor: string;
  badgeColor: string;
  badgeBg: string;
  btnClass: string;
  actionLabel: string;
  headerGradient: string;
}> = {
  PARTICIPANTS: {
    icon: '🧪',
    label: 'Study Participants',
    borderColor: 'border-l-violet-500',
    badgeColor: 'text-violet-700',
    badgeBg: 'bg-violet-50 border-violet-200',
    btnClass: 'bg-violet-600 hover:bg-violet-700 shadow-violet-200',
    actionLabel: 'Sign Up for Study',
    headerGradient: 'from-violet-50 to-purple-50/30',
  },
  PEER_REVIEW: {
    icon: '📝',
    label: 'Peer Review',
    borderColor: 'border-l-blue-500',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-50 border-blue-200',
    btnClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    actionLabel: 'Review Paper',
    headerGradient: 'from-blue-50 to-sky-50/30',
  },
  COLLABORATION: {
    icon: '🤝',
    label: 'Collaboration',
    borderColor: 'border-l-[#F76902]',
    badgeColor: 'text-orange-700',
    badgeBg: 'bg-orange-50 border-orange-200',
    btnClass: 'bg-[#F76902] hover:bg-[#e05e00] shadow-orange-200',
    actionLabel: 'Message Researcher',
    headerGradient: 'from-orange-50 to-amber-50/30',
  },
  // PUBLICATION cards are rendered via PublicationCard — this entry is a fallback
  PUBLICATION: {
    icon: '⭐',
    label: 'Published Research',
    borderColor: 'border-l-amber-400',
    badgeColor: 'text-amber-800',
    badgeBg: 'bg-amber-50 border-amber-300',
    btnClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    actionLabel: 'Read Paper',
    headerGradient: 'from-amber-50 to-yellow-50/30',
  },
};

const LOCATION_LABELS: Record<string, string> = {
  IN_PERSON: '📍 In-Person',
  VIRTUAL:   '💻 Virtual',
  FLEXIBLE:  '🔄 Flexible',
};

function CompensationBadge({ comp }: { comp: ResearchRequest['compensation'] }) {
  if (comp.type === 'AUTHORSHIP') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs" style={{ fontWeight: 600 }}>
        ✍️ Co-Authorship / Mutual
      </span>
    );
  }
  if (comp.type === 'CASH' && comp.cashLabel) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs" style={{ fontWeight: 600 }}>
        💵 {comp.cashLabel}
      </span>
    );
  }
  if (comp.credits && comp.credits > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs" style={{ fontWeight: 600 }}>
        🪙 Earn {comp.credits} Credits
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-xs" style={{ fontWeight: 600 }}>
      ❤️ Volunteer / Mutual
    </span>
  );
}

export function ResearchCard({ request, onAction }: ResearchCardProps) {
  const config = TYPE_CONFIG[request.type];
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  return (
    <div
      className={`group bg-white rounded-xl border border-gray-100 border-l-4 ${config.borderColor} shadow-sm hover:shadow-md hover:border-r-gray-200 hover:border-t-gray-200 hover:border-b-gray-200 transition-all duration-200 overflow-hidden`}
    >
      {/* Subtle header gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${config.headerGradient}`} />

      <div className="p-5">
        {/* Top row: type badge + location */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${config.badgeBg} ${config.badgeColor}`} style={{ fontWeight: 600 }}>
            {config.icon} {config.label}
          </span>
          <div className="flex items-center gap-2">
            {request.irbApproved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                <ShieldCheck className="w-3 h-3" />
                IRB ✓
              </span>
            )}
            <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
              {LOCATION_LABELS[request.location]}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 text-sm leading-snug mb-2 line-clamp-2" style={{ fontWeight: 700 }}>
          {request.title}
        </h3>

        {/* Abstract */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {request.abstract}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {request.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
            >
              {tag}
            </span>
          ))}
          {request.participantsNeeded && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {request.participantsNeeded} needed
            </span>
          )}
        </div>

        {/* Compensation */}
        <div className="mb-4">
          <CompensationBadge comp={request.compensation} />
        </div>

        {/* Footer: researcher info + action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F76902, #e05e00)', fontWeight: 700 }}
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

          <button
            onClick={() => onAction?.(request)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs shadow-lg transition-all ${config.btnClass}`}
            style={{ fontWeight: 600 }}
          >
            {config.actionLabel}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
          <Clock className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}