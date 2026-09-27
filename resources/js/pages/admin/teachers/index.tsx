import { Head } from '@inertiajs/react';
import adminRoutes from '@/routes/admin';
import type { AdminTeacher } from '@/types';
import TeacherList from './partials/teacher-list';

export default function AdminTeachersIndex({
    teachers,
}: {
    teachers: AdminTeacher[];
}) {
    return (
        <>
            <Head title="Professeurs — Administration" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Professeurs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez les heures et la rémunération cumulées de
                        chaque professeur.
                    </p>
                </div>
                <TeacherList teachers={teachers} />
            </div>
        </>
    );
}

AdminTeachersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: adminRoutes.dashboard() },
        { title: 'Professeurs', href: adminRoutes.teachers.index() },
    ],
};
