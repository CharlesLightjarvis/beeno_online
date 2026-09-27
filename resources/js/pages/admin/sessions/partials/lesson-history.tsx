import type { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';

const columns: ColumnDef<Lesson>[] = [
    {
        accessorKey: 'held_on',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-medium">
                <ChevronRight
                    className={cn(
                        'transition-transform',
                        row.getIsExpanded() && 'rotate-90',
                    )}
                />
                {new Intl.DateTimeFormat('fr-FR').format(
                    new Date(`${row.original.held_on}T00:00:00`),
                )}
            </div>
        ),
    },
    {
        accessorKey: 'starts_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Heure" />
        ),
        cell: ({ row }) => row.original.starts_at?.slice(0, 5) ?? '—',
    },
    {
        accessorKey: 'duration_minutes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Durée" />
        ),
        cell: ({ row }) =>
            `${(row.original.duration_minutes / 60).toLocaleString('fr-FR', {
                maximumFractionDigits: 2,
            })} h`,
    },
    {
        accessorKey: 'present_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Présents" />
        ),
    },
    {
        accessorKey: 'absent_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Absents" />
        ),
    },
];

export default function AdminLessonHistory({ lessons }: { lessons: Lesson[] }) {
    return (
        <DataTable
            columns={columns}
            data={lessons}
            enablePagination={false}
            onRowClick={(row) => row.toggleExpanded()}
            renderSubComponent={({ row }) => (
                <AttendanceDetails lesson={row.original} />
            )}
        />
    );
}

function AttendanceDetails({ lesson }: { lesson: Lesson }) {
    if (lesson.attendances.length === 0) {
        return (
            <p className="p-6 text-center text-sm text-muted-foreground">
                Aucune présence enregistrée pour cette séance.
            </p>
        );
    }

    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Étudiant</TableHead>
                        <TableHead className="text-right">Présence</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lesson.attendances.map((attendance) => (
                        <TableRow key={attendance.id}>
                            <TableCell className="font-medium">
                                {attendance.student.name}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge
                                    variant={
                                        attendance.status === 'present'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {attendance.status === 'present'
                                        ? 'Présent'
                                        : 'Absent'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
