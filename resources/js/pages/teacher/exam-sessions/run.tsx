import { Head, Link, router } from '@inertiajs/react';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExamSessionPresenceListener } from '@/components/exam-session-presence';
import MdxContentEditor from '@/components/mdx-content-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionDetail, TeacherExamPart } from '@/types';

const pageSize = 6;

export default function ExamSessionRun({
    session,
    parts,
}: {
    session: ExamSessionDetail;
    parts: TeacherExamPart[];
}) {
    const [activePartNumber, setActivePartNumber] = useState(
        parts[0]?.part_number ?? 1,
    );
    const [studentPage, setStudentPage] = useState(0);
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
    const activePart =
        parts.find((part) => part.part_number === activePartNumber) ?? parts[0];
    const pageCount = Math.max(
        1,
        Math.ceil(session.participations.length / pageSize),
    );
    const visibleStudents = session.participations.slice(
        studentPage * pageSize,
        (studentPage + 1) * pageSize,
    );

    const reload = useCallback(
        () =>
            router.reload({
                only: ['session'],
                onSuccess: (page) => {
                    const fresh = page.props.session as ExamSessionDetail;
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

    if (!activePart) {
        return <div className="p-6">Aucun contenu d’examen disponible.</div>;
    }

    return (
        <main className="flex min-h-svh flex-col bg-background lg:h-svh lg:overflow-hidden">
            {session.participations.map((participation) => (
                <ExamSessionPresenceListener
                    key={participation.id}
                    sessionId={session.id}
                    participationId={participation.id}
                    onPresenceChange={updatePresence}
                />
            ))}
            <Head title={`Examen en cours · ${session.title}`} />
            <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-4 py-2 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Retour au suivi"
                        asChild
                    >
                        <Link href={examSessions.show(session.id)}>
                            <X />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="truncate font-semibold">
                            {session.title}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Code d’accès :{' '}
                            <span className="font-mono font-medium tracking-wider">
                                {session.access_code}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            session.status === 'open' ? 'default' : 'secondary'
                        }
                    >
                        {session.status === 'open'
                            ? 'Examen ouvert'
                            : 'Examen terminé'}
                    </Badge>
                    {session.status === 'open' && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                                router.post(examSessions.close(session.id).url)
                            }
                        >
                            Terminer l’examen
                        </Button>
                    )}
                </div>
            </header>

            <nav
                aria-label="Parties de l’examen"
                className="border-b p-3 sm:px-6"
            >
                <div
                    role="tablist"
                    className="flex w-full gap-1 rounded-md bg-muted p-1"
                >
                    {parts.map((part) => (
                        <button
                            key={part.id}
                            id={`teil-tab-${part.part_number}`}
                            type="button"
                            role="tab"
                            aria-controls={`teil-panel-${part.part_number}`}
                            aria-selected={
                                part.part_number === activePartNumber
                            }
                            onClick={() =>
                                setActivePartNumber(part.part_number)
                            }
                            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-sm px-2 py-2 text-sm font-medium transition-colors sm:px-3 ${part.part_number === activePartNumber ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <span>Teil {part.part_number}</span>
                            <span className="text-xs text-muted-foreground">
                                ({part.tasks.length})
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

            <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="flex min-w-0 flex-col lg:min-h-0">
                    <div
                        id={`teil-panel-${activePart.part_number}`}
                        role="tabpanel"
                        aria-labelledby={`teil-tab-${activePart.part_number}`}
                        className="min-w-0 space-y-5 p-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">
                                Teil {activePart.part_number}
                            </h2>
                            {activePart.instructions && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activePart.instructions}
                                </p>
                            )}
                        </div>

                        <div
                            className={
                                activePart.part_number === 1 ||
                                activePart.part_number === 3
                                    ? 'grid gap-4 sm:grid-cols-2'
                                    : 'space-y-5'
                            }
                        >
                            {activePart.reading_materials.map(
                                (material, index) => (
                                    <article
                                        key={material.id}
                                        className="min-w-0 rounded-md border p-4 sm:p-6"
                                    >
                                        {activePart.reading_materials.length >
                                            1 && (
                                            <h3 className="mb-4 font-semibold">
                                                Texte {index + 1}
                                            </h3>
                                        )}
                                        <MdxContentEditor
                                            id={`run-${material.id}`}
                                            markdown={material.body}
                                            onChange={() => {}}
                                            readOnly
                                        />
                                    </article>
                                ),
                            )}
                        </div>

                        {activePart.part_number === 2 &&
                            activePart.tasks.map((task) => (
                                <section key={task.id} className="space-y-3">
                                    <h3 className="font-semibold">
                                        Annoncen · Frage {task.position + 5}
                                    </h3>
                                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                                        {task.choices.map((choice) => (
                                            <article
                                                key={choice.label}
                                                className="min-w-0 flex-1 rounded-md border p-4"
                                            >
                                                <h4 className="mb-3 font-medium">
                                                    Annonce {choice.label}
                                                </h4>
                                                {choice.body && (
                                                    <MdxContentEditor
                                                        id={`run-${task.id}-${choice.label}`}
                                                        markdown={choice.body}
                                                        onChange={() => {}}
                                                        readOnly
                                                    />
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}

                        {activePart.reading_materials.length === 0 &&
                            activePart.part_number !== 2 && (
                                <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                                    Aucun texte n’est associé à cette partie.
                                </p>
                            )}
                    </div>
                </section>

                <aside className="flex min-w-0 flex-col border-t lg:min-h-0 lg:border-t-0 lg:border-l">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <div>
                            <h2 className="font-semibold">Progression</h2>
                            <p className="text-xs text-muted-foreground">
                                {session.participations.length} étudiant(s)
                            </p>
                        </div>
                        <Badge
                            variant={
                                !realtime
                                    ? 'secondary'
                                    : connection === 'connected'
                                      ? 'outline'
                                      : 'secondary'
                            }
                        >
                            {!realtime
                                ? 'Actualisation auto'
                                : connection === 'connected'
                                  ? 'En direct'
                                  : 'Reconnexion…'}
                        </Badge>
                    </div>

                    <div className="space-y-3 p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                        {visibleStudents.length === 0 ? (
                            <p className="p-3 text-sm text-muted-foreground">
                                Aucun étudiant n’a encore rejoint l’examen.
                            </p>
                        ) : (
                            visibleStudents.map((participation) => {
                                const seen = lastSeen[participation.student.id];
                                const online =
                                    participation.status !== 'completed' &&
                                    (onlineParticipations.has(
                                        participation.id,
                                    ) ||
                                        Boolean(
                                            seen &&
                                            now - Date.parse(seen) < 45_000,
                                        ));
                                const answeredTotal =
                                    participation.progress?.reduce(
                                        (sum, part) =>
                                            sum +
                                            part.answered_task_positions.length,
                                        0,
                                    ) ?? 0;
                                const taskTotal =
                                    participation.progress?.reduce(
                                        (sum, part) => sum + part.total_tasks,
                                        0,
                                    ) ?? 0;

                                return (
                                    <article
                                        key={participation.id}
                                        className="space-y-2 rounded-md border p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="truncate text-sm font-medium">
                                                {participation.student.name}
                                            </span>
                                            <span
                                                className={`flex shrink-0 items-center gap-1.5 text-xs ${online ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}
                                            >
                                                <span
                                                    className={`size-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`}
                                                />
                                                {online
                                                    ? 'En ligne'
                                                    : 'Hors ligne'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {participation.status ===
                                                'completed'
                                                    ? 'Terminé'
                                                    : participation.status ===
                                                        'in_progress'
                                                      ? 'En cours'
                                                      : participation.joined_at
                                                        ? 'Connecté, pas encore de réponse'
                                                        : 'Pas commencé'}
                                            </span>
                                            <span>
                                                {answeredTotal}/{taskTotal}{' '}
                                                réponses
                                            </span>
                                        </div>
                                        <div
                                            className="space-y-1.5"
                                            aria-label={`${answeredTotal} réponse(s) sur ${taskTotal}`}
                                        >
                                            {participation.progress?.map(
                                                (part) => (
                                                    <div
                                                        key={part.part_number}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <span className="w-5 text-[10px] text-muted-foreground">
                                                            T{part.part_number}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.from(
                                                                {
                                                                    length: part.total_tasks,
                                                                },
                                                                (_, index) => {
                                                                    const position =
                                                                        index +
                                                                        1;
                                                                    const answered =
                                                                        part.answered_task_positions.includes(
                                                                            position,
                                                                        );

                                                                    return (
                                                                        <span
                                                                            key={
                                                                                position
                                                                            }
                                                                            title={`Teil ${part.part_number}, question ${position}${answered ? ' répondue' : ' sans réponse'}`}
                                                                            className={`flex size-6 items-center justify-center rounded border text-[11px] ${answered ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                                                        >
                                                                            {answered ? (
                                                                                <Check
                                                                                    className="size-3"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            ) : (
                                                                                position
                                                                            )}
                                                                        </span>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>

                    <Separator />
                    <div className="flex items-center justify-between gap-2 p-3">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={studentPage === 0}
                            onClick={() =>
                                setStudentPage((page) => Math.max(0, page - 1))
                            }
                        >
                            <ChevronLeft data-icon="inline-start" />
                            Précédent
                        </Button>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {studentPage + 1} / {pageCount}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={studentPage + 1 >= pageCount}
                            onClick={() =>
                                setStudentPage((page) =>
                                    Math.min(pageCount - 1, page + 1),
                                )
                            }
                        >
                            Suivant
                            <ChevronRight data-icon="inline-end" />
                        </Button>
                    </div>
                </aside>
            </div>
        </main>
    );
}
