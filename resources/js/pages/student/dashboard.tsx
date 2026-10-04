import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ClipboardCheck, ListChecks, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import student from '@/routes/student';
import examSessions from '@/routes/student/exam-sessions';

type RecentExam = {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    session_status: 'scheduled' | 'open' | 'closed';
};

type Props = {
    summary: { total: number; in_progress: number; completed: number };
    recentExams: RecentExam[];
};

const participationLabels = {
    pending: 'À commencer',
    in_progress: 'En cours',
    completed: 'Terminée',
} as const;

export default function StudentDashboard({ summary, recentExams }: Props) {
    return (
        <>
            <Head title="Tableau de bord" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Mon tableau de bord</h1>
                        <p className="text-sm text-muted-foreground">Retrouvez vos examens TELC et suivez votre progression.</p>
                    </div>
                    <Button asChild>
                        <Link href={examSessions.index()}>
                            Mes examens <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard title="Examens au total" value={summary.total} description="Vos participations" icon={ClipboardCheck} />
                    <SummaryCard title="En cours" value={summary.in_progress} description="Examens commencés" icon={PlayCircle} />
                    <SummaryCard title="Terminés" value={summary.completed} description="Examens complétés" icon={ListChecks} />
                </div>

                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Activité récente</CardTitle>
                            <CardDescription>Vos dernières sessions d’examen.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={examSessions.index()}>Tout voir</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentExams.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <ClipboardCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
                                <p className="font-medium">Aucun examen pour le moment</p>
                                <p className="mt-1 text-sm text-muted-foreground">Votre professeur vous donnera un code pour rejoindre une session.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentExams.map((exam) => (
                                    <div key={exam.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{exam.title}</p>
                                            <p className="text-sm text-muted-foreground">TELC Deutsch A1 · Lesen</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={exam.status === 'completed' ? 'secondary' : 'outline'}>{participationLabels[exam.status]}</Badge>
                                            {exam.status === 'in_progress' && exam.session_status === 'open' && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={examSessions.show(exam.id)}>Ouvrir</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function SummaryCard({ title, value, description, icon: Icon }: { title: string; value: number; description: string; icon: typeof ClipboardCheck }) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-semibold">{value.toLocaleString('fr-FR')}</p>
                <CardDescription className="mt-1">{description}</CardDescription>
            </CardContent>
        </Card>
    );
}

StudentDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: student.dashboard() }],
};
