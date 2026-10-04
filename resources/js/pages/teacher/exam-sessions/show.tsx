import { Head, router } from '@inertiajs/react';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { Check, Clipboard, Play, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExamSessionPresenceListener } from '@/components/exam-session-presence';
import MdxContentEditor from '@/components/mdx-content-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import teacher from '@/routes/teacher';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionDetail, ExamSessionReadingMaterial } from '@/types';

const labels = {
    scheduled: 'Planifiée',
    open: 'Ouverte',
    closed: 'Clôturée',
} as const;

export default function ExamSessionShow({
    session,
    materials,
}: {
    session: ExamSessionDetail;
    materials: ExamSessionReadingMaterial[];
}) {
    const [copied, setCopied] = useState(false);
    const [teacherPreviewId, setTeacherPreviewId] = useState<string | null>(
        null,
    );
    const [lastSeenByStudent, setLastSeenByStudent] = useState<
        Record<string, string | null>
    >(() =>
        Object.fromEntries(
            session.participations.map(({ student, last_seen_at }) => [
                student.id,
                last_seen_at,
            ]),
        ),
    );
    const [currentTime, setCurrentTime] = useState(0);
    const [onlineParticipations, setOnlineParticipations] = useState<
        Set<string>
    >(() => new Set());
    const connectionStatus = useConnectionStatus();
    const realtimeAvailable = Boolean(
        import.meta.env.VITE_REVERB_APP_KEY && import.meta.env.VITE_REVERB_HOST,
    );
    const previousConnectionStatus = useRef(connectionStatus);

    const reloadSession = useCallback(
        () =>
            router.reload({
                only: ['session'],
                onSuccess: (page) => {
                    const refreshed = page.props.session as ExamSessionDetail;
                    setLastSeenByStudent(
                        Object.fromEntries(
                            refreshed.participations.map(
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
        [
            '.exam-session.progress-updated',
            '.exam-session.state-changed',
            '.exam-session.material-changed',
        ],
        reloadSession,
    );

    useEcho<{ session_id: string; student_id: string; last_seen_at: string }>(
        `exam-sessions.${session.id}.teacher`,
        '.exam-session.presence-updated',
        (event) => {
            setLastSeenByStudent((current) => ({
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
        const startTimer = window.setTimeout(
            () => setCurrentTime(Date.now()),
            0,
        );
        const timer = window.setInterval(
            () => setCurrentTime(Date.now()),
            10_000,
        );

        return () => {
            window.clearTimeout(startTimer);
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (
            realtimeAvailable &&
            connectionStatus === 'connected' &&
            previousConnectionStatus.current !== 'connected'
        ) {
            reloadSession();
        }

        previousConnectionStatus.current = connectionStatus;
    }, [connectionStatus, realtimeAvailable, reloadSession]);

    useEffect(() => {
        if (realtimeAvailable && connectionStatus === 'connected') {
            return;
        }

        const recoveryTimer = window.setInterval(reloadSession, 15_000);

        return () => window.clearInterval(recoveryTimer);
    }, [connectionStatus, realtimeAvailable, reloadSession]);
    const copyCode = async () => {
        await navigator.clipboard.writeText(session.access_code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <Head title={session.title} />
            {session.participations.map((participation) => (
                <ExamSessionPresenceListener
                    key={participation.id}
                    sessionId={session.id}
                    participationId={participation.id}
                    onPresenceChange={updatePresence}
                />
            ))}
            <div className="container mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {session.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Session d’examen TELC A1 · Lesen
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={
                                session.status === 'open'
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {labels[session.status]}
                        </Badge>
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
                                  ? 'Suivi connecté'
                                  : 'Reconnexion…'}
                        </Badge>
                        {session.status === 'scheduled' && (
                            <Button
                                onClick={() =>
                                    router.post(
                                        examSessions.open(session.id).url,
                                    )
                                }
                            >
                                <Play data-icon="inline-start" />
                                Ouvrir la session
                            </Button>
                        )}
                        {session.status === 'open' && (
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    router.post(
                                        examSessions.close(session.id).url,
                                    )
                                }
                            >
                                <Square data-icon="inline-start" />
                                Clôturer
                            </Button>
                        )}
                    </div>
                </div>
                <Separator />
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
                {materials.length > 0 && (
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Textes et annonces de l’examen
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Aperçu professeur : les annonces complètes sont
                                visibles ici. Les étudiants ne voient que les
                                boutons « Annonce A » et « Annonce B ».
                            </p>
                        </div>
                        <Select
                            value={
                                teacherPreviewId ??
                                session.displayed_material_id ??
                                materials.find(
                                    (material) => !material.announcements,
                                )?.id ??
                                materials[0].id
                            }
                            onValueChange={(id) => {
                                const selected = materials.find(
                                    (material) => material.id === id,
                                );

                                if (selected?.announcements) {
                                    setTeacherPreviewId(id);

                                    return;
                                }

                                setTeacherPreviewId(null);
                                router.post(
                                    examSessions.readingMaterial(session.id)
                                        .url,
                                    { displayed_material_id: id },
                                    { preserveScroll: true },
                                );
                            }}
                            disabled={session.status === 'closed'}
                        >
                            <SelectTrigger className="w-full sm:max-w-md">
                                <SelectValue placeholder="Choisir un texte" />
                            </SelectTrigger>
                            <SelectContent>
                                {materials.map((material) => (
                                    <SelectItem
                                        key={material.id}
                                        value={material.id}
                                    >
                                        {material.announcements
                                            ? `Teil 2 · Frage ${material.position + 5}`
                                            : `Teil ${material.part_number} · Texte ${material.position}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(() => {
                            const selectedId =
                                teacherPreviewId ??
                                session.displayed_material_id ??
                                materials.find((item) => !item.announcements)
                                    ?.id ??
                                materials[0].id;
                            const material = materials.find(
                                ({ id }) => id === selectedId,
                            );

                            if (!material) {
                                return null;
                            }

                            if (material.announcements) {
                                return (
                                    <div className="space-y-4">
                                        {material.prompt && (
                                            <p className="font-medium">
                                                {material.prompt}
                                            </p>
                                        )}
                                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                                            {material.announcements.map(
                                                (announcement) => (
                                                    <article
                                                        key={announcement.label}
                                                        className="min-w-0 flex-1 rounded-md border p-4"
                                                    >
                                                        <h3 className="mb-3 font-semibold">
                                                            Annonce{' '}
                                                            {announcement.label}
                                                        </h3>
                                                        {announcement.body && (
                                                            <MdxContentEditor
                                                                id={`${material.id}-${announcement.label}`}
                                                                markdown={
                                                                    announcement.body
                                                                }
                                                                onChange={() => {}}
                                                                readOnly
                                                            />
                                                        )}
                                                    </article>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return material.body ? (
                                <div className="rounded-md border p-4 sm:p-6">
                                    <MdxContentEditor
                                        id={material.id}
                                        markdown={material.body}
                                        onChange={() => {}}
                                        readOnly
                                    />
                                </div>
                            ) : null;
                        })()}
                    </section>
                )}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Progression des étudiants
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {session.participations.length} étudiant(s)
                            affecté(s)
                        </p>
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                        <div className="grid min-w-[760px] grid-cols-[minmax(160px,1fr)_repeat(3,minmax(120px,auto))_auto_auto] items-center gap-4 border-b bg-muted/30 px-4 py-3 text-sm font-medium">
                            <span>Étudiant</span>
                            <span>Teil 1</span>
                            <span>Teil 2</span>
                            <span>Teil 3</span>
                            <span>Connexion</span>
                            <span>Statut</span>
                        </div>
                        {session.participations.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                Aucun étudiant n’a encore été affecté.
                            </p>
                        ) : (
                            session.participations.map((participation) => (
                                <div
                                    key={participation.id}
                                    className="grid min-w-[760px] grid-cols-[minmax(160px,1fr)_repeat(3,minmax(120px,auto))_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
                                >
                                    <span className="truncate font-medium">
                                        {participation.student.name}
                                    </span>
                                    {[1, 2, 3].map((partNumber) => {
                                        const part =
                                            participation.progress?.find(
                                                (item) =>
                                                    item.part_number ===
                                                    partNumber,
                                            );

                                        return (
                                            <div
                                                key={partNumber}
                                                className="flex flex-wrap gap-1"
                                                aria-label={`Teil ${partNumber}: ${part?.answered_task_positions.length ?? 0} sur ${part?.total_tasks ?? 0} réponses`}
                                            >
                                                {Array.from(
                                                    {
                                                        length:
                                                            part?.total_tasks ??
                                                            0,
                                                    },
                                                    (_, index) => {
                                                        const position =
                                                            index + 1;
                                                        const answered =
                                                            part?.answered_task_positions.includes(
                                                                position,
                                                            ) ?? false;

                                                        return (
                                                            <span
                                                                key={position}
                                                                title={`Question ${position}${answered ? ' répondue' : ' non répondue'}`}
                                                                className={`flex size-6 items-center justify-center rounded border text-xs ${answered ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                                            >
                                                                {answered ? (
                                                                    <Check
                                                                        className="size-3.5"
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
                                        );
                                    })}
                                    {(() => {
                                        const lastSeen =
                                            lastSeenByStudent[
                                                participation.student.id
                                            ];
                                        const online =
                                            participation.status !==
                                                'completed' &&
                                            (realtimeAvailable &&
                                            connectionStatus === 'connected'
                                                ? onlineParticipations.has(
                                                      participation.id,
                                                  )
                                                : Boolean(
                                                      lastSeen &&
                                                      currentTime -
                                                          Date.parse(lastSeen) <
                                                          45_000,
                                                  ));

                                        return (
                                            <Badge
                                                variant={
                                                    online
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {online
                                                    ? 'Connecté'
                                                    : 'Hors ligne'}
                                            </Badge>
                                        );
                                    })()}
                                    <Badge
                                        variant={
                                            participation.status === 'completed'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {participation.status === 'pending'
                                            ? 'En attente'
                                            : participation.status ===
                                                'in_progress'
                                              ? 'En cours'
                                              : 'Examen terminé'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

ExamSessionShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions d’examen', href: examSessions.index() },
        { title: 'Suivi', href: examSessions.index() },
    ],
};
