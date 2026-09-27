import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    Clock,
    Coins,
    ListChecks,
} from 'lucide-react';
import { ProgressBar } from '@/components/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import type {
    TeacherDashboardLesson,
    TeacherDashboardSession,
    TeacherDashboardSummary,
} from '@/types';

type Props = {
    summary: TeacherDashboardSummary;
    activeSessions: TeacherDashboardSession[];
    recentLessons: TeacherDashboardLesson[];
};

export default function TeacherDashboard({
    summary,
    activeSessions,
    recentLessons,
}: Props) {
    const metrics = [
        {
            label: 'Sessions actives',
            value: summary.active_sessions.toLocaleString('fr-FR'),
            description: 'Groupes actuellement en cours',
            icon: CalendarCheck,
        },
        {
            label: 'Sessions terminées',
            value: summary.completed_sessions.toLocaleString('fr-FR'),
            description: 'Historique des groupes clôturés',
            icon: ListChecks,
        },
        {
            label: 'Heures enseignées',
            value: `${formatHours(summary.total_minutes)} h`,
            description: 'Toutes vos séances cumulées',
            icon: Clock,
        },
        {
            label: 'Ma rémunération',
            value: formatMoney(summary.remuneration_millimes),
            description: 'Calculée depuis les heures données',
            icon: Coins,
        },
    ];

    return (
        <>
            <Head title="Tableau de bord" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Tableau de bord
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Suivez vos sessions, vos heures et votre rémunération.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Card key={metric.label}>
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-3">
                                        <CardTitle>{metric.label}</CardTitle>
                                        <Icon className="text-muted-foreground" />
                                    </div>
                                    <CardDescription>
                                        {metric.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-semibold">
                                        {metric.value}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Mes sessions actives</CardTitle>
                                <CardDescription>
                                    Avancement des groupes en cours.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={sessions.index()}>
                                    Toutes
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Session</TableHead>
                                        <TableHead>Étudiants</TableHead>
                                        <TableHead>Heures</TableHead>
                                        <TableHead>Progression</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeSessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                <div className="flex flex-col items-center gap-3">
                                                    <span>
                                                        Aucune session active.
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={sessions.create()}
                                                        >
                                                            Créer une session
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activeSessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={sessions.show(
                                                            session.id,
                                                        )}
                                                        className="hover:underline"
                                                    >
                                                        {session.label}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {session.students_count}
                                                </TableCell>
                                                <TableCell>
                                                    {formatHours(
                                                        session.total_minutes,
                                                    )}{' '}
                                                    /{' '}
                                                    {formatHours(
                                                        session.target_minutes,
                                                    )}{' '}
                                                    h
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <ProgressBar
                                                            value={
                                                                session.progress_percent
                                                            }
                                                            className="w-20"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {session.progress_percent.toLocaleString(
                                                                'fr-FR',
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <CardTitle>Dernières séances</CardTitle>
                                <CardDescription>
                                    Les cours enregistrés récemment.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">
                                {summary.lessons_count} au total
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Session</TableHead>
                                        <TableHead>Durée</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLessons.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Aucune séance enregistrée.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentLessons.map((lesson) => (
                                            <TableRow key={lesson.id}>
                                                <TableCell className="font-medium">
                                                    {formatDate(lesson.held_on)}
                                                    {lesson.starts_at && (
                                                        <span className="text-muted-foreground">
                                                            {' '}
                                                            · {lesson.starts_at}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={sessions.show(
                                                            lesson.session_id,
                                                        )}
                                                        className="hover:underline"
                                                    >
                                                        {lesson.session_label}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {formatHours(
                                                        lesson.duration_minutes,
                                                    )}{' '}
                                                    h
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
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

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR').format(
        new Date(`${date}T00:00:00`),
    );
}

TeacherDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: teacher.dashboard() }],
};
