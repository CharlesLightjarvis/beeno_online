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
import type {
    AttendanceStatus,
    CourseSessionStatus,
    SessionStudentOption,
} from '@/types';

type Session = {
    id: string;
    label: string;
    status: CourseSessionStatus;
    level: { code: string; name: string };
    students: SessionStudentOption[];
};

export default function AttendanceCreate({ session }: { session: Session }) {
    const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
        () =>
            Object.fromEntries(
                session.students.map((student) => [student.id, 'present']),
            ),
    );

    return (
        <>
            <Head title={`Présences — ${session.label}`} />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Prendre les présences
                    </h1>
                    <p className="text-muted-foreground">
                        {session.label} — {session.level.code}{' '}
                        {session.level.name}
                    </p>
                </div>
                <Separator />
                <Form
                    {...attendances.store.form(session.id)}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Date *</Label>
                                    <DatePicker
                                        name="held_on"
                                        defaultValue={new Date()}
                                    />
                                    <InputError message={errors.held_on} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="starts_at">
                                        Heure de début
                                    </Label>
                                    <TimePicker name="starts_at" />
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
                                        defaultValue="2"
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
                                        Tous les étudiants sont marqués présents
                                        par défaut. Modifiez uniquement les
                                        absents.
                                    </p>
                                </div>
                                {session.students.length === 0 ? (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                        Ajoutez d’abord des étudiants à cette
                                        session.
                                    </p>
                                ) : (
                                    <div className="divide-y rounded-md border">
                                        {session.students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex flex-wrap items-center justify-between gap-3 p-3"
                                            >
                                                <span className="font-medium">
                                                    {student.name}
                                                </span>
                                                <input
                                                    type="hidden"
                                                    name={`attendances[${student.id}]`}
                                                    value={statuses[student.id]}
                                                />
                                                <ToggleGroup
                                                    type="single"
                                                    variant="outline"
                                                    size="sm"
                                                    value={statuses[student.id]}
                                                    onValueChange={(value) => {
                                                        if (value) {
                                                            setStatuses(
                                                                (current) => ({
                                                                    ...current,
                                                                    [student.id]:
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
                                )}
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
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        session.students.length === 0
                                    }
                                >
                                    {processing && <Spinner />}
                                    Enregistrer les présences
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AttendanceCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
        { title: 'Prendre les présences', href: sessions.index() },
    ],
};
