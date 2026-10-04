import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import teacher from '@/routes/teacher';
import students from '@/routes/teacher/students';
import type { Student } from '@/types';

export default function StudentEdit({ student }: { student: Student }) {
    return (
        <>
            <Head title={`Modifier ${student.name}`} />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {student.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Modifiez l'identité de l'étudiant.
                    </p>
                </div>
                <Separator />
                <Form
                    {...students.update.form(student.id)}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={student.name}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse e-mail *</Label>
                                    <Input id="email" name="email" type="email" autoComplete="email" defaultValue={student.email ?? ''} />
                                    <InputError message={errors.email} />
                                </div>
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

StudentEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Étudiants', href: students.index() },
        { title: 'Modifier', href: students.index() },
    ],
};
