import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import type { AdminTeacher } from '@/types';
import { createColumns } from './columns';

export default function TeacherList({
    teachers,
}: {
    teachers: AdminTeacher[];
}) {
    const columns = useMemo(() => createColumns(), []);

    return (
        <DataTable
            columns={columns}
            data={teachers}
            enablePagination={false}
            searchFilter={{
                columnIds: ['name'],
                placeholder: 'Rechercher un professeur...',
            }}
        />
    );
}
