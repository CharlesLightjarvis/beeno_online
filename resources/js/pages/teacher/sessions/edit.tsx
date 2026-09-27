import { Form, Head } from '@inertiajs/react';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import teacher from '@/routes/teacher';
import sessions from '@/routes/teacher/sessions';
import type { CourseLevelOption, SessionStudentOption } from '@/types';

type Props = {
    session: {
        id: string;
        label: string;
        course_level_id: string;
        starts_on: string;
    };
    levels: CourseLevelOption[];
    students: SessionStudentOption[];
    selectedStudentIds: string[];
};

export default function SessionEdit({
    session,
    levels,
    students,
    selectedStudentIds,
}: Props) {
    return (
        <>
            <Head title={`Modifier ${session.label}`} />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Modifier la session
                    </h1>
                    <p className="text-muted-foreground">
                        Modifiez le niveau, la date et les étudiants de ce
                        groupe.
                    </p>
                </div>
                <Separator />
                <Form
                    {...sessions.update.form(session.id)}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="label">Libellé *</Label>
                                    <Input
                                        id="label"
                                        name="label"
                                        defaultValue={session.label}
                                        autoFocus
                                    />
                                    <InputError message={errors.label} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course_level_id">
                                        Sous-niveau *
                                    </Label>
                                    <Select
                                        name="course_level_id"
                                        defaultValue={session.course_level_id}
                                    >
                                        <SelectTrigger
                                            id="course_level_id"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Choisir un niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {levels.map((level) => (
                                                <SelectItem
                                                    key={level.id}
                                                    value={level.id}
                                                >
                                                    {level.code} — {level.name}{' '}
                                                    ({level.target_minutes / 60}{' '}
                                                    h)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.course_level_id}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de début *</Label>
                                    <DatePicker
                                        name="starts_on"
                                        defaultValue={
                                            new Date(
                                                `${session.starts_on}T00:00:00`,
                                            )
                                        }
                                    />
                                    <InputError message={errors.starts_on} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label>Étudiants</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Vous pouvez modifier les participants à
                                        tout moment.
                                    </p>
                                </div>
                                {students.length === 0 ? (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                        Aucun étudiant actif disponible.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                                        {students.map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex cursor-pointer items-center gap-3 text-sm"
                                            >
                                                <Checkbox
                                                    name="student_ids[]"
                                                    value={student.id}
                                                    defaultChecked={selectedStudentIds.includes(
                                                        student.id,
                                                    )}
                                                />
                                                <span>{student.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.student_ids} />
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
                                    Enregistrer
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SessionEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
        { title: 'Modifier', href: sessions.index() },
    ],
};
