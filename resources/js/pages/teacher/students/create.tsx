import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import teacher from '@/routes/teacher';
import students from '@/routes/teacher/students';

export default function StudentCreate() {
    return (
        <>
            <Head title="Ajouter un étudiant" />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Ajouter un étudiant
                    </h1>
                    <p className="text-muted-foreground">
                        Renseignez le nom complet de l'étudiant.
                    </p>
                </div>
                <Separator />
                <Form
                    {...students.store.form()}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet *</Label>
                                    <Input id="name" name="name" autoFocus />
                                    <InputError message={errors.name} />
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
                                    Ajouter l'étudiant
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

StudentCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Étudiants', href: students.index() },
        { title: 'Ajouter', href: students.create() },
    ],
};
