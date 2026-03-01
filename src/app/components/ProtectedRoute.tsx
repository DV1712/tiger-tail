import { Navigate, Outlet } from 'react-router';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from './Navbar';
import { PostGigModal } from './PostGigModal';

export function ProtectedLayout() {
  const { currentUser } = useApp();
  const [postModalOpen, setPostModalOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onPostGig={() => setPostModalOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <PostGigModal open={postModalOpen} onClose={() => setPostModalOpen(false)} />
    </div>
  );
}
