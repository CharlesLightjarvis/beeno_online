import { router, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import exams from '@/routes/teacher/exams';
import type { ExamFormData, ExamPart } from '@/types';
import PartEditor from './part-editor';

export default function ExamForm({ initial, examId }: { initial: ExamFormData; examId?: string }) {
    const form = useForm<ExamFormData>(initial);
    const [activePart, setActivePart] = useState('1');

    const onValidationError = (errors: Record<string, string>) => {
        const partIndex = Object.keys(errors).map((key) => key.match(/^parts\.(\d+)/)?.[1]).find((index) => index !== undefined);
        const invalidPart = partIndex === undefined ? undefined : form.data.parts[Number(partIndex)];

        if (invalidPart) {
            setActivePart(String(invalidPart.part_number));
        }
    };

    const submit = (status: ExamFormData['status']) => {
        form.transform((data) => ({ ...data, status }));

        if (examId) {
            form.put(exams.update(examId).url, { onError: onValidationError });
        } else {
            form.post(exams.store().url, { onError: onValidationError });
        }
    };
    const changePart = (index: number, part: ExamPart) => form.setData('parts', form.data.parts.map((item, i) => i === index ? part : item));

    const addThirdPart = () => {
        if (form.data.parts.some((part) => part.part_number === 3)) {
            return;
        }

        const part: ExamPart = {
            part_number: 3,
            instructions: 'Lesen Sie die Texte und die Aufgaben 11–15. Kreuzen Sie an: Richtig (+) oder falsch (−)?',
            reading_materials: Array.from({ length: 5 }, (_, index) => ({ source: '', title: null, body: '', position: index + 1 })),
            tasks: Array.from({ length: 5 }, (_, index) => ({
                reading_material_id: null,
                reading_material_position: index + 1,
                prompt: '',
                position: index + 1,
                choices: ['richtig', 'falsch'].map((label, choiceIndex) => ({ label, body: null, is_correct: choiceIndex === 0, position: choiceIndex + 1 })),
            })),
        };
        form.setData('parts', [...form.data.parts, part]);
        setActivePart('3');
    };

    const questionCount = form.data.parts.reduce((total, part) => total + part.tasks.length, 0);

    return <div className="mx-auto w-full max-w-5xl space-y-6 p-4"><div><h1 className="text-3xl font-bold tracking-tight">{examId ? 'Modifier l’examen' : 'Créer un examen'}</h1><p className="text-muted-foreground">TELC Deutsch A1 · Lesen · {form.data.parts.length} Teile · {questionCount} questions</p><p className="mt-1 text-sm text-muted-foreground">Le corrigé reste réservé au professeur. La publication nécessite les 3 Teile et leurs 15 questions.</p></div><Separator />
        <div className="space-y-2"><Label htmlFor="exam-title">Titre de l’examen</Label><Input id="exam-title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />{form.errors.title && <p className="text-sm text-destructive">{form.errors.title}</p>}</div>
        {form.errors.parts && <p role="alert" className="rounded-md border border-destructive p-3 text-sm text-destructive">{form.errors.parts}</p>}
        <div className="flex flex-wrap items-center gap-2"><div role="tablist" aria-label="Parties de l’examen" className="flex flex-1 flex-wrap gap-1 rounded-md bg-muted p-1">{form.data.parts.map((part) => <button key={part.part_number} type="button" role="tab" aria-selected={activePart === String(part.part_number)} onClick={() => setActivePart(String(part.part_number))} className={`rounded-sm px-3 py-2 text-sm font-medium ${activePart === String(part.part_number) ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Teil {part.part_number} <span className="text-xs text-muted-foreground">({part.tasks.length})</span></button>)}</div>{!form.data.parts.some((part) => part.part_number === 3) && <Button type="button" variant="outline" onClick={addThirdPart}><Plus className="mr-2 size-4" />Ajouter Teil 3</Button>}</div>
        {form.data.parts.map((part, index) => activePart === String(part.part_number) && <div key={part.part_number} role="tabpanel"><PartEditor part={part} partIndex={index} errors={form.errors} onChange={(next) => changePart(index, next)} /></div>)}
        <div className="flex flex-wrap justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" onClick={() => router.visit(exams.index())}>Annuler</Button><Button type="button" variant="secondary" disabled={form.processing} onClick={() => submit('draft')}>{form.processing ? 'Enregistrement…' : 'Enregistrer comme brouillon'}</Button><Button type="button" disabled={form.processing} onClick={() => submit('published')}>{form.processing ? 'Publication…' : 'Publier l’examen'}</Button></div>
    </div>;
}
