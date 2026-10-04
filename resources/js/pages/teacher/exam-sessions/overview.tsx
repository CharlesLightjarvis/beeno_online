import { Head, Link, router } from '@inertiajs/react';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { Check, Clipboard, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExamSessionPresenceListener } from '@/components/exam-session-presence';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import teacher from '@/routes/teacher';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionLobby } from '@/types';

const statusLabels = {
    scheduled: 'Planifiée',
    open: 'Ouverte',
    closed: 'Terminée',
} as const;

export default function ExamSessionOverview({
    session,
}: {
    session: ExamSessionLobby;
}) {
    const [copied, setCopied] = useState(false);
    const [lastSeen, setLastSeen] = useState<Record<string, string | null>>(
        () =>
            Object.fromEntries(
                session.participations.map(({ student, last_seen_at }) => [
                    student.id,
                    last_seen_at,
                ]),
            ),
    );
    const [now, setNow] = useState(0);
    const [onlineParticipations, setOnlineParticipations] = useState<
        Set<string>
    >(() => new Set());
    const connection = useConnectionStatus();
    const realtime = Boolean(
        import.meta.env.VITE_REVERB_APP_KEY && import.meta.env.VITE_REVERB_HOST,
    );
    const previousConnection = useRef(connection);

    const reload = useCallback(
        () =>
            router.reload({
                only: ['session'],
                onSuccess: (page) => {
                    const fresh = page.props.session as ExamSessionLobby;
                    setLastSeen(
                        Object.fromEntries(
                            fresh.participations.map(
                                ({ student, last_seen_at }) => [
                                    student.id,
                                    last_seen_at,
                                ],
                            ),
                        ),
                    );
                },
            }),
        [],
    );

    useEcho<{ session_id: string }>(
        `exam-sessions.${session.id}.teacher`,
        ['.exam-session.progress-updated', '.exam-session.state-changed'],
        reload,
    );
    useEcho<{ session_id: string; student_id: string; last_seen_at: string }>(
        `exam-sessions.${session.id}.teacher`,
        '.exam-session.presence-updated',
        (event) => {
            setLastSeen((current) => ({
                ...current,
                [event.student_id]: event.last_seen_at,
            }));
        },
    );

    const updatePresence = useCallback(
        (participationId: string, online: boolean) => {
            setOnlineParticipations((current) => {
                const next = new Set(current);

                if (online) {
                    next.add(participationId);
                } else {
                    next.delete(participationId);
                }

                return next;
            });
        },
        [],
    );

    useEffect(() => {
        const start = window.setTimeout(() => setNow(Date.now()), 0);
        const timer = window.setInterval(() => setNow(Date.now()), 10_000);

        return () => {
            window.clearTimeout(start);
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (
            realtime &&
            connection === 'connected' &&
            previousConnection.current !== 'connected'
        ) {
            reload();
        }

        previousConnection.current = connection;
    }, [connection, realtime, reload]);

    useEffect(() => {
        if (realtime && connection === 'connected') {
            return;
        }

        const timer = window.setInterval(reload, 15_000);

        return () => window.clearInterval(timer);
    }, [connection, realtime, reload]);

    const copyCode = async () => {
        await navigator.clipboard.writeText(session.access_code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <Head title={session.title} />
            {session.status !== 'closed' &&
                session.participations.map((participation) => (
                    <ExamSessionPresenceListener
                        key={participation.id}
                        sessionId={session.id}
                        participationId={participation.id}
                        onPresenceChange={updatePresence}
                    />
                ))}
            <div className="container mx-auto max-w-4xl space-y-7 p-4 sm:p-6">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {session.title}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Préparation et connexion des étudiants
                        </p>
                    </div>
                    <Badge
                        variant={
                            session.status === 'open' ? 'default' : 'secondary'
                        }
                    >
                        {statusLabels[session.status]}
                    </Badge>
                </header>

                <Separator />

                {session.status !== 'closed' && (
                    <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-semibold">Code d’accès</h2>
                        <p className="text-sm text-muted-foreground">
                            À communiquer uniquement aux étudiants sélectionnés.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 rounded-md border p-4">
                        <span className="font-mono text-2xl font-semibold tracking-[0.3em]">
                            {session.access_code}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyCode}
                        >
                            {copied ? (
                                <Check data-icon="inline-start" />
                            ) : (
                                <Clipboard data-icon="inline-start" />
                            )}
                            {copied ? 'Copié' : 'Copier le code'}
                        </Button>
                    </div>
                    </section>
                )}

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Étudiants participants
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {session.participations.length} étudiant(s)
                            sélectionné(s). Le statut de connexion se met à jour
                            automatiquement.
                        </p>
                    </div>
                    <div className="divide-y rounded-md border">
                        {session.participations.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                Aucun étudiant n’a été ajouté à cette session.
                            </p>
                        ) : (
                            session.participations.map((participation) => {
                                const seen = lastSeen[participation.student.id];
                                const online =
                                    session.status !== 'closed' &&
                                    participation.status !== 'completed' &&
                                    (onlineParticipations.has(participation.id) ||
                                        Boolean(
                                            seen &&
                                                now - Date.parse(seen) < 45_000,
                                        ));
                                const studentStatus =
                                    session.status === 'closed'
                                        ? 'Session clôturée'
                                        : participation.status === 'completed'
                                        ? 'Examen terminé'
                                        : participation.status === 'in_progress'
                                          ? 'A rejoint l’examen'
                                          : participation.joined_at
                                            ? session.started_at
                                                ? 'Connecté, sans réponse'
                                                : 'Salle d’attente'
                                            : 'Pas encore connecté';

                                return (
                                    <div
                                        key={participation.id}
                                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                                    >
                                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="font-medium">
                                                {participation.student.name}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                {[
                                                    ['lesen', 'Lesen'],
                                                    ['hoeren', 'Hören'],
                                                    ['schreiben', 'Schreiben'],
                                                    ['sprechen', 'Sprechen'],
                                                ].map(([module, label]) => {
                                                    const score = participation.scores?.[module];
                                                    const value = session.status === 'closed' && score?.available
                                                        ? `${score.correct}/${score.total}`
                                                        : '—';

                                                    return (
                                                        <span key={module} className="whitespace-nowrap">
                                                            {label} {value}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant={
                                                    online
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {online
                                                    ? 'En ligne'
                                                    : 'Hors ligne'}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {studentStatus}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={examSessions.index()}>
                            Retour aux sessions
                        </Link>
                    </Button>
                    {session.status === 'open' && !session.started_at && (
                        <Button
                            onClick={() =>
                                router.post(examSessions.start(session.id).url)
                            }
                        >
                            <Play data-icon="inline-start" />
                            Commencer l’examen
                        </Button>
                    )}
                    {session.status === 'open' && session.started_at && (
                        <Button asChild>
                            <Link href={examSessions.run(session.id)}>
                                Poursuivre l’examen
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

ExamSessionOverview.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions d’examen', href: examSessions.index() },
        { title: 'Préparation', href: '#' },
    ],
};
