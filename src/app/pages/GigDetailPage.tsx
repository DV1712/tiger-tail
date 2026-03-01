import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, UserCheck, Send, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  ACCEPTED: { label: 'In Progress', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-500/10 text-red-600 border-red-200' },
};

const BOARD_CONFIG = {
  ACADEMIC: { label: '📚 Academic Board', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  LIFE: { label: '🏠 Campus Life', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
};

export function GigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, gigs, users, messages, acceptGig, resolveGig, cancelGig, sendMessage, thumbsUp } = useApp();
  const [messageText, setMessageText] = useState('');
  const [thumbsUpDone, setThumbsUpDone] = useState(false);

  const gig = gigs.find(g => g.id === id);
  if (!gig) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-3">🐯</p>
          <p className="text-gray-600" style={{ fontWeight: 600 }}>Gig not found</p>
          <Link to="/feed" className="text-[#F76902] text-sm hover:underline mt-2 block">← Back to feed</Link>
        </div>
      </div>
    );
  }

  const isRequester = currentUser?.id === gig.requesterId;
  const isHelper = currentUser?.id === gig.helperId;
  const isInvolved = isRequester || isHelper;
  const canAccept = gig.status === 'OPEN' && currentUser && !isRequester;
  const canResolve = gig.status === 'ACCEPTED' && isRequester;
  const canCancel = (gig.status === 'OPEN' || gig.status === 'ACCEPTED') && isRequester;
  const showChat = gig.status === 'ACCEPTED' && isInvolved;

  const requesterUser = users.find(u => u.id === gig.requesterId);
  const helperUser = gig.helperId ? users.find(u => u.id === gig.helperId) : null;
  const gigMessages = messages[gig.id] ?? [];
  const status = STATUS_CONFIG[gig.status];
  const board = BOARD_CONFIG[gig.boardType];

  const handleAccept = () => {
    acceptGig(gig.id);
    toast.success('You accepted this gig! Coordinate with the requester below.');
  };

  const handleResolve = () => {
    resolveGig(gig.id);
    toast.success(`Gig marked complete! ${gig.suggestedPrice > 0 ? `${gig.suggestedPrice} TC has been awarded to the helper.` : 'Thanks for volunteering! 🤝'}`);
  };

  const handleCancel = () => {
    cancelGig(gig.id);
    toast('Gig cancelled.');
    navigate('/feed');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage(gig.id, messageText.trim());
    setMessageText('');
  };

  const handleThumbsUp = (userId: string) => {
    thumbsUp(userId);
    setThumbsUpDone(true);
    toast.success('Reputation boosted! 🐯');
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Top strip */}
          <div className="h-1.5 bg-[#F76902]" />

          <div className="p-6 sm:p-8">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${board.bg}`} style={{ fontWeight: 500 }}>
                {board.label}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${status.bg}`} style={{ fontWeight: 500 }}>
                {status.label}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-lg">🐾</span>
                {gig.suggestedPrice === 0 ? (
                  <span className="text-pink-500 text-sm" style={{ fontWeight: 700 }}>Volunteer ❤️</span>
                ) : (
                  <>
                    <span className="text-[#F76902] text-xl" style={{ fontWeight: 800 }}>{gig.suggestedPrice}</span>
                    <span className="text-gray-400 text-sm">TigerCredits</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-800 leading-relaxed mb-5">
              {gig.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {gig.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[#F76902]/8 text-[#F76902] text-xs border border-[#F76902]/20" style={{ fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Compensation (if present) */}
            {gig.compensation && (
              <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <span style={{ fontWeight: 600 }}>💼 Compensation:</span> {gig.compensation}
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Posted {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
              </div>
              {gig.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{gig.location}</span>
                </div>
              )}
            </div>

            {/* Parties */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Requester */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>REQUESTING</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F76902] flex items-center justify-center text-white" style={{ fontWeight: 700 }}>
                    {gig.requesterName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{gig.requesterName}</p>
                    {requesterUser && (
                      <p className="text-xs text-gray-400">⭐ {requesterUser.reputationScore} rep · 👍 {requesterUser.thumbsUp}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Helper */}
              <div className={`rounded-xl border p-4 ${gig.helperId ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-xs text-gray-400 mb-2" style={{ fontWeight: 600 }}>HELPING</p>
                {gig.helperId && helperUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white" style={{ fontWeight: 700 }}>
                        {gig.helperName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{gig.helperName}</p>
                        <p className="text-xs text-gray-400">⭐ {helperUser.reputationScore} rep · 👍 {helperUser.thumbsUp}</p>
                      </div>
                    </div>
                    {gig.status === 'COMPLETED' && isRequester && !thumbsUpDone && (
                      <button
                        onClick={() => handleThumbsUp(gig.helperId!)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                        title="Give thumbs up"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 italic">Waiting for a Tiger...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {canAccept && (
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F76902] text-white hover:bg-[#e05e00] transition-colors shadow-lg shadow-orange-200"
                  style={{ fontWeight: 600 }}
                >
                  <UserCheck className="w-4 h-4" />
                  Accept This Gig
                </button>
              )}
              {canResolve && (
                <button
                  onClick={handleResolve}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                  style={{ fontWeight: 600 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Gig
                </button>
              )}
            </div>

            {/* Info for non-involved users on accepted gigs */}
            {gig.status === 'ACCEPTED' && !isInvolved && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-sm text-blue-700">
                  This gig has been accepted by <span style={{ fontWeight: 600 }}>{gig.helperName}</span>. It's no longer available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coordination Chat (only for parties involved in accepted/completed gigs) */}
        {(showChat || (gig.status === 'COMPLETED' && isInvolved)) && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <MessageCircle className="w-4 h-4 text-[#F76902]" />
              <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Coordination Chat</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Private</span>
            </div>

            {/* Messages */}
            <div className="px-6 py-4 space-y-3 min-h-[120px] max-h-64 overflow-y-auto">
              {gigMessages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  No messages yet. Say hello and coordinate your meetup!
                </p>
              ) : (
                gigMessages.map((msg, i) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${isMe ? 'bg-[#F76902]' : 'bg-gray-400'}`} style={{ fontWeight: 600 }}>
                        {msg.senderName.charAt(0)}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMe ? 'bg-[#F76902] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-0.5 ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            {showChat && (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Coordinate your meetup..."
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F76902]/30 focus:border-[#F76902] transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="p-2.5 rounded-xl bg-[#F76902] text-white hover:bg-[#e05e00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Off-platform notice */}
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-700">
            💡 <span style={{ fontWeight: 600 }}>TigerTail Note:</span> TigerCredits are exchanged off-platform after gig completion.
            This platform runs on the trust inherent in the RIT campus community. Stay safe and meet in public spaces!
          </p>
        </div>
      </div>
    </div>
  );
}
