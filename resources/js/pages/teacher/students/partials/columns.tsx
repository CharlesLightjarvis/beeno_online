import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import students from '@/routes/teacher/students';
import type { Student } from '@/types';

function RowActions({ student }: { student: Student }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={students.edit(student.id)}>
                                <Pencil />
                                Modifier
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDialogOpen(true)}
                        >
                            <Archive />
                            Archiver
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={`Archiver ${student.name} ?`}
                description="L’étudiant ne sera plus proposé dans les nouvelles sessions, mais son historique sera conservé."
                confirmLabel="Archiver"
                onConfirm={(finish) =>
                    router.delete(students.destroy(student.id).url, {
                        preserveScroll: true,
                        onSuccess: () => setDialogOpen(false),
                        onFinish: finish,
                    })
                }
            />
        </>
    );
}

export const createColumns = (): ColumnDef<Student>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom complet" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Adresse e-mail" />
        ),
        cell: ({ row }) => <span>{row.original.email ?? 'Non renseignée'}</span>,
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ajouté le" />
        ),
        cell: ({ row }) =>
            new Intl.DateTimeFormat('fr-FR').format(
                new Date(row.original.created_at),
            ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <RowActions student={row.original} />,
    },
];
