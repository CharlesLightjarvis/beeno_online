import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CalendarRange } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import type { AdminTeacher } from '@/types';

export const createColumns = (): ColumnDef<AdminTeacher>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Professeur" />
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'active_sessions_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Sessions actives" />
        ),
    },
    {
        accessorKey: 'completed_sessions_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Sessions terminées" />
        ),
    },
    {
        id: 'hours',
        accessorFn: (teacher) => teacher.total_minutes,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Heures enseignées" />
        ),
        cell: ({ row }) => `${formatHours(row.original.total_minutes)} h`,
    },
    {
        accessorKey: 'lessons_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Séances" />
        ),
    },
    {
        accessorKey: 'remuneration_millimes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rémunération" />
        ),
        cell: ({ row }) => formatMoney(row.original.remuneration_millimes),
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" asChild>
                <Link href={row.original.sessions_url}>
                    <CalendarRange data-icon="inline-start" />
                    Sessions
                </Link>
            </Button>
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
