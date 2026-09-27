import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Archive,
    ArrowRight,
    CalendarCheck,
    ListChecks,
    MoreHorizontal,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import sessions from '@/routes/teacher/sessions';
import attendances from '@/routes/teacher/sessions/attendances';
import type { CourseSession } from '@/types';

function RowActions({ session }: { session: CourseSession }) {
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
                            <Link href={sessions.show(session.id)}>
                                <ListChecks />
                                Voir les séances
                            </Link>
                        </DropdownMenuItem>
                        {session.can_create_next_session && (
                            <DropdownMenuItem asChild>
                                <Link href={sessions.next.create(session.id)}>
                                    <ArrowRight />
                                    Créer la session suivante
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {session.status === 'active' && (
                            <DropdownMenuItem asChild>
                                <Link href={attendances.create(session.id)}>
                                    <CalendarCheck />
                                    Prendre les présences
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link href={sessions.edit(session.id)}>
                                <Pencil />
                                Modifier
                            </Link>
                        </DropdownMenuItem>
                        {session.status === 'active' && (
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDialogOpen(true)}
                            >
                                <Archive />
                                Clôturer
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={`Clôturer ${session.label} ?`}
                description="La session restera consultable, mais aucune nouvelle séance ne pourra y être ajoutée."
                confirmLabel="Clôturer"
                onConfirm={(finish) =>
                    router.delete(sessions.destroy(session.id).url, {
                        preserveScroll: true,
                        onSuccess: () => setDialogOpen(false),
                        onFinish: finish,
                    })
                }
            />
        </>
    );
}

export const createColumns = (): ColumnDef<CourseSession>[] => [
    {
        accessorKey: 'label',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Session" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.label}</span>
        ),
    },
    {
        id: 'level',
        accessorFn: (session) => session.level.code,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Sous-niveau" />
        ),
    },
    {
        accessorKey: 'starts_on',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Début" />
        ),
        cell: ({ row }) =>
            new Intl.DateTimeFormat('fr-FR').format(
                new Date(`${row.original.starts_on}T00:00:00`),
            ),
    },
    {
        accessorKey: 'students_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Étudiants" />
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Statut" />
        ),
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.status === 'active' ? 'default' : 'secondary'
                }
            >
                {row.original.status === 'active' ? 'Active' : 'Terminée'}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <RowActions session={row.original} />,
    },
];
