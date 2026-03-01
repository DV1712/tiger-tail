export type BoardType = 'ACADEMIC' | 'LIFE';
export type GigStatus = 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  reputationScore: number;
  tigercredits: number;
  createdAt: string;
  bio?: string;
  thumbsUp: number;
  thumbsDown: number;
}

export interface Gig {
  id: string;
  requesterId: string;
  requesterName: string;
  helperId?: string;
  helperName?: string;
  boardType: BoardType;
  description: string;
  suggestedPrice: number;
  compensation?: string;
  status: GigStatus;
  tags: string[];
  createdAt: string;
  location?: string;
}

export interface AppraiserResult {
  price: number;
  tags: string[];
  board: BoardType;
}

// ─── Research Hub ──────────────────────────────────────────────────────────────

export type ResearchType = 'PARTICIPANTS' | 'PEER_REVIEW' | 'COLLABORATION' | 'PUBLICATION';
export type ResearchLocation = 'IN_PERSON' | 'VIRTUAL' | 'FLEXIBLE';

export interface ResearchCompensation {
  type: 'CREDITS' | 'CASH' | 'AUTHORSHIP';
  credits?: number;
  cashLabel?: string;
}

export interface ResearchRequest {
  id: string;
  type: ResearchType;
  title: string;
  abstract: string;
  researcherName: string;
  department: string;
  tags: string[];
  compensation: ResearchCompensation;
  irbApproved: boolean;
  location: ResearchLocation;
  participantsNeeded?: number;
  createdAt: string;
  // Publication-specific
  aiSummary?: string;
  paperUrl?: string;
  venue?: string;        // e.g. "IEEE S&P 2025", "CHI 2026"
  congratulations?: number;
}

export interface ResearchAppraisalResult {
  credits: number;
  tags: string[];
  rationale: string;
}

export interface Message {
  id: string;
  gigId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}