import type { ColumnDef } from '@tanstack/react-table';
import { History } from 'lucide-react';
import { useState } from 'react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { PaymentHistoryDialog } from '@/components/payment-history-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminSalary, PaymentStatus } from '@/types';

export const PAYMENT_STATUS_OPTIONS = [
    { label: 'Impayé', value: 'unpaid' },
    { label: 'Partiellement payé', value: 'partially_paid' },
    { label: 'Payé', value: 'paid' },
] as const;

export function paymentStatusBadgeVariant(status: PaymentStatus) {
    if (status === 'paid') {
        return 'default' as const;
    }

    if (status === 'partially_paid') {
        return 'secondary' as const;
    }

    return 'destructive' as const;
}

export function paymentStatusLabel(status: PaymentStatus): string {
    if (status === 'paid') {
        return 'Payé';
    }

    if (status === 'partially_paid') {
        return 'Partiellement payé';
    }

    return 'Impayé';
}

export const createColumns = (): ColumnDef<AdminSalary>[] => [
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
        id: 'teacher_name',
        accessorFn: (salary) => salary.teacher_name,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Professeur" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: 'completed_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Clôturée le" />
        ),
        cell: ({ row }) => formatDate(row.original.completed_at),
    },
    {
        accessorKey: 'lessons_count',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Séances" />
        ),
    },
    {
        id: 'hours',
        accessorFn: (salary) => salary.total_minutes,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Heures" />
        ),
        cell: ({ row }) => formatHours(row.original.total_minutes),
    },
    {
        accessorKey: 'salary_millimes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Salaire" />
        ),
        cell: ({ row }) => formatMoney(row.original.salary_millimes),
    },
    {
        accessorKey: 'paid_millimes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Payé" />
        ),
        cell: ({ row }) => formatMoney(row.original.paid_millimes),
    },
    {
        accessorKey: 'remaining_millimes',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Restant" />
        ),
        cell: ({ row }) => formatMoney(row.original.remaining_millimes),
    },
    {
        accessorKey: 'payment_status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Statut" />
        ),
        filterFn: (row, id, value: string[]) =>
            value.includes(String(row.getValue(id))),
        cell: ({ row }) => (
            <Badge
                variant={paymentStatusBadgeVariant(row.original.payment_status)}
            >
                {paymentStatusLabel(row.original.payment_status)}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <AdminRowActions salary={row.original} />,
    },
];

function AdminRowActions({ salary }: { salary: AdminSalary }) {
    const [historyOpen, setHistoryOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-muted-foreground"
                onClick={() => setHistoryOpen(true)}
            >
                <History />
                Historique
            </Button>
            <PaymentHistoryDialog
                salary={salary}
                open={historyOpen}
                onOpenChange={setHistoryOpen}
            />
        </>
    );
}

export function formatDate(date: string | null): string {
    return date
        ? new Intl.DateTimeFormat('fr-FR').format(new Date(`${date}T00:00:00`))
        : '—';
}

export function formatHours(minutes: number): string {
    return `${(minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    })} h`;
}

export function formatMoney(millimes: number): string {
    return `${(millimes / 1000).toLocaleString('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })} DT`;
}
