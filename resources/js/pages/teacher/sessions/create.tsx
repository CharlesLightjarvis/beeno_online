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
    levels: CourseLevelOption[];
    students: SessionStudentOption[];
    defaults: {
        previous_session_id: string;
        course_level_id: string;
        label: string;
        student_ids: string[];
    } | null;
};

export default function SessionCreate({ levels, students, defaults }: Props) {
    const isContinuation = defaults !== null;

    return (
        <>
            <Head
                title={
                    isContinuation
                        ? 'Créer la session suivante'
                        : 'Créer une session'
                }
            />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isContinuation
                            ? 'Créer la session suivante'
                            : 'Créer une session'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isContinuation
                            ? 'Le niveau suivant et les anciens étudiants sont déjà sélectionnés. Vous pouvez adapter le groupe.'
                            : 'Choisissez le niveau et les étudiants de ce groupe.'}
                    </p>
                </div>
                <Separator />
                <Form
                    {...sessions.store.form()}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {defaults && (
                                <input
                                    type="hidden"
                                    name="previous_session_id"
                                    value={defaults.previous_session_id}
                                />
                            )}
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="label">Libellé *</Label>
                                    <Input
                                        id="label"
                                        name="label"
                                        placeholder="A1.1 — Matin"
                                        defaultValue={defaults?.label}
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
                                        defaultValue={defaults?.course_level_id}
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
                                    <Label htmlFor="starts_on">
                                        Date de début *
                                    </Label>
                                    <DatePicker name="starts_on" />
                                    <InputError message={errors.starts_on} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label>Étudiants</Label>
                                    <p className="text-sm text-muted-foreground">
                                        La session peut être créée sans
                                        étudiant.
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
                                                    defaultChecked={defaults?.student_ids.includes(
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
                                    {processing && <Spinner className="mr-2" />}
                                    {isContinuation
                                        ? 'Créer la session suivante'
                                        : 'Créer la session'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SessionCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions', href: sessions.index() },
        { title: 'Créer', href: sessions.create() },
    ],
};
