import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import adminRoutes from '@/routes/admin';
import type {
    AdminCourseSessionDetail,
    AdminOption,
    Lesson,
    SessionMetrics,
} from '@/types';
import AdminLessonHistory from './partials/lesson-history';

type Props = {
    session: AdminCourseSessionDetail;
    students: AdminOption[];
    lessons: Lesson[];
    metrics: SessionMetrics;
};

export default function AdminSessionShow({
    session,
    students,
    lessons,
    metrics,
}: Props) {
    return (
        <>
            <Head title={`${session.label} — Administration`} />
            <div className="flex flex-col gap-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {session.label}
                        </h1>
                        <p className="text-muted-foreground">
                            {session.teacher.name} · {session.level.code} —{' '}
                            {session.level.name}
                        </p>
                    </div>
                    <Badge
                        variant={
                            session.status === 'active'
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {session.status === 'active' ? 'Active' : 'Terminée'}
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Heures"
                        value={`${formatHours(metrics.total_minutes)} h`}
                        description={`Objectif : ${formatHours(session.target_minutes)} h`}
                    />
                    <MetricCard
                        title="Progression"
                        value={`${metrics.progress_percent.toLocaleString('fr-FR')} %`}
                        description="Calculée depuis les séances"
                    />
                    <MetricCard
                        title="Rémunération"
                        value={formatMoney(metrics.remuneration_millimes)}
                        description="Selon le tarif de la session"
                    />
                    <MetricCard
                        title="Étudiants"
                        value={students.length.toLocaleString('fr-FR')}
                        description={
                            students.length === 0
                                ? 'Aucun étudiant inscrit'
                                : students
                                      .map((student) => student.name)
                                      .join(', ')
                        }
                    />
                </div>

                <Separator />
                <section className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Historique des séances
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Cliquez sur une séance pour voir les présences.
                        </p>
                    </div>
                    <AdminLessonHistory lessons={lessons} />
                </section>
            </div>
        </>
    );
}

function MetricCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="truncate">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function formatHours(minutes: number): string {
    return (minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    });
}

function formatMoney(millimes: number): string {
    return `${(millimes / 1000).toLocaleString('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    })} DT`;
}

AdminSessionShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: adminRoutes.dashboard() },
        { title: 'Sessions', href: '/admin/sessions' },
        { title: 'Détail', href: '/admin/sessions' },
    ],
};
