import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import sessions from '@/routes/teacher/sessions';
import type { CourseSession, Paginated } from '@/types';
import { createColumns } from './columns';

export default function SessionList({
    sessions: paginatedSessions,
}: {
    sessions: Paginated<CourseSession>;
}) {
    const columns = useMemo(() => createColumns(), []);
    const previous = paginatedSessions.links[0]?.url;
    const next =
        paginatedSessions.links[paginatedSessions.links.length - 1]?.url;

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={paginatedSessions.data}
                searchFilter={{
                    columnIds: ['label', 'level'],
                    placeholder: 'Rechercher une session...',
                }}
                actionButton={{
                    label: 'Créer une session',
                    onClick: () => router.visit(sessions.create()),
                }}
            />
            {paginatedSessions.last_page > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!previous}
                        onClick={() => previous && router.visit(previous)}
                    >
                        Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {paginatedSessions.current_page} /{' '}
                        {paginatedSessions.last_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!next}
                        onClick={() => next && router.visit(next)}
                    >
                        Suivant
                    </Button>
                </div>
            )}
        </div>
    );
}
