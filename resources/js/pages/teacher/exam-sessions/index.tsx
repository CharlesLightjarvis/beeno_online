import { Head } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionSummary, Paginated } from '@/types';
import ExamSessionList from './partials/exam-session-list';

export default function ExamSessionsIndex({ sessions }: { sessions: Paginated<ExamSessionSummary> }) {
    return (
        <>
            <Head title="Sessions d’examen" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Sessions d’examen</h1>
                    <p className="text-sm text-muted-foreground">Lancez un examen TELC et suivez la progression du groupe.</p>
                </div>
                <ExamSessionList sessions={sessions} />
            </div>
        </>
    );
}

ExamSessionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions d’examen', href: examSessions.index() },
    ],
};
