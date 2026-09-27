import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminSalary, AdminSalarySummary } from '@/types';
import {
    createColumns,
    formatMoney,
    PAYMENT_STATUS_OPTIONS,
} from './partials/columns';

export default function AdminSalariesIndex() {
    const { salaries, summary } = usePage<{
        salaries: AdminSalary[];
        summary: AdminSalarySummary;
    }>().props;
    const columns = useMemo(() => createColumns(), []);

    const cards = [
        {
            label: 'Total des salaires',
            value: formatMoney(summary.total_millimes),
        },
        {
            label: 'Total payé',
            value: formatMoney(summary.paid_millimes),
        },
        {
            label: 'Restant à payer',
            value: formatMoney(summary.remaining_millimes),
        },
    ];

    return (
        <>
            <Head title="Salaires — Administration" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Salaires
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez les rémunérations des sessions terminées, les
                        montants versés et le restant à payer.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {cards.map((card) => (
                        <Card key={card.label}>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">
                                    {card.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <DataTable
                    columns={columns}
                    data={salaries}
                    searchFilter={{
                        columnIds: ['label', 'teacher_name'],
                        placeholder:
                            'Rechercher une session ou un professeur...',
                    }}
                    facetedFilters={[
                        {
                            columnId: 'teacher_name',
                            title: 'Professeur',
                            options: teacherOptions(salaries),
                        },
                        {
                            columnId: 'payment_status',
                            title: 'Statut',
                            options: PAYMENT_STATUS_OPTIONS,
                        },
                    ]}
                />
            </div>
        </>
    );
}

function teacherOptions(salaries: AdminSalary[]) {
    return Array.from(
        new Map(
            salaries.map((salary) => [
                salary.teacher_name,
                salary.teacher_name,
            ]),
        ).entries(),
    ).map(([name]) => ({ label: name, value: name }));
}
