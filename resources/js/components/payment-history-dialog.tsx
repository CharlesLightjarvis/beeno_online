import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { SessionPayment } from '@/types';

type PaymentHistorySalary = {
    label: string;
    salary_millimes: number;
    payments: SessionPayment[];
};

type PaymentHistoryDialogProps = {
    salary: PaymentHistorySalary;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** When provided, each payment row shows a delete action. */
    onDelete?: (payment: SessionPayment) => void;
};

export function PaymentHistoryDialog({
    salary,
    open,
    onOpenChange,
    onDelete,
}: PaymentHistoryDialogProps) {
    const [paymentToDelete, setPaymentToDelete] =
        useState<SessionPayment | null>(null);
    const paidTotal = salary.payments.reduce(
        (sum, payment) => sum + payment.amount_millimes,
        0,
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Historique des versements</DialogTitle>
                        <DialogDescription>
                            Session « {salary.label} » — salaire total :{' '}
                            {formatMoney(salary.salary_millimes)}.
                        </DialogDescription>
                    </DialogHeader>
                    {salary.payments.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Aucun versement enregistré pour cette session.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">
                                            Montant
                                        </TableHead>
                                        {onDelete && <TableHead />}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salary.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {formatDate(payment.paid_on)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatMoney(
                                                    payment.amount_millimes,
                                                )}
                                            </TableCell>
                                            {onDelete && (
                                                <TableCell className="w-10 text-right">
                                                    <button
                                                        type="button"
                                                        className="text-muted-foreground transition-colors hover:text-destructive"
                                                        aria-label="Supprimer ce versement"
                                                        onClick={() =>
                                                            setPaymentToDelete(
                                                                payment,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {salary.payments.length > 0 && (
                        <DialogFooter className="sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Total versé :{' '}
                                <span className="font-medium text-foreground">
                                    {formatMoney(paidTotal)}
                                </span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Restant :{' '}
                                <span className="font-medium text-foreground">
                                    {formatMoney(
                                        Math.max(
                                            0,
                                            salary.salary_millimes - paidTotal,
                                        ),
                                    )}
                                </span>
                            </span>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
            {onDelete && paymentToDelete && (
                <ConfirmActionDialog
                    open={paymentToDelete !== null}
                    onOpenChange={(dialogOpen) =>
                        !dialogOpen && setPaymentToDelete(null)
                    }
                    title={`Supprimer le versement du ${formatDate(paymentToDelete.paid_on)} ?`}
                    description={`Le versement de ${formatMoney(paymentToDelete.amount_millimes)} sera retiré de la session « ${salary.label} » et le statut de paiement sera recalculé.`}
                    confirmLabel="Supprimer"
                    onConfirm={(finish) => {
                        onDelete(paymentToDelete);
                        setPaymentToDelete(null);
                        finish();
                    }}
                />
            )}
        </>
    );
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR').format(
        new Date(`${date}T00:00:00`),
    );
}

function formatMoney(millimes: number): string {
    return `${(millimes / 1000).toLocaleString('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })} DT`;
}
