import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionSummary, Paginated } from '@/types';
import { createColumns } from './columns';

export default function ExamSessionList({ sessions }: { sessions: Paginated<ExamSessionSummary> }) {
    const columns = useMemo(() => createColumns(), []);
    const previous = sessions.links[0]?.url;
    const next = sessions.links.at(-1)?.url;

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={sessions.data}
                searchFilter={{ columnIds: ['title', 'status', 'access_code'], placeholder: 'Rechercher une session…' }}
                actionButton={{ label: 'Lancer une session', onClick: () => router.visit(examSessions.create()) }}
            />
            {sessions.last_page > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && router.visit(previous)}>Précédent</Button>
                    <span className="text-sm text-muted-foreground">Page {sessions.current_page} / {sessions.last_page}</span>
                    <Button variant="outline" size="sm" disabled={!next} onClick={() => next && router.visit(next)}>Suivant</Button>
                </div>
            )}
        </div>
    );
}
