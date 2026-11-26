-- Align project_submissions.status CHECK constraint with TypeScript SubmissionStatus ('peninjauan' instead of 'ditinjau').
alter table public.project_submissions
  drop constraint if exists project_submissions_status_check;

update public.project_submissions
  set status = 'peninjauan'
  where status = 'ditinjau';

alter table public.project_submissions
  add constraint project_submissions_status_check
  check (status in ('terkirim', 'peninjauan', 'perlu-revisi', 'revisi-terkirim', 'diterima', 'ditolak', 'ditarik'));
