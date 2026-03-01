import { useState, useMemo } from 'react';
import { Plus, BookOpen, Home, Search, SlidersHorizontal, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GigCard } from '../components/GigCard';
import { PostGigModal } from '../components/PostGigModal';
import { BoardType, GigStatus } from '../types';

const STATUS_FILTERS: { value: GigStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: '🟢 Open' },
  { value: 'ACCEPTED', label: '🔵 In Progress' },
  { value: 'COMPLETED', label: '✓ Completed' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function FeedPage() {
  const { currentUser, gigs, users } = useApp();
  const [board, setBoard] = useState<BoardType>('ACADEMIC');
  const [statusFilter, setStatusFilter] = useState<GigStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return gigs.filter(g => {
      if (g.boardType !== board) return false;
      if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          g.description.toLowerCase().includes(q) ||
          g.tags.some(t => t.toLowerCase().includes(q)) ||
          g.requesterName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [gigs, board, statusFilter, search]);

  const openCount = gigs.filter(g => g.boardType === board && g.status === 'OPEN').length;
  const topHelper = users.sort((a, b) => b.reputationScore - a.reputationScore)[0];

  return (
    <>
      <div className="min-h-screen bg-[#F8F8FA]">
        {/* Hero banner */}
        <div className="bg-[#1C1C1E] border-b border-[#2C2C2E]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-500 text-sm">{getGreeting()},</p>
                <h1 className="text-white" style={{ fontWeight: 700, fontSize: '1.4rem' }}>
                  {currentUser?.name?.split(' ')[0]} 🐯
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  <span className="text-[#F76902]" style={{ fontWeight: 600 }}>{openCount}</span> open gigs on the {board === 'ACADEMIC' ? 'Academic' : 'Campus Life'} board
                </p>
              </div>
              <button
                onClick={() => setPostModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F76902] text-white hover:bg-[#e05e00] transition-all shadow-lg shadow-orange-900/30 self-start sm:self-auto"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                Post a Gig
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Board toggle */}
              <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex mb-4 shadow-sm">
                {([
                  { value: 'ACADEMIC' as BoardType, label: '📚 Academic Board', desc: 'Tutoring, debugging, proofreading' },
                  { value: 'LIFE' as BoardType, label: '🏠 Campus Life', desc: 'Rides, repairs, life skills' },
                ] as const).map(b => (
                  <button
                    key={b.value}
                    onClick={() => setBoard(b.value)}
                    className={`flex-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-3 rounded-lg text-sm transition-all ${
                      board === b.value
                        ? 'bg-[#F76902] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span style={{ fontWeight: 600 }}>{b.label}</span>
                    <span className={`text-xs hidden sm:block ${board === b.value ? 'text-orange-100' : 'text-gray-400'}`}>
                      {b.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search + filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search gigs, tags, or people..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/30 focus:border-[#F76902] transition-all"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs border transition-all ${
                        statusFilter === f.value
                          ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gig grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-3">🐯</div>
                  <p className="text-gray-500" style={{ fontWeight: 500 }}>No gigs found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {search ? 'Try a different search term' : 'Be the first to post on this board!'}
                  </p>
                  <button
                    onClick={() => setPostModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#F76902] text-white text-sm hover:bg-[#e05e00] transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Post a Gig
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map(gig => (
                    <GigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
              {/* Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>📊 Campus Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Open Gigs', value: gigs.filter(g => g.status === 'OPEN').length, color: 'text-emerald-500' },
                    { label: 'In Progress', value: gigs.filter(g => g.status === 'ACCEPTED').length, color: 'text-blue-500' },
                    { label: 'Completed', value: gigs.filter(g => g.status === 'COMPLETED').length, color: 'text-gray-500' },
                    { label: 'TC Circulating', value: gigs.filter(g => g.status !== 'CANCELLED').reduce((s, g) => s + g.suggestedPrice, 0), color: 'text-[#F76902]' },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{stat.label}</span>
                      <span className={`text-sm ${stat.color}`} style={{ fontWeight: 700 }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-[#F76902]" />
                  <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Top Tigers</h3>
                </div>
                <div className="space-y-2">
                  {users
                    .sort((a, b) => b.reputationScore - a.reputationScore)
                    .slice(0, 5)
                    .map((user, i) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <span className="text-sm w-5 text-center text-gray-400" style={{ fontWeight: 600 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#F76902] flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate" style={{ fontWeight: 500 }}>
                            {user.name.split(' ')[0]}
                          </p>
                        </div>
                        <span className="text-xs text-[#F76902]" style={{ fontWeight: 700 }}>
                          {user.reputationScore}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Quick tips */}
              <div className="bg-[#F76902]/5 rounded-xl border border-[#F76902]/15 p-4">
                <p className="text-sm text-[#F76902] mb-2" style={{ fontWeight: 700 }}>🐯 Tiger Tips</p>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• Be specific in descriptions for the best AI appraisal</li>
                  <li>• Include your preferred location or meeting spot</li>
                  <li>• After helping, ask the requester to rate you!</li>
                  <li>• 0 TC gigs build community & reputation 🤝</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostGigModal open={postModalOpen} onClose={() => setPostModalOpen(false)} />
    </>
  );
}
