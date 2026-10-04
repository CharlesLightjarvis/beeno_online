import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import exams from '@/routes/teacher/exams';
import type { ExamSummary, Paginated } from '@/types';
import { createColumns } from './columns';

export default function ExamList({ exams: paginatedExams }: { exams: Paginated<ExamSummary> }) {
    const columns = useMemo(() => createColumns(), []);
    const previous = paginatedExams.links[0]?.url;
    const next = paginatedExams.links.at(-1)?.url;

    return <div className="space-y-4"><DataTable columns={columns} data={paginatedExams.data} searchFilter={{ columnIds: ['title', 'status'], placeholder: 'Rechercher un examen…' }} actionButton={{ label: 'Créer un examen', onClick: () => router.visit(exams.create()) }} />{paginatedExams.last_page > 1 && <div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" disabled={!previous} onClick={() => previous && router.visit(previous)}>Précédent</Button><span className="text-sm text-muted-foreground">Page {paginatedExams.current_page} / {paginatedExams.last_page}</span><Button variant="outline" size="sm" disabled={!next} onClick={() => next && router.visit(next)}>Suivant</Button></div>}</div>;
}
