import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogOut, Star, ThumbsUp, Coins, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { GigCard } from '../components/GigCard';
import { GigStatus } from '../types';

type ProfileTab = 'posted' | 'helped' | 'stats';

export function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, gigs, logout } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posted');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const myPostedGigs = gigs.filter(g => g.requesterId === currentUser.id);
  const myHelperGigs = gigs.filter(g => g.helperId === currentUser.id);
  const completedHelped = myHelperGigs.filter(g => g.status === 'COMPLETED');
  const volunteerCount = completedHelped.filter(g => g.suggestedPrice === 0).length;
  const tcEarned = completedHelped.reduce((s, g) => s + g.suggestedPrice, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs: { value: ProfileTab; label: string; count: number }[] = [
    { value: 'posted', label: 'Posted Gigs', count: myPostedGigs.length },
    { value: 'helped', label: 'Helped With', count: myHelperGigs.length },
    { value: 'stats', label: 'Stats', count: 0 },
  ];

  const displayGigs = activeTab === 'posted' ? myPostedGigs : myHelperGigs;

  const statusCounts = (list: typeof gigs) => ({
    OPEN: list.filter(g => g.status === 'OPEN').length,
    ACCEPTED: list.filter(g => g.status === 'ACCEPTED').length,
    COMPLETED: list.filter(g => g.status === 'COMPLETED').length,
    CANCELLED: list.filter(g => g.status === 'CANCELLED').length,
  });

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-[#F76902] via-[#ff8c38] to-[#F76902] relative">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
            }} />
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-[#1C1C1E] border-4 border-white shadow-xl flex items-center justify-center text-3xl text-white flex-shrink-0" style={{ fontWeight: 800 }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="pb-1">
                  <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{currentUser.name}</h2>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-sm self-start sm:self-auto"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <p className="text-sm text-gray-600 mb-4 max-w-lg">{currentUser.bio}</p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Star, label: 'Rep Score', value: currentUser.reputationScore, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { icon: ThumbsUp, label: 'Thumbs Up', value: currentUser.thumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: Coins, label: 'TigerCredits', value: currentUser.tigercredits, color: 'text-[#F76902]', bg: 'bg-orange-50' },
                { icon: Calendar, label: 'Member Since', value: format(new Date(currentUser.createdAt), 'MMM yyyy'), color: 'text-blue-500', bg: 'bg-blue-50', isText: true },
              ].map(stat => (
                <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
                  <p className={`${stat.isText ? 'text-sm' : 'text-lg'} ${stat.color}`} style={{ fontWeight: 700 }}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-all border-b-2 ${
                  activeTab === tab.value
                    ? 'border-[#F76902] text-[#F76902]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontWeight: activeTab === tab.value ? 700 : 500 }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value ? 'bg-[#F76902]/15 text-[#F76902]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {(activeTab === 'posted' || activeTab === 'helped') && (
              <>
                {displayGigs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2">🐯</p>
                    <p className="text-gray-500" style={{ fontWeight: 500 }}>
                      {activeTab === 'posted' ? "You haven't posted any gigs yet." : "You haven't helped on any gigs yet."}
                    </p>
                    {activeTab === 'posted' ? (
                      <Link
                        to="/feed"
                        className="inline-block mt-3 text-sm text-[#F76902] hover:underline"
                      >
                        Go to the feed and post your first gig →
                      </Link>
                    ) : (
                      <Link
                        to="/feed"
                        className="inline-block mt-3 text-sm text-[#F76902] hover:underline"
                      >
                        Browse the feed and help a Tiger →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayGigs.map(gig => (
                      <GigCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-5">
                {/* Posted gig stats */}
                <div>
                  <h4 className="text-gray-700 mb-3" style={{ fontWeight: 600 }}>Posted Gig Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(statusCounts(myPostedGigs)).map(([status, count]) => {
                      const colors: Record<GigStatus, string> = {
                        OPEN: 'text-emerald-500 bg-emerald-50',
                        ACCEPTED: 'text-blue-500 bg-blue-50',
                        COMPLETED: 'text-gray-500 bg-gray-100',
                        CANCELLED: 'text-red-400 bg-red-50',
                      };
                      return (
                        <div key={status} className={`rounded-xl p-3 ${colors[status as GigStatus]}`}>
                          <p className="text-xl" style={{ fontWeight: 700 }}>{count}</p>
                          <p className="text-xs">{status.charAt(0) + status.slice(1).toLowerCase()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Helper gig stats */}
                <div>
                  <h4 className="text-gray-700 mb-3" style={{ fontWeight: 600 }}>Helped Gig Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(statusCounts(myHelperGigs)).map(([status, count]) => {
                      const colors: Record<GigStatus, string> = {
                        OPEN: 'text-emerald-500 bg-emerald-50',
                        ACCEPTED: 'text-blue-500 bg-blue-50',
                        COMPLETED: 'text-gray-500 bg-gray-100',
                        CANCELLED: 'text-red-400 bg-red-50',
                      };
                      return (
                        <div key={status} className={`rounded-xl p-3 ${colors[status as GigStatus]}`}>
                          <p className="text-xl" style={{ fontWeight: 700 }}>{count}</p>
                          <p className="text-xs">{status.charAt(0) + status.slice(1).toLowerCase()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Community impact */}
                <div>
                  <h4 className="text-gray-700 mb-3" style={{ fontWeight: 600 }}>Community Impact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-[#F76902]/5 border border-[#F76902]/15 p-4 text-center">
                      <p className="text-2xl text-[#F76902]" style={{ fontWeight: 800 }}>{tcEarned}</p>
                      <p className="text-xs text-gray-500">TC Earned Helping</p>
                    </div>
                    <div className="rounded-xl bg-pink-50 border border-pink-100 p-4 text-center">
                      <p className="text-2xl text-pink-500" style={{ fontWeight: 800 }}>❤️ {volunteerCount}</p>
                      <p className="text-xs text-gray-500">Volunteer Gigs</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                      <p className="text-2xl text-emerald-500" style={{ fontWeight: 800 }}>{completedHelped.length}</p>
                      <p className="text-xs text-gray-500">Gigs Completed</p>
                    </div>
                  </div>
                </div>

                {/* Reputation breakdown */}
                <div>
                  <h4 className="text-gray-700 mb-3" style={{ fontWeight: 600 }}>Reputation</h4>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Score</span>
                      <span className="text-sm text-yellow-500" style={{ fontWeight: 700 }}>
                        {currentUser.reputationScore}/100
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F76902] to-yellow-400 rounded-full transition-all"
                        style={{ width: `${currentUser.reputationScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>👎 {currentUser.thumbsDown} negative</span>
                      <span>👍 {currentUser.thumbsUp} positive</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}