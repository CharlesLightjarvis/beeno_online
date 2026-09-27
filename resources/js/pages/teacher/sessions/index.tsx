import { Head, usePage } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import type { CourseSession, Paginated } from '@/types';
import SessionList from './partials/session-list';

export default function SessionsIndex() {
    const { sessions: paginatedSessions } = usePage<{
        sessions: Paginated<CourseSession>;
    }>().props;

    return (
        <>
            <Head title="Sessions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sessions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Créez vos groupes et suivez les sous-niveaux en cours.
                    </p>
                </div>
                <SessionList sessions={paginatedSessions} />
            </div>
        </>
    );
}

SessionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
    ],
};
