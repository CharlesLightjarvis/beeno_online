import { Form, Head } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import { TimePicker } from '@/components/time-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import attendances from '@/routes/teacher/sessions/attendances';
import type { AttendanceStatus, LessonAttendance } from '@/types';

type Props = {
    session: {
        id: string;
        label: string;
        level: { code: string; name: string };
    };
    lesson: {
        id: string;
        held_on: string;
        starts_at: string | null;
        duration_hours: number;
        attendances: LessonAttendance[];
    };
};

export default function AttendanceEdit({ session, lesson }: Props) {
    const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
        () =>
            Object.fromEntries(
                lesson.attendances.map((attendance) => [
                    attendance.student_id,
                    attendance.status,
                ]),
            ),
    );

    return (
        <>
            <Head title={`Modifier les présences — ${session.label}`} />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Modifier les présences
                    </h1>
                    <p className="text-muted-foreground">
                        {session.label} — {session.level.code}{' '}
                        {session.level.name}
                    </p>
                </div>
                <Separator />
                <Form
                    {...attendances.update.form([session.id, lesson.id])}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Date *</Label>
                                    <DatePicker
                                        name="held_on"
                                        defaultValue={
                                            new Date(
                                                `${lesson.held_on}T00:00:00`,
                                            )
                                        }
                                    />
                                    <InputError message={errors.held_on} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="starts_at">
                                        Heure de début
                                    </Label>
                                    <TimePicker
                                        name="starts_at"
                                        defaultValue={lesson.starts_at}
                                    />
                                    <InputError message={errors.starts_at} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration_hours">
                                        Durée en heures *
                                    </Label>
                                    <Input
                                        id="duration_hours"
                                        name="duration_hours"
                                        type="number"
                                        min="0.25"
                                        step="0.25"
                                        defaultValue={lesson.duration_hours}
                                    />
                                    <InputError
                                        message={errors.duration_hours}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label>Étudiants *</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Corrigez le statut des étudiants pour
                                        cette séance uniquement.
                                    </p>
                                </div>
                                <div className="divide-y rounded-md border">
                                    {lesson.attendances.map((attendance) => (
                                        <div
                                            key={attendance.id}
                                            className="flex flex-wrap items-center justify-between gap-3 p-3"
                                        >
                                            <span className="font-medium">
                                                {attendance.student.name}
                                            </span>
                                            <input
                                                type="hidden"
                                                name={`attendances[${attendance.student_id}]`}
                                                value={
                                                    statuses[
                                                        attendance.student_id
                                                    ]
                                                }
                                            />
                                            <ToggleGroup
                                                type="single"
                                                variant="outline"
                                                size="sm"
                                                value={
                                                    statuses[
                                                        attendance.student_id
                                                    ]
                                                }
                                                onValueChange={(value) => {
                                                    if (value) {
                                                        setStatuses(
                                                            (current) => ({
                                                                ...current,
                                                                [attendance.student_id]:
                                                                    value as AttendanceStatus,
                                                            }),
                                                        );
                                                    }
                                                }}
                                            >
                                                <ToggleGroupItem value="present">
                                                    <Check />
                                                    Présent
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="absent">
                                                    <X />
                                                    Absent
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.attendances} />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => history.back()}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Enregistrer les modifications
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AttendanceEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
        { title: 'Modifier les présences', href: sessions.index() },
    ],
};
