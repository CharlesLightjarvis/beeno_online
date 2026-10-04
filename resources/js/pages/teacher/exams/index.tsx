import { Head } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import exams from '@/routes/teacher/exams';
import type { ExamSummary, Paginated } from '@/types';
import ExamList from './partials/exam-list';

export default function ExamsIndex({ exams: paginatedExams }: { exams: Paginated<ExamSummary> }) {
    return <><Head title="Examens" /><div className="flex h-full flex-1 flex-col gap-6 p-4"><div><h1 className="text-2xl font-semibold tracking-tight">Examens</h1><p className="text-sm text-muted-foreground">Créez et gérez vos examens TELC Deutsch A1 – Lesen.</p></div><ExamList exams={paginatedExams} /></div></>;
}

ExamsIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: teacher.dashboard() }, { title: 'Examens', href: exams.index() }] };
