import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import type {
    CourseSessionDetail,
    Lesson,
    SessionMetrics,
    SessionStudentOption,
} from '@/types';
import LessonHistory from './partials/lesson-history';

type Props = {
    session: CourseSessionDetail;
    students: SessionStudentOption[];
    lessons: Lesson[];
    metrics: SessionMetrics;
};

export default function SessionShow({ session, lessons, metrics }: Props) {
    const hours = (metrics.total_minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    });
    const targetHours = (session.target_minutes / 60).toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
    });
    const remuneration = (metrics.remuneration_millimes / 1000).toLocaleString(
        'fr-TN',
        { minimumFractionDigits: 3, maximumFractionDigits: 3 },
    );

    return (
        <>
            <Head title={session.label} />
            <div className="container mx-auto space-y-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {session.label}
                        </h1>
                        <p className="text-muted-foreground">
                            {session.level.code} — {session.level.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {session.can_create_next_session && (
                            <Button asChild>
                                <Link href={sessions.next.create(session.id)}>
                                    <ArrowRight data-icon="inline-start" />
                                    Créer la session suivante
                                </Link>
                            </Button>
                        )}
                        <Badge
                            variant={
                                session.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {session.status === 'active'
                                ? 'Active'
                                : 'Terminée'}
                        </Badge>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Metric
                        label="Heures"
                        value={`${hours} h / ${targetHours} h`}
                    />
                    <Metric
                        label="Progression"
                        value={`${metrics.progress_percent} %`}
                    />
                    <Metric label="Rémunération" value={`${remuneration} DT`} />
                </div>
                <Separator />
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Historique des séances
                    </h2>
                    <LessonHistory lessons={lessons} sessionId={session.id} />
                </section>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

SessionShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
        { title: 'Détail', href: sessions.index() },
    ],
};
