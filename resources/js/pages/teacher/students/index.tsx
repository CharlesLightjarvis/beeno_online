import { Head, usePage } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import students from '@/routes/teacher/students';
import type { Paginated, Student } from '@/types';
import StudentList from './partials/student-list';

export default function StudentsIndex() {
    const { students: paginatedStudents } = usePage<{
        students: Paginated<Student>;
    }>().props;

    return (
        <>
            <Head title="Étudiants" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Étudiants
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gérez les étudiants qui participeront à vos sessions.
                    </p>
                </div>
                <StudentList students={paginatedStudents} />
            </div>
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Étudiants', href: students.index() },
    ],
};
