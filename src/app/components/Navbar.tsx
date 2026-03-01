import { Link, useLocation, useNavigate } from 'react-router';
import { LogOut, Home, Plus, FlaskConical } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onPostGig?: () => void;
}

export function Navbar({ onPostGig }: NavbarProps) {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#1C1C1E] border-b border-[#2C2C2E] shadow-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-orange-900/40">
            <img src="/logo.png" alt="TigerTail Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-white tracking-tight hidden sm:block" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Tiger<span className="text-[#F76902]">Tail</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="flex items-center gap-1">
          <Link
            to="/feed"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/feed')
                ? 'bg-[#F76902]/15 text-[#F76902]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Feed</span>
          </Link>

          <Link
            to="/research"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/research')
                ? 'bg-violet-500/15 text-violet-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Research</span>
            <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 ml-0.5" style={{ fontWeight: 600, fontSize: '0.6rem', lineHeight: '1rem' }}>
              NEW
            </span>
          </Link>

          {onPostGig && (
            <button
              onClick={onPostGig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Gig</span>
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* TC Balance */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F76902]/10 border border-[#F76902]/20">
              <span className="text-xs">🐾</span>
              <span className="text-[#F76902] text-xs" style={{ fontWeight: 600 }}>
                {currentUser.tigercredits} TC
              </span>
            </div>
          )}

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/profile')
                ? 'bg-[#F76902]/15 text-[#F76902]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#F76902] flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>
              {currentUser?.name?.charAt(0) ?? '?'}
            </div>
            <span className="hidden md:inline text-sm">{currentUser?.name?.split(' ')[0]}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}