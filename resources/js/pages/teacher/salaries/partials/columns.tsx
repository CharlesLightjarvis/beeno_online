import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BadgeCheck,
    BanknoteIcon,
    History,
    MoreHorizontal,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import InputError from '@/components/input-error';
import { PaymentHistoryDialog } from '@/components/payment-history-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import salaries from '@/routes/teacher/salaries';
import type { PaymentStatus, TeacherSalary } from '@/types';

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

function PartialPaymentDialog({
    salary,
    open,
    onOpenChange,
}: {
    salary: TeacherSalary;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const parsedMillimes = Math.round(
        Number.parseFloat(amount.replace(',', '.')) * 1000,
    );
    const isValid =
        Number.isFinite(parsedMillimes) &&
        parsedMillimes >= 1 &&
        parsedMillimes <= salary.remaining_millimes;

    const submit = () => {
        if (!isValid) {
            return;
        }

        setProcessing(true);
        setError(undefined);
        router.post(
            salaries.markPartiallyPaid(salary.id).url,
            { amount_millimes: parsedMillimes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAmount('');
                    onOpenChange(false);
                },
                onError: (errors) =>
                    setError(
                        errors.amount_millimes ??
                            'Le versement n’a pas pu être enregistré.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enregistrer un versement</DialogTitle>
                    <DialogDescription>
                        Session « {salary.label} » — restant dû :{' '}
                        {formatMoney(salary.remaining_millimes)}. Les versements
                        s’additionnent.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="partial-amount">Montant versé (DT) *</Label>
                    <Input
                        id="partial-amount"
                        type="number"
                        min="0.001"
                        max={salary.remaining_millimes / 1000}
                        step="0.001"
                        inputMode="decimal"
                        value={amount}
                        autoFocus
                        onChange={(event) => setAmount(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                submit();
                            }
                        }}
                    />
                    <InputError message={error} />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        disabled={processing || !isValid}
                        onClick={submit}
                    >
                        {processing && <Spinner className="mr-2" />}
                        Enregistrer le versement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RowActions({ salary }: { salary: TeacherSalary }) {
    const [confirmAction, setConfirmAction] = useState<
        'paid' | 'unpaid' | null
    >(null);
    const [partialOpen, setPartialOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const isPaid = salary.payment_status === 'paid';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
                            <History />
                            Historique des versements
                        </DropdownMenuItem>
                        {!isPaid && (
                            <DropdownMenuItem
                                variant="default"
                                onSelect={() => setConfirmAction('paid')}
                            >
                                <BadgeCheck />
                                Marquer payé
                            </DropdownMenuItem>
                        )}
                        {!isPaid && salary.remaining_millimes > 0 && (
                            <DropdownMenuItem
                                onSelect={() => setPartialOpen(true)}
                            >
                                <BanknoteIcon />
                                Enregistrer un versement
                            </DropdownMenuItem>
                        )}
                        {isPaid && (
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setConfirmAction('unpaid')}
                            >
                                <RotateCcw />
                                Marquer impayé
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                    {!isPaid && salary.paid_millimes > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setConfirmAction('unpaid')}
                            >
                                <RotateCcw />
                                Réinitialiser (impayé)
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmActionDialog
                open={confirmAction === 'paid'}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={`Marquer « ${salary.label} » comme payée ?`}
                description={`Le montant total de ${formatMoney(salary.salary_millimes)} sera considéré comme versé.`}
                confirmLabel="Marquer payé"
                onConfirm={(finish) =>
                    router.post(
                        salaries.markPaid(salary.id).url,
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () => setConfirmAction(null),
                            onFinish: finish,
                        },
                    )
                }
            />
            <ConfirmActionDialog
                open={confirmAction === 'unpaid'}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={`Marquer « ${salary.label} » comme impayée ?`}
                description="Les versements déjà enregistrés seront remis à zéro."
                confirmLabel="Marquer impayé"
                onConfirm={(finish) =>
                    router.post(
                        salaries.markUnpaid(salary.id).url,
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () => setConfirmAction(null),
                            onFinish: finish,
                        },
                    )
                }
            />
            <PartialPaymentDialog
                salary={salary}
                open={partialOpen}
                onOpenChange={setPartialOpen}
            />
            <PaymentHistoryDialog
                salary={salary}
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                onDelete={(payment) =>
                    router.delete(
                        salaries.deletePayment({
                            session: salary.id,
                            payment: payment.id,
                        }).url,
                        { preserveScroll: true },
                    )
                }
            />
        </>
    );
}

export const createColumns = (): ColumnDef<TeacherSalary>[] => [
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
        accessorKey: 'completed_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Clôturée le" />
        ),
        cell: ({ row }) =>
            row.original.completed_at
                ? new Intl.DateTimeFormat('fr-FR').format(
                      new Date(`${row.original.completed_at}T00:00:00`),
                  )
                : '—',
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
        cell: ({ row }) => <RowActions salary={row.original} />,
    },
];

function formatHours(minutes: number): string {
    return `${(minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    })} h`;
}

function formatMoney(millimes: number): string {
    return `${(millimes / 1000).toLocaleString('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })} DT`;
}
