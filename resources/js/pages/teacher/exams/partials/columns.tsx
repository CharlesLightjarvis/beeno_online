import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import exams from '@/routes/teacher/exams';
import type { ExamSummary } from '@/types';

function RowActions({ exam }: { exam: ExamSummary }) {
    const [open, setOpen] = useState(false);

    return <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="size-8 p-0"><span className="sr-only">Actions</span><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={exams.edit(exam.id)}><Pencil />Modifier</Link></DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}><Trash2 />Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu><ConfirmActionDialog open={open} onOpenChange={setOpen} title={`Supprimer « ${exam.title} » ?`} description="L’examen et son contenu seront définitivement supprimés." confirmLabel="Supprimer" onConfirm={(finish) => router.delete(exams.destroy(exam.id).url, { preserveScroll: true, onSuccess: () => setOpen(false), onFinish: finish })} /></>;
}

export const createColumns = (): ColumnDef<ExamSummary>[] => [
    { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="Examen" />, cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: 'level', header: ({ column }) => <DataTableColumnHeader column={column} title="Niveau" /> },
    { accessorKey: 'tasks_count', header: ({ column }) => <DataTableColumnHeader column={column} title="Questions" /> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />, cell: ({ row }) => <Badge variant={row.original.status === 'published' ? 'default' : 'secondary'}>{row.original.status === 'published' ? 'Publié' : 'Brouillon'}</Badge> },
    { accessorKey: 'updated_at', header: ({ column }) => <DataTableColumnHeader column={column} title="Modifié le" />, cell: ({ row }) => new Intl.DateTimeFormat('fr-FR').format(new Date(row.original.updated_at)) },
    { id: 'actions', cell: ({ row }) => <RowActions exam={row.original} /> },
];
