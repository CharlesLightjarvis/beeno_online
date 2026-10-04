import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionSummary } from '@/types';

const statusLabel = { scheduled: 'Planifiée', open: 'Ouverte', closed: 'Clôturée' } as const;

export const createColumns = (): ColumnDef<ExamSessionSummary>[] => [
    { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="Examen" />, cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: 'access_code', header: ({ column }) => <DataTableColumnHeader column={column} title="Code d’accès" />, cell: ({ row }) => <span className="font-mono tracking-widest">{row.original.access_code}</span> },
    { accessorKey: 'participations_count', header: ({ column }) => <DataTableColumnHeader column={column} title="Étudiants" /> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />, cell: ({ row }) => <Badge variant={row.original.status === 'open' ? 'default' : 'secondary'}>{statusLabel[row.original.status]}</Badge> },
    { accessorKey: 'created_at', header: ({ column }) => <DataTableColumnHeader column={column} title="Créée le" />, cell: ({ row }) => new Intl.DateTimeFormat('fr-FR').format(new Date(row.original.created_at)) },
    { id: 'actions', cell: ({ row }) => <Button variant="outline" size="sm" asChild><Link href={examSessions.show(row.original.id)}>Suivre</Link></Button> },
];
