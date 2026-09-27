import { Head } from '@inertiajs/react';
import adminRoutes from '@/routes/admin';
import type {
    AdminCourseSession,
    AdminLevelOption,
    AdminOption,
    Paginated,
} from '@/types';
import SessionList from './partials/session-list';

type Props = {
    sessions: Paginated<AdminCourseSession>;
    teachers: AdminOption[];
    levels: AdminLevelOption[];
};

export default function AdminSessionsIndex(props: Props) {
    return (
        <>
            <Head title="Sessions — Administration" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sessions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Consultez l’avancement et la rémunération de tous les
                        groupes.
                    </p>
                </div>
                <SessionList {...props} />
            </div>
        </>
    );
}

AdminSessionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: adminRoutes.dashboard() },
        { title: 'Sessions', href: '/admin/sessions' },
    ],
};
