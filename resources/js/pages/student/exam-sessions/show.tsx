import { Head, router } from '@inertiajs/react';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { Circle, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { ExamSessionPresenceJoiner } from '@/components/exam-session-presence';
import MarkdownContent from '@/components/markdown-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import student from '@/routes/student';
import examSessions from '@/routes/student/exam-sessions';
import type { StudentExamDelivery, StudentExamParticipation } from '@/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type ExamReview = Record<string, { selected_choice_id: string | null; correct_choice_id: string | null; is_correct: boolean | null }>;
type ReviewScores = Record<string, { available: boolean; correct: number; total: number }>;
const reviewModuleLabels: Record<string, string> = { lesen: 'Lesen', hoeren: 'Hören', schreiben: 'Schreiben', sprechen: 'Sprechen' };

export default function StudentExamSessionShow({
    participation,
    exam,
    responses,
    review,
    review_scores,
}: {
    participation: StudentExamParticipation;
    exam: StudentExamDelivery;
    responses: Record<string, string>;
    review?: ExamReview | null;
    review_scores?: ReviewScores | null;
}) {
    const [partKey, setPartKey] = useState(exam.parts[0]?.id ?? 'empty');
    const [taskPosition, setTaskPosition] = useState(1);
    const [answers, setAnswers] = useState(responses);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [finishOpen, setFinishOpen] = useState(false);
    const answersRef = useRef(responses);
    const pendingAnswersRef = useRef(new Map<string, string>());
    const saveTimerRef = useRef<number | null>(null);
    const flushingRef = useRef(false);
    const mountedRef = useRef(false);
    const connectionStatus = useConnectionStatus();
    const realtimeAvailable = Boolean(
        import.meta.env.VITE_REVERB_APP_KEY && import.meta.env.VITE_REVERB_HOST,
    );
    const hasStarted = participation.started_at !== null;
    const waitingForTeacher =
        !hasStarted &&
        participation.session_status === 'open' &&
        participation.status !== 'completed';
    const previousConnectionStatus = useRef(connectionStatus);
    const activePart =
        exam.parts.find((part) => part.id === partKey) ??
        exam.parts[0] ?? {
            id: 'empty',
            module: 'lesen',
            part_number: 1,
            instructions: null,
            tasks: [],
        };
    const activeTask =
        activePart.tasks.find((task) => task.position === taskPosition) ??
        activePart.tasks[0] ?? {
            id: 'empty',
            position: 1,
            prompt: null,
            response_type: 'choice',
            choices: [],
        };
    const reviewTask = review?.[activeTask.id];
    const reviewChoiceClass = (choiceId: string) => {
        if (!reviewTask) {
            return answers[activeTask.id] === choiceId ? 'border-primary bg-accent' : '';
        }
        if (reviewTask.correct_choice_id === choiceId) {
            return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
        }
        if (reviewTask.selected_choice_id === choiceId) {
            return 'border-red-500 bg-red-50 dark:bg-red-950/20';
        }

        return '';
    };
    const isLocked =
        participation.status === 'completed' ||
        participation.session_status !== 'open' ||
        !hasStarted;
    const answeredCount = Object.keys(answers).length;

    const reloadStudentState = useCallback(() => {
        router.reload({
            only: ['participation', 'exam', 'responses'],
            onSuccess: (page) => {
                const serverAnswers = page.props.responses as Record<
                    string,
                    string
                >;
                answersRef.current = {
                    ...serverAnswers,
                    ...answersRef.current,
                };
                setAnswers(answersRef.current);
            },
        });
    }, []);

    const flushPendingAnswers = useCallback(async (): Promise<boolean> => {
        if (flushingRef.current) {
            while (flushingRef.current) {
                await new Promise((resolve) => window.setTimeout(resolve, 50));
            }
        }

        if (pendingAnswersRef.current.size === 0) {
            return true;
        }

        if (isLocked) {
            return false;
        }

        flushingRef.current = true;
        let failed = false;

        if (mountedRef.current) {
            setSaveState('saving');
        }

        try {
            while (pendingAnswersRef.current.size > 0) {
                const batch = [...pendingAnswersRef.current.entries()];
                pendingAnswersRef.current.clear();

                const failedAnswers = await Promise.all(
                    batch.map(async ([taskId, answer]) => {
                        try {
                            const xsrfCookie = document.cookie
                                .split('; ')
                                .find((cookie) =>
                                    cookie.startsWith('XSRF-TOKEN='),
                                );
                            const token = xsrfCookie
                                ? decodeURIComponent(
                                      xsrfCookie.slice('XSRF-TOKEN='.length),
                                  )
                                : '';
                            const response = await fetch(
                                examSessions.responses.store(participation.id)
                                    .url,
                                {
                                    method: 'POST',
                                    credentials: 'same-origin',
                                    keepalive: true,
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'X-XSRF-TOKEN': token,
                                    },
                                    signal: AbortSignal.timeout(10_000),
                                    body: JSON.stringify({
                                        task_id: taskId,
                                        ...(exam.parts
                                            .flatMap((part) => part.tasks)
                                            .find((task) => task.id === taskId)
                                            ?.response_type === 'text'
                                            ? { answer_text: answer }
                                            : { choice_id: answer }),
                                    }),
                                },
                            );
                            const contentType =
                                response.headers.get('content-type') ?? '';

                            if (
                                !response.ok ||
                                !contentType.includes('application/json')
                            ) {
                                return [taskId, answer] as const;
                            }

                            return null;
                        } catch {
                            return [taskId, answer] as const;
                        }
                    }),
                );

                failedAnswers.forEach((entry) => {
                    if (entry) {
                        const [taskId, answer] = entry;

                        if (!pendingAnswersRef.current.has(taskId)) {
                            pendingAnswersRef.current.set(taskId, answer);
                        }

                        failed = true;
                    }
                });

                if (failed) {
                    break;
                }
            }
        } finally {
            flushingRef.current = false;

            if (mountedRef.current) {
                setSaveState(
                    failed
                        ? 'error'
                        : pendingAnswersRef.current.size > 0
                          ? 'saving'
                          : 'saved',
                );
            }
        }

        return !failed && pendingAnswersRef.current.size === 0;
    }, [exam.parts, isLocked, participation.id]);

    const scheduleAnswerSave = () => {
        if (saveTimerRef.current !== null) {
            window.clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(() => {
            saveTimerRef.current = null;
            void flushPendingAnswers();
        }, 700);
    };

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const backupTimer = window.setInterval(
            () => void flushPendingAnswers(),
            10_000,
        );
        const flushOnPageHide = () => void flushPendingAnswers();

        window.addEventListener('online', flushOnPageHide);
        window.addEventListener('pagehide', flushOnPageHide);

        return () => {
            window.clearInterval(backupTimer);
            window.removeEventListener('online', flushOnPageHide);
            window.removeEventListener('pagehide', flushOnPageHide);

            if (saveTimerRef.current !== null) {
                window.clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }

            void flushPendingAnswers();
        };
    }, [flushPendingAnswers]);

    useEffect(() => {
        if (
            participation.status === 'completed' ||
            participation.session_status !== 'open'
        ) {
            return;
        }

        const sendHeartbeat = () => {
            const xsrfCookie = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
            const token = xsrfCookie
                ? decodeURIComponent(xsrfCookie.slice('XSRF-TOKEN='.length))
                : '';

            void fetch(examSessions.heartbeat(participation.id).url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': token,
                },
                body: '{}',
            }).catch(() => undefined);
        };

        sendHeartbeat();
        const timer = window.setInterval(sendHeartbeat, 20_000);

        return () => window.clearInterval(timer);
    }, [participation.id, participation.status]);

    useEcho<{
        session_id: string;
        status: 'open' | 'closed';
        started_at: string | null;
    }>(
        `exam-sessions.${participation.session_id}.students.${participation.student_id}`,
        '.exam-session.state-changed',
        () => {
            reloadStudentState();
        },
    );

    useEffect(() => {
        if (
            realtimeAvailable &&
            connectionStatus === 'connected' &&
            previousConnectionStatus.current !== 'connected'
        ) {
            reloadStudentState();
        }

        previousConnectionStatus.current = connectionStatus;
    }, [connectionStatus, realtimeAvailable, reloadStudentState]);

    useEffect(() => {
        if (realtimeAvailable && connectionStatus === 'connected') {
            return;
        }

        const recoveryTimer = window.setInterval(reloadStudentState, 15_000);

        return () => window.clearInterval(recoveryTimer);
    }, [connectionStatus, realtimeAvailable, reloadStudentState]);

    const selectChoice = (choiceId: string) => {
        if (isLocked) {
            return;
        }

        answersRef.current = {
            ...answersRef.current,
            [activeTask.id]: choiceId,
        };
        setAnswers(answersRef.current);
        pendingAnswersRef.current.set(activeTask.id, choiceId);
        setSaveState('saving');
        scheduleAnswerSave();
    };

    const selectText = (answer: string) => {
        if (isLocked) {
            return;
        }

        answersRef.current = { ...answersRef.current, [activeTask.id]: answer };
        setAnswers(answersRef.current);
        pendingAnswersRef.current.set(activeTask.id, answer);
        setSaveState('saving');
        scheduleAnswerSave();
    };

    const changePart = (nextPartId: string) => {
        setPartKey(nextPartId);
        setTaskPosition(1);
    };

    const moveTask = (direction: -1 | 1) => {
        const index = activePart.tasks.findIndex(
            (task) => task.id === activeTask.id,
        );
        const nextTask = activePart.tasks[index + direction];

        if (nextTask) {
            setTaskPosition(nextTask.position);
        }
    };

    return (
        <>
            <Head title={exam.title} />
            {participation.status !== 'completed' &&
                participation.session_status === 'open' && (
                <ExamSessionPresenceJoiner
                    sessionId={participation.session_id}
                    participationId={participation.id}
                />
            )}
            {hasStarted ? (
                <div className="container mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {exam.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            TELC · {activePart.module}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={
                                !realtimeAvailable
                                    ? 'secondary'
                                    : connectionStatus === 'connected'
                                      ? 'outline'
                                      : 'secondary'
                            }
                        >
                            {!realtimeAvailable
                                ? 'Temps réel indisponible'
                                : connectionStatus === 'connected'
                                  ? 'Connecté'
                                  : 'Reconnexion…'}
                        </Badge>
                        <Badge
                            variant={
                                participation.status === 'completed'
                                    ? 'default'
                                    : participation.session_status === 'open'
                                      ? 'secondary'
                                      : 'destructive'
                            }
                        >
                            {participation.status === 'completed'
                                ? 'Terminée'
                                : participation.session_status === 'open'
                                  ? 'En cours'
                                  : 'Clôturée'}
                        </Badge>
                        {hasStarted &&
                            participation.status !== 'completed' &&
                            participation.session_status === 'open' && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setFinishOpen(true)}
                                >
                                    Terminer l’examen
                                </Button>
                            )}
                    </div>
                </div>

                {isLocked && participation.status !== 'completed' && (
                    <p
                        role="status"
                        className="rounded-md border p-3 text-sm text-muted-foreground"
                    >
                        La session a été clôturée par le professeur. Vos
                        réponses enregistrées restent sauvegardées.
                    </p>
                )}
                {review && review_scores && (
                    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Notes par module">
                        {['lesen', 'hoeren', 'schreiben', 'sprechen'].map((module) => {
                            const score = review_scores[module];

                            return <div key={module} className="rounded-md border p-3"><p className="text-sm text-muted-foreground">{reviewModuleLabels[module]}</p><p className="mt-1 text-xl font-semibold">{score?.available ? `${score.correct} / ${score.total}` : '—'}</p>{!score?.available && <p className="text-xs text-muted-foreground">Non disponible</p>}</div>;
                        })}
                    </section>
                )}
                <Separator />

                <div
                    className="flex flex-wrap items-center gap-2"
                    role="tablist"
                    aria-label="Parties de l’examen"
                >
                    {exam.parts.map((part) => (
                        <Button
                            key={part.id}
                            type="button"
                            variant={
                                part.id === activePart.id
                                    ? 'default'
                                    : 'outline'
                            }
                            role="tab"
                            aria-selected={
                                part.id === activePart.id
                            }
                            onClick={() => changePart(part.id)}
                        >
                            {part.module} · Teil {part.part_number}
                        </Button>
                    ))}
                    <span className="ml-auto text-sm text-muted-foreground">
                        {answeredCount}/15 répondues
                    </span>
                </div>

                <section className="space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Teil {activePart.part_number}
                        </h2>
                        {activePart.instructions && activePart.module !== 'hoeren' && (
                            <p className="mt-1 text-muted-foreground">
                                {activePart.instructions}
                            </p>
                        )}
                    </div>

                    <div
                        className="flex flex-wrap gap-2"
                        aria-label={`Questions du Teil ${activePart.part_number}`}
                    >
                        {activePart.tasks.map((task) => {
                            const answered = Boolean(answers[task.id]);
                            const selected = task.id === activeTask.id;

                            return (
                                <Button
                                    key={task.id}
                                    type="button"
                                    size="sm"
                                    variant={
                                        selected
                                            ? 'default'
                                            : answered
                                              ? 'secondary'
                                              : 'outline'
                                    }
                                    aria-label={`Question ${task.position}${answered ? ', répondue' : ', sans réponse'}`}
                                    aria-current={selected ? 'step' : undefined}
                                    onClick={() =>
                                        setTaskPosition(task.position)
                                    }
                                >
                                    {answered ? (
                                        <CircleCheck data-icon="inline-start" />
                                    ) : (
                                        <Circle data-icon="inline-start" />
                                    )}
                                    {task.position}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="space-y-5 rounded-md border p-4 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-semibold">
                                {activePart.module} · Teil {activePart.part_number} · Question{' '}
                                {activeTask.position}
                            </h3>
                            {reviewTask && (
                                <Badge variant={reviewTask.is_correct === true ? 'default' : reviewTask.is_correct === false ? 'destructive' : 'warning'}>
                                    {activeTask.response_type === 'text' ? (answers[activeTask.id] ? 'À corriger' : 'Sans réponse') : reviewTask.is_correct === true ? 'Correcte' : reviewTask.is_correct === false ? 'Incorrecte' : 'Sans réponse'}
                                </Badge>
                            )}
                            <span
                                aria-live="polite"
                                className="text-sm text-muted-foreground"
                            >
                                {saveState === 'saving'
                                    ? 'Enregistrement…'
                                    : saveState === 'saved'
                                      ? 'Réponse enregistrée'
                                      : saveState === 'error'
                                        ? 'Échec de l’enregistrement — nouvelle tentative automatique'
                                        : ''}
                            </span>
                        </div>
                        {activePart.module === 'schreiben' && review ? (
                            <MarkdownContent markdown={activeTask.prompt ?? ''} className="text-base leading-7" />
                        ) : activePart.module !== 'schreiben' ? (
                            <p className="text-base leading-7">{activeTask.prompt}</p>
                        ) : null}

                        {activeTask.response_type === 'text' ? (
                            <textarea
                                aria-label="Réponse écrite"
                                value={answers[activeTask.id] ?? ''}
                                disabled={isLocked}
                                onChange={(event) => selectText(event.target.value)}
                                rows={8}
                                className="w-full rounded-md border bg-background p-3 leading-7"
                                placeholder="Écrivez votre réponse ici…"
                            />
                        ) : activePart.module === 'hoeren' ? (
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium">Choisissez une réponse</legend>
                                <div className="flex flex-col gap-3">
                                    {activeTask.choices.map((choice) => (
                                        <label key={choice.id} className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm ${reviewChoiceClass(choice.id)} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
                                            <input type="radio" name={`answer-${activeTask.id}`} value={choice.id} checked={answers[activeTask.id] === choice.id} disabled={isLocked} onChange={() => selectChoice(choice.id)} className="mt-1 size-4 accent-primary" />
                                            <span><span className="font-semibold">{choice.label}</span>{choice.body && <span className="ml-2">{choice.body}</span>}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ) : activePart.module === 'lesen' && activePart.part_number === 2 ? (
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium">
                                    Choisissez une annonce
                                </legend>
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                    {activeTask.choices.map((choice) => (
                                        <label
                                            key={choice.id}
                                            className={`flex min-h-12 w-full cursor-pointer items-center justify-center rounded-md border px-4 py-3 font-medium sm:flex-1 ${reviewChoiceClass(choice.id)} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`answer-${activeTask.id}`}
                                                value={choice.id}
                                                aria-label={`Annonce ${choice.label}`}
                                                checked={
                                                    answers[activeTask.id] ===
                                                    choice.id
                                                }
                                                disabled={isLocked}
                                                onChange={() =>
                                                    selectChoice(choice.id)
                                                }
                                                className="sr-only"
                                            />
                                            Annonce {choice.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ) : (
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium">
                                    Choisissez une réponse
                                </legend>
                                <div className="flex flex-wrap gap-3">
                                    {activeTask.choices.map((choice) => (
                                        <label
                                            key={choice.id}
                                            className={`flex min-w-36 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm ${reviewChoiceClass(choice.id)} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`answer-${activeTask.id}`}
                                                value={choice.id}
                                                checked={
                                                    answers[activeTask.id] ===
                                                    choice.id
                                                }
                                                disabled={isLocked}
                                                onChange={() =>
                                                    selectChoice(choice.id)
                                                }
                                                className="size-4 accent-primary"
                                            />
                                            {choice.body && <span className="ml-2 text-left font-normal">{choice.body}</span>}
                                            <span>
                                                {choice.label === 'richtig'
                                                    ? 'Richtig (+)'
                                                    : 'Falsch (−)'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        <div className="flex justify-between border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={activeTask.position === 1}
                                onClick={() => moveTask(-1)}
                            >
                                <ChevronLeft data-icon="inline-start" />
                                Précédente
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    activeTask.position ===
                                    activePart.tasks.length
                                }
                                onClick={() => moveTask(1)}
                            >
                                Suivante
                                <ChevronRight data-icon="inline-end" />
                            </Button>
                        </div>
                    </div>
                </section>
                </div>
            ) : (
                <div className="container mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center p-4 text-center sm:p-6">
                    <Badge variant={waitingForTeacher ? 'secondary' : 'destructive'}>
                        {waitingForTeacher ? 'En attente du professeur' : 'Session cloturee'}
                    </Badge>
                    <h1 className="mt-5 text-2xl font-semibold tracking-tight">
                        {exam.title}
                    </h1>
                    <p role="status" className="mt-3 max-w-xl text-muted-foreground">
                        {waitingForTeacher
                            ? "Les questions apparaitront ici des que le professeur commencera l'examen. Gardez cette page ouverte."
                            : "Cette session a ete cloturee avant le debut de l'examen. Les questions ne sont pas disponibles."}
                    </p>
                    <Badge variant="outline" className="mt-5">
                        {!realtimeAvailable
                            ? 'Actualisation automatique activee'
                            : connectionStatus === 'connected'
                              ? 'Connecte a la session'
                              : 'Connexion en cours'}
                    </Badge>
                </div>
            )}

                {hasStarted && <ConfirmActionDialog
                open={finishOpen}
                onOpenChange={setFinishOpen}
                title="Terminer l’examen ?"
                description="Cette action est définitive. Vous ne pourrez plus modifier vos réponses après confirmation."
                confirmLabel="Terminer définitivement"
                onConfirm={async (finish) => {
                    if (saveTimerRef.current !== null) {
                        window.clearTimeout(saveTimerRef.current);
                        saveTimerRef.current = null;
                    }

                    const answersSaved = await flushPendingAnswers();

                    if (!answersSaved) {
                        return finish();
                    }

                    router.post(
                        examSessions.finish(participation.id).url,
                        {},
                        {
                            onSuccess: () => setFinishOpen(false),
                            onFinish: finish,
                        },
                    );
                }}
                />}
        </>
    );
}

StudentExamSessionShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: student.dashboard() },
        { title: 'Mes examens', href: examSessions.index() },
        { title: 'Examen', href: '#' },
    ],
};
