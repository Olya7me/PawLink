import { AuthConfigError } from '@/features/auth/api/authApi';
import {
  isSupabaseConfigured,
  supabase,
  type Report,
  type ReportInsert,
  type ReportKind,
} from '@/services/supabase';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthConfigError();
  }
}

export type SubmitReportPayload = {
  reporterId: string;
  kind: ReportKind;
  reason: string;
  body?: string | null;
  animalId?: string | null;
  reportedUserId?: string | null;
};

export async function submitReport(payload: SubmitReportPayload): Promise<Report> {
  assertConfigured();

  const row: ReportInsert = {
    reporter_id: payload.reporterId,
    kind: payload.kind,
    reason: payload.reason,
    body: payload.body?.trim() ? payload.body.trim() : null,
    animal_id: payload.kind === 'listing_report' ? (payload.animalId ?? null) : null,
    reported_user_id: payload.kind === 'user_report' ? (payload.reportedUserId ?? null) : null,
  };

  const { data, error } = await supabase.from('reports').insert(row).select('*').single();

  if (error) {
    throw error;
  }

  return data as Report;
}
