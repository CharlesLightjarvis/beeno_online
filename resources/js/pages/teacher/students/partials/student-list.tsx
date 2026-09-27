import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import students from '@/routes/teacher/students';
import type { Paginated, Student } from '@/types';
import { createColumns } from './columns';

export default function StudentList({
    students: paginatedStudents,
}: {
    students: Paginated<Student>;
}) {
    const columns = useMemo(() => createColumns(), []);
    const previous = paginatedStudents.links[0]?.url;
    const next =
        paginatedStudents.links[paginatedStudents.links.length - 1]?.url;

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={paginatedStudents.data}
                searchFilter={{
                    columnIds: ['name'],
                    placeholder: 'Rechercher un étudiant...',
                }}
                actionButton={{
                    label: 'Ajouter un étudiant',
                    onClick: () => router.visit(students.create()),
                }}
            />
            {paginatedStudents.last_page > 1 && (
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
                        Page {paginatedStudents.current_page} /{' '}
                        {paginatedStudents.last_page}
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
