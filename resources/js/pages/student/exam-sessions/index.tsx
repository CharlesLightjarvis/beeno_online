import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import student from '@/routes/student';
import examSessions from '@/routes/student/exam-sessions';
import type { StudentExamParticipationSummary } from '@/types';

const stateLabels = {
    scheduled: 'En attente du professeur',
    open: 'Ouverte',
    closed: 'Clôturée',
} as const;

export default function StudentExamSessionsIndex({
    participations,
}: {
    participations: StudentExamParticipationSummary[];
}) {
    const [selectedParticipation, setSelectedParticipation] =
        useState<StudentExamParticipationSummary | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm({ code: '' });

    const openSession = (participation: StudentExamParticipationSummary) => {
        setSelectedParticipation(participation);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedParticipation(null);
        form.reset();
        form.clearErrors();
    };

    const submitAccessCode = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedParticipation) {
            return;
        }

        form.post(examSessions.access(selectedParticipation.id).url, {
            onSuccess: closeDialog,
        });
    };

    return (
        <>
            <Head title="Mes examens" />
            <div className="container mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Mes examens
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Les examens qui vous sont attribués apparaissent ici. Le
                        code communiqué par votre professeur vous sera demandé
                        lorsque vous ouvrirez une session.
                    </p>
                </div>
                <Separator />

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Sessions attribuées
                    </h2>
                    <div className="overflow-hidden rounded-md border">
                        {participations.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                Aucune session d’examen ne vous a encore été
                                attribuée.
                            </p>
                        ) : (
                            participations.map((participation) => (
                                <div
                                    key={participation.id}
                                    className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-0"
                                >
                                    <div className="min-w-0 space-y-1">
                                        <p className="truncate font-medium">
                                            {participation.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            TELC Deutsch A1 · Lesen
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                participation.session_status ===
                                                'open'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {
                                                stateLabels[
                                                    participation.session_status
                                                ]
                                            }
                                        </Badge>
                                        {participation.joined_at !== null &&
                                            (participation.session_status !==
                                                'closed' ||
                                                participation.status ===
                                                    'completed') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={examSessions.show(
                                                            participation.id,
                                                        )}
                                                    >
                                                        {participation.status ===
                                                        'completed'
                                                            ? 'Consulter'
                                                            : 'Reprendre'}
                                                    </Link>
                                                </Button>
                                            )}
                                        {participation.joined_at === null &&
                                            participation.session_status ===
                                                'open' &&
                                            participation.status !==
                                                'completed' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openSession(
                                                            participation,
                                                        )
                                                    }
                                                >
                                                    Ouvrir
                                                </Button>
                                            )}
                                        {participation.status ===
                                            'completed' && (
                                            <Badge variant="secondary">
                                                Terminée
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setDialogOpen(true);
                    } else if (!form.processing) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Code d’accès à l’examen</DialogTitle>
                        <DialogDescription>
                            Saisissez le code communiqué par votre professeur
                            pour rejoindre la salle d’attente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAccessCode} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="exam-access-code">
                                Code de la session
                            </Label>
                            <Input
                                id="exam-access-code"
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                autoComplete="off"
                                autoCapitalize="characters"
                                maxLength={8}
                                placeholder="AB12CD34"
                                className="font-mono tracking-widest uppercase"
                                aria-invalid={Boolean(form.errors.code)}
                                aria-describedby={
                                    form.errors.code
                                        ? 'exam-access-code-error'
                                        : undefined
                                }
                                required
                            />
                            <div id="exam-access-code-error">
                                <InputError message={form.errors.code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={form.processing}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    form.data.code.length !== 8
                                }
                            >
                                {form.processing && (
                                    <Spinner className="mr-2" />
                                )}
                                Entrer dans la salle
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

StudentExamSessionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: student.dashboard() },
        { title: 'Mes examens', href: examSessions.index() },
    ],
};
