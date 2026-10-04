import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import teacher from '@/routes/teacher';
import examSessions from '@/routes/teacher/exam-sessions';
import type { ExamSessionStudentOption, PublishedExamOption } from '@/types';

type Props = { exams: PublishedExamOption[]; students: ExamSessionStudentOption[]; selectedExamId: string };

export default function ExamSessionCreate({ exams, students, selectedExamId }: Props) {
    return (
        <>
            <Head title="Lancer une session d’examen" />
            <div className="container mx-auto space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lancer une session d’examen</h1>
                    <p className="text-muted-foreground">Choisissez un examen publié et les étudiants autorisés à le rejoindre.</p>
                </div>
                <Separator />
                <Form {...examSessions.store.form()} className="mx-auto max-w-3xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="exam_id">Examen *</Label>
                                <Select name="exam_id" defaultValue={selectedExamId || undefined} required>
                                    <SelectTrigger id="exam_id" className="w-full"><SelectValue placeholder="Choisir un examen publié" /></SelectTrigger>
                                    <SelectContent>
                                        {exams.map((exam) => <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.exam_id} />
                                {exams.length === 0 && <p className="text-sm text-muted-foreground">Aucun examen publié disponible. Publiez d’abord un examen TELC A1.</p>}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <Label>Étudiants participants</Label>
                                    <p className="text-sm text-muted-foreground">Seuls les étudiants sélectionnés pourront rejoindre avec le code de la session.</p>
                                </div>
                                {students.length === 0 ? (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Aucun étudiant actif disponible.</p>
                                ) : (
                                    <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                                        {students.map((student) => (
                                            <label key={student.id} className="flex cursor-pointer items-center gap-3 text-sm">
                                                <Checkbox name="student_ids[]" value={student.id} />
                                                <span>{student.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.student_ids} />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" asChild><Link href={examSessions.index()}>Annuler</Link></Button>
                                <Button type="submit" disabled={processing || exams.length === 0}>
                                    {processing && <Spinner className="mr-2" />}
                                    Créer la session
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ExamSessionCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: teacher.dashboard() },
        { title: 'Sessions d’examen', href: examSessions.index() },
        { title: 'Lancer', href: examSessions.create() },
    ],
};
