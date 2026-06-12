import type { FieldValue } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

// ─── Shared Goal Types ────────────────────────────────────────────────────────

export interface Preset {
  label: 'Good' | 'Great' | 'Elite' | 'Perfect' | 'Grandmaster' | 'Godlike';
  score: number;
  description: string;
  isProOnly?: boolean;
}

export const PRESETS: Preset[] = [
  { label: 'Good', score: 75, description: 'A solid, consistent contributor' },
  { label: 'Great', score: 85, description: 'High output with strong collaboration' },
  { label: 'Elite', score: 95, description: 'Top tier across all dimensions' },
  { label: 'Perfect', score: 100, description: 'Maximum activity across every dimension' },
];

export interface GoalDocument {
  id?: string;
  userId: string;
  targetScore: number;
  targetLabel: string;
  scoreAtCreation: number;
  dimensionGapsAtCreation: Array<{
    dimension?: string;
    name?: string;
    current?: string | number;
    currentValue?: string | number;
    required?: string | number;
    requiredValue?: string | number;
    gap?: string | number;
    difference?: string | number;
  }>;
  weeklyActions: string[];
  timeframeWeeks: number;
  geminiSummary: string;
  status: 'active' | 'achieved' | 'abandoned';
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  achievedAt: Date | Timestamp | FieldValue | null;
  invitedUsers: string[];
  isProOnly?: boolean;
}
