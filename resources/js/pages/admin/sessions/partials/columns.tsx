import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';
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
import type { AdminCourseSession } from '@/types';

export const SESSION_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Terminée', value: 'completed' },
] as const;

export const createColumns = (): ColumnDef<AdminCourseSession>[] => [
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
        id: 'teacher',
        accessorFn: (session) => session.teacher.name,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Professeur" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(row.original.teacher.id),
    },
    {
        id: 'level',
        accessorFn: (session) => session.level.code,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Niveau" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(row.original.level.id),
    },
    {
        accessorKey: 'students_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Étudiants" />
        ),
    },
    {
        id: 'hours',
        accessorFn: (session) => session.total_minutes,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Heures" />
        ),
        cell: ({ row }) =>
            `${formatHours(row.original.total_minutes)} / ${formatHours(row.original.target_minutes)} h`,
    },
    {
        accessorKey: 'progress_percent',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Progression" />
        ),
        cell: ({ row }) =>
            `${row.original.progress_percent.toLocaleString('fr-FR')} %`,
    },
    {
        accessorKey: 'remuneration_millimes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rémunération" />
        ),
        cell: ({ row }) => formatMoney(row.original.remuneration_millimes),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Statut" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(String(row.getValue(id))),
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
        cell: ({ row }) => (
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
                            <Link href={`/admin/sessions/${row.original.id}`}>
                                <Eye />
                                Consulter
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

function formatHours(minutes: number): string {
    return (minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    });
}

function formatMoney(millimes: number): string {
    return `${(millimes / 1000).toLocaleString('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })} DT`;
}
