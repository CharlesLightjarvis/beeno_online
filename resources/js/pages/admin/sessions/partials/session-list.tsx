import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import type {
    AdminCourseSession,
    AdminLevelOption,
    AdminOption,
    Paginated,
} from '@/types';
import { createColumns, SESSION_STATUS_OPTIONS } from './columns';

type Props = {
    sessions: Paginated<AdminCourseSession>;
    teachers: AdminOption[];
    levels: AdminLevelOption[];
};

export default function SessionList({ sessions, teachers, levels }: Props) {
    const columns = useMemo(() => createColumns(), []);
    const previous = sessions.links[0]?.url;
    const next = sessions.links[sessions.links.length - 1]?.url;

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={sessions.data}
                enablePagination={false}
                searchFilter={{
                    columnIds: ['label', 'teacher', 'level'],
                    placeholder: 'Rechercher dans cette page...',
                }}
                facetedFilters={[
                    {
                        columnId: 'teacher',
                        title: 'Professeur',
                        options: teachers.map((teacher) => ({
                            value: teacher.id,
                            label: teacher.name,
                        })),
                    },
                    {
                        columnId: 'level',
                        title: 'Niveau',
                        options: levels.map((level) => ({
                            value: level.id,
                            label: level.code,
                        })),
                    },
                    {
                        columnId: 'status',
                        title: 'Statut',
                        options: SESSION_STATUS_OPTIONS,
                    },
                ]}
            />

            {sessions.last_page > 1 && (
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
                        Page {sessions.current_page} / {sessions.last_page}
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
