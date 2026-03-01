import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Gig, BoardType } from '../types';
import { seedUsers, seedGigs, seedMessages } from '../data/seedData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  gigs: Gig[];
  messages: Record<string, { senderId: string; senderName: string; text: string; createdAt: string }[]>;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  postGig: (gig: Omit<Gig, 'id' | 'requesterId' | 'requesterName' | 'createdAt' | 'status'>) => Gig;
  acceptGig: (gigId: string) => void;
  resolveGig: (gigId: string) => void;
  cancelGig: (gigId: string) => void;
  sendMessage: (gigId: string, text: string) => void;
  thumbsUp: (targetUserId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  users: 'tigertail_users',
  gigs: 'tigertail_gigs',
  messages: 'tigertail_messages',
  currentUserId: 'tigertail_current_user_id',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = loadFromStorage<User[]>(STORAGE_KEYS.users, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEYS.users, seedUsers);
      return seedUsers;
    }
    return stored;
  });

  const [gigs, setGigs] = useState<Gig[]>(() => {
    const stored = loadFromStorage<Gig[]>(STORAGE_KEYS.gigs, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEYS.gigs, seedGigs);
      return seedGigs;
    }
    return stored;
  });

  const [messages, setMessages] = useState<Record<string, { senderId: string; senderName: string; text: string; createdAt: string }[]>>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.messages, {});
    const hasMessages = Object.keys(stored as object).length > 0;
    if (!hasMessages) {
      saveToStorage(STORAGE_KEYS.messages, seedMessages);
      return seedMessages;
    }
    return stored as Record<string, { senderId: string; senderName: string; text: string; createdAt: string }[]>;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.currentUserId, null)
  );

  const currentUser = users.find(u => u.id === currentUserId) ?? null;

  useEffect(() => { saveToStorage(STORAGE_KEYS.users, users); }, [users]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.gigs, gigs); }, [gigs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.messages, messages); }, [messages]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.currentUserId, currentUserId); }, [currentUserId]);

  const login = useCallback((email: string, _password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith('@rit.edu')) {
      return { success: false, error: 'Only @rit.edu email addresses are allowed.' };
    }
    const user = users.find(u => u.email.toLowerCase() === trimmed);
    if (!user) {
      return { success: false, error: 'No account found with that email. Please register first.' };
    }
    setCurrentUserId(user.id);
    return { success: true };
  }, [users]);

  const register = useCallback((name: string, email: string, _password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith('@rit.edu')) {
      return { success: false, error: 'Only @rit.edu email addresses are allowed on TigerTail.' };
    }
    if (users.find(u => u.email.toLowerCase() === trimmed)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmed,
      reputationScore: 50,
      tigercredits: 50,
      createdAt: new Date().toISOString(),
      thumbsUp: 0,
      thumbsDown: 0,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { success: true };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, []);

  const postGig = useCallback((gigData: Omit<Gig, 'id' | 'requesterId' | 'requesterName' | 'createdAt' | 'status'>) => {
    if (!currentUser) throw new Error('Must be logged in');
    const newGig: Gig = {
      ...gigData,
      id: `gig-${Date.now()}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    setGigs(prev => [newGig, ...prev]);
    return newGig;
  }, [currentUser]);

  const acceptGig = useCallback((gigId: string) => {
    if (!currentUser) return;
    setGigs(prev => prev.map(g =>
      g.id === gigId
        ? { ...g, status: 'ACCEPTED', helperId: currentUser.id, helperName: currentUser.name }
        : g
    ));
  }, [currentUser]);

  const resolveGig = useCallback((gigId: string) => {
    if (!currentUser) return;
    setGigs(prev => prev.map(g =>
      g.id === gigId ? { ...g, status: 'COMPLETED' } : g
    ));
    // Award TC to helper (mock)
    setGigs(prev => {
      const gig = prev.find(g => g.id === gigId);
      if (gig?.helperId) {
        setUsers(us => us.map(u =>
          u.id === gig.helperId
            ? { ...u, tigercredits: u.tigercredits + gig.suggestedPrice }
            : u
        ));
      }
      return prev;
    });
  }, [currentUser]);

  const cancelGig = useCallback((gigId: string) => {
    setGigs(prev => prev.map(g =>
      g.id === gigId ? { ...g, status: 'CANCELLED' } : g
    ));
  }, []);

  const sendMessage = useCallback((gigId: string, text: string) => {
    if (!currentUser) return;
    const msg = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => ({
      ...prev,
      [gigId]: [...(prev[gigId] ?? []), msg],
    }));
  }, [currentUser]);

  const thumbsUp = useCallback((targetUserId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === targetUserId
        ? { ...u, thumbsUp: u.thumbsUp + 1, reputationScore: Math.min(100, u.reputationScore + 2) }
        : u
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, users, gigs, messages,
      login, register, logout,
      postGig, acceptGig, resolveGig, cancelGig,
      sendMessage, thumbsUp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
