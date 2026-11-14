/**
 * Shared domain type stubs for documentation alignment.
 * Expand when implementing features — see docs/DATABASE_SCHEMA.md.
 */

export type HelpRequestStatus =
  | 'open'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AnimalSpecies = 'dog' | 'cat' | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type HelpType =
  | 'catch'
  | 'transport'
  | 'vet'
  | 'foster'
  | 'permanent_home'
  | 'food'
  | 'other';
