import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    Clock,
    Coins,
    GraduationCap,
    ListChecks,
} from 'lucide-react';
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
import adminRoutes from '@/routes/admin';

type Summary = {
    active_sessions: number;
    completed_sessions: number;
    total_minutes: number;
    remuneration_millimes: number;
};

type RecentSession = {
    id: string;
    label: string;
    status: 'active' | 'completed';
    total_minutes: number;
    progress_percent: number;
    remuneration_millimes: number;
    teacher: { id: string; name: string };
    level: { id: string; code: string; name: string };
};

type Props = {
    summary: Summary;
    recentSessions: RecentSession[];
};

export default function AdminDashboard({ summary, recentSessions }: Props) {
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
            description: 'Toutes les séances enregistrées',
            icon: Clock,
        },
        {
            label: 'Rémunération totale',
            value: formatMoney(summary.remuneration_millimes),
            description: 'Calculée depuis les heures données',
            icon: Coins,
        },
    ];

    return (
        <>
            <Head title="Dashboard admin" />
            <div className="flex flex-col gap-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Vue d’ensemble
                    </h1>
                    <p className="text-muted-foreground">
                        Suivez l’activité de tous les professeurs et groupes.
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

                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                            <CardTitle>Sessions récentes</CardTitle>
                            <CardDescription>
                                Les derniers groupes mis à jour.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link href={adminRoutes.teachers.index()}>
                                    <GraduationCap data-icon="inline-start" />
                                    Professeurs
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={adminRoutes.sessions.index()}>
                                    Toutes les sessions
                                    <ArrowRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Professeur</TableHead>
                                    <TableHead>Niveau</TableHead>
                                    <TableHead>Progression</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Aucune session enregistrée.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={adminRoutes.sessions.show(
                                                        session.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {session.label}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {session.teacher.name}
                                            </TableCell>
                                            <TableCell>
                                                {session.level.code}
                                            </TableCell>
                                            <TableCell>
                                                {session.progress_percent.toLocaleString(
                                                    'fr-FR',
                                                )}{' '}
                                                %
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        session.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {session.status === 'active'
                                                        ? 'Active'
                                                        : 'Terminée'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: adminRoutes.dashboard(),
        },
    ],
};
