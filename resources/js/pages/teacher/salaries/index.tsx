import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import type { TeacherSalary } from '@/types';
import { createColumns, PAYMENT_STATUS_OPTIONS } from './partials/columns';

export default function TeacherSalariesIndex() {
    const { salaries } = usePage<{ salaries: TeacherSalary[] }>().props;
    const columns = useMemo(() => createColumns(), []);

    return (
        <>
            <Head title="Salaires" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Salaires
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Marquez vos sessions terminées comme payées une fois la
                        rémunération reçue.
                    </p>
                </div>
                <DataTable
                    columns={columns}
                    data={salaries}
                    searchFilter={{
                        columnIds: ['label'],
                        placeholder: 'Rechercher une session...',
                    }}
                    facetedFilters={[
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
