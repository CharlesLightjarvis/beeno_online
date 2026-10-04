import { Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExamReadingMaterial, ExamTask } from '@/types';
import ChoiceCardEditor from './choice-card-editor';

export default function TaskEditor({ partNumber, partIndex, taskIndex, errors, task, materialOptions, onChange, onRemove }: { partNumber: number; partIndex: number; taskIndex: number; errors: Record<string, string>; task: ExamTask; materialOptions: ExamReadingMaterial[]; onChange: (task: ExamTask) => void; onRemove: () => void }) {
    const error = (path: string) => errors[`parts.${partIndex}.tasks.${taskIndex}.${path}`];
    const updateChoice = (index: number, choice: ExamTask['choices'][number]) => onChange({ ...task, choices: task.choices.map((item, i) => i === index ? choice : item) });

    const updateMaterial = (position: number | null) => {
        const material = materialOptions.find((item) => item.position === position);
        onChange({ ...task, reading_material_id: material?.id ?? null, reading_material_position: position });
    };

    const questionNumber = (partNumber - 1) * 5 + task.position;

    return <section className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between"><h3 className="font-semibold">Question {questionNumber}</h3><Button type="button" variant="ghost" size="sm" onClick={onRemove}><Trash2 className="mr-2 size-4" />Supprimer</Button></div>
        {materialOptions.length > 0 && partNumber !== 2 && <div className="space-y-2"><Label htmlFor={`material-${partNumber}-${task.position}`}>Texte associé</Label><select id={`material-${partNumber}-${task.position}`} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={task.reading_material_position ?? materialOptions.find((material) => material.id === task.reading_material_id)?.position ?? ''} onChange={(event) => updateMaterial(Number(event.target.value) || null)}><option value="">Choisir le texte</option>{materialOptions.map((material, index) => <option key={material.id ?? material.position} value={material.position}>Texte {index + 1}{material.source ? ` — ${material.source}` : ''}</option>)}</select></div>}
        <InputError message={error('position')} />
        <div className="space-y-2"><Label htmlFor={`prompt-${partNumber}-${task.position}`}>{partNumber === 2 ? 'Question' : 'Affirmation'}</Label><Input id={`prompt-${partNumber}-${task.position}`} value={task.prompt} onChange={(event) => onChange({ ...task, prompt: event.target.value })} /><InputError message={error('prompt')} /></div>
        {partNumber === 2 && <div><p className="mb-3 text-sm text-muted-foreground">Les annonces A et B sont présentées ensemble à l’étudiant. Vous pouvez les prévisualiser et les modifier ici.</p><div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row">{task.choices.map((choice, index) => <div key={choice.label} className="min-w-0 flex-1"><ChoiceCardEditor idPrefix={`${partNumber}-${task.position}`} choice={choice} error={error(`choices.${index}.body`)} onChange={(next) => updateChoice(index, next)} /></div>)}</div><InputError message={error('choices')} /></div>}
        <fieldset className="space-y-2"><legend className="text-sm font-medium">Réponse attendue — visible par le professeur uniquement</legend><div className="flex flex-wrap gap-5">{task.choices.map((choice) => <label key={choice.label} className="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name={`correct-${partNumber}-${task.position}`} checked={choice.is_correct} onChange={() => onChange({ ...task, choices: task.choices.map((item) => ({ ...item, is_correct: item.label === choice.label })) })} />{partNumber === 2 ? `Choix ${choice.label}` : choice.label}</label>)}</div></fieldset>
    </section>;
}
