import { Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import MdxContentEditor from '@/components/mdx-content-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ExamPart, ExamTask } from '@/types';
import TaskEditor from './task-editor';

export default function PartEditor({ part, partIndex, errors, onChange }: { part: ExamPart; partIndex: number; errors: Record<string, string>; onChange: (part: ExamPart) => void }) {
    const error = (path: string) => errors[`parts.${partIndex}.${path}`];
    const labels = part.part_number === 2 ? 'Annonces A / B' : 'richtig (+) / falsch (−)';
    const setTask = (index: number, task: ExamTask) => onChange({ ...part, tasks: part.tasks.map((item, i) => i === index ? task : item) });
    const renumber = (tasks: ExamTask[]) => tasks.map((task, index) => ({ ...task, position: index + 1 }));
    const addTask = () => {
        if (part.tasks.length >= 5) {
            return;
        }

        const labelsForTask = part.part_number === 2 ? ['A', 'B'] : ['richtig', 'falsch'];
        const choices = labelsForTask.map((label, index) => ({ label, body: null, is_correct: index === 0, position: index + 1 }));
        onChange({ ...part, tasks: renumber([...part.tasks, { reading_material_id: null, prompt: '', position: part.tasks.length + 1, choices }]) });
    };
    const removeMaterial = (index: number) => {
        const removed = part.reading_materials[index];
        const reading_materials = part.reading_materials.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, position: itemIndex + 1 }));

        if (part.part_number !== 2) {
            const remainingTasks = part.tasks.filter((task) => {
                const taskMaterial = part.reading_materials.find((material) => material.id && material.id === task.reading_material_id);
                const taskPosition = task.reading_material_position ?? taskMaterial?.position ?? (part.reading_materials.length === 1 ? 1 : null);

                return taskMaterial !== removed && taskPosition !== removed.position;
            }).map((task, taskIndex) => {
                const taskMaterial = part.reading_materials.find((material) => material.id && material.id === task.reading_material_id);
                const taskPosition = task.reading_material_position ?? taskMaterial?.position ?? null;

                return { ...task, position: taskIndex + 1, reading_material_position: taskPosition !== null && taskPosition > removed.position ? taskPosition - 1 : taskPosition };
            });

            onChange({ ...part, reading_materials, tasks: remainingTasks });

            return;
        }

        const tasks = part.tasks.map((task) => {
            const selectedPosition = task.reading_material_position ?? part.reading_materials.find((material) => material.id === task.reading_material_id)?.position;

            if (task.reading_material_id === removed.id || selectedPosition === removed.position) {
                return { ...task, reading_material_id: null, reading_material_position: null };
            }

            return selectedPosition !== undefined && selectedPosition > removed.position && task.reading_material_id === null
                ? { ...task, reading_material_position: selectedPosition - 1 }
                : task;
        });

        onChange({ ...part, reading_materials, tasks });
    };
    const addMaterial = () => onChange({ ...part, reading_materials: [...part.reading_materials, { source: '', title: null, body: '', position: part.reading_materials.length + 1 }] });

    const addQuestionToMaterial = (materialIndex: number) => {
        if (part.tasks.length >= 5) {
            return;
        }

        const material = part.reading_materials[materialIndex];
        const choices = ['richtig', 'falsch'].map((label, index) => ({ label, body: null, is_correct: index === 0, position: index + 1 }));
        onChange({
            ...part,
            tasks: renumber([...part.tasks, { reading_material_id: material.id ?? null, reading_material_position: material.position, prompt: '', position: part.tasks.length + 1, choices }]),
        });
    };

    if (part.part_number !== 2) {
        return <div className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4">
                <h2 className="font-semibold">Teil {part.part_number} · richtig (+) / falsch (−)</h2>
                <p className="mt-1 text-sm text-muted-foreground">Composez chaque passage dans l’éditeur MDX, puis ajoutez ses affirmations juste en dessous. Vous pouvez répartir les 5 questions entre plusieurs textes.</p>
                <div className="mt-3 space-y-2"><Label htmlFor={`instructions-${part.part_number}`}>Consignes</Label><Textarea id={`instructions-${part.part_number}`} value={part.instructions} onChange={(event) => onChange({ ...part, instructions: event.target.value })} rows={2} /><InputError message={error('instructions')} /></div>
            </div>
            <InputError message={error('reading_materials')} />
            {part.reading_materials.map((material, materialIndex) => {
                const associatedTasks = part.tasks.flatMap((task, taskIndex) => {
                    const taskMaterial = part.reading_materials.find((item) => item.id && item.id === task.reading_material_id);
                    const taskPosition = task.reading_material_position ?? taskMaterial?.position ?? (part.reading_materials.length === 1 ? 1 : null);

                    return taskMaterial === material || taskPosition === material.position ? [{ task, taskIndex }] : [];
                });

                return <section key={material.id ?? material.position} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between"><h3 className="font-semibold">Texte {materialIndex + 1}</h3><Button type="button" variant="ghost" size="sm" onClick={() => removeMaterial(materialIndex)}><Trash2 className="mr-2 size-4" />Supprimer texte et {associatedTasks.length} question(s)</Button></div>
                    <div className="space-y-2"><Label>Contenu du texte</Label><MdxContentEditor id={`part-${part.part_number}-material-${material.id ?? material.position}`} markdown={material.body ?? ''} onChange={(body) => onChange({ ...part, reading_materials: part.reading_materials.map((item, index) => index === materialIndex ? { ...item, body } : item) })} /><InputError message={error(`reading_materials.${materialIndex}.body`)} /></div>
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between"><h4 className="text-sm font-semibold">Questions sur ce texte ({associatedTasks.length})</h4><Button type="button" variant="outline" size="sm" disabled={part.tasks.length >= 5} onClick={() => addQuestionToMaterial(materialIndex)}><Plus className="mr-2 size-4" />Ajouter une question</Button></div>
                        {associatedTasks.map(({ task, taskIndex }) => <TaskEditor key={task.id ?? task.position} partNumber={part.part_number} partIndex={partIndex} taskIndex={taskIndex} errors={errors} materialOptions={[]} task={task} onChange={(next) => setTask(taskIndex, next)} onRemove={() => onChange({ ...part, tasks: renumber(part.tasks.filter((_, index) => index !== taskIndex)) })} />)}
                    </div>
                </section>;
            })}
            <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={addMaterial}><Plus className="mr-2 size-4" />Ajouter un texte</Button><span className="text-sm text-muted-foreground">{part.tasks.length}/5 questions au total</span></div>
            {part.tasks.length < 5 && part.reading_materials.length === 0 && <p className="text-sm text-muted-foreground">Ajoutez un texte avant de créer ses questions.</p>}
        </div>;
    }

    return <div className="space-y-6">
        <InputError message={error('instructions')} />
        <div className="rounded-lg border bg-muted/30 p-4"><h2 className="font-semibold">Teil {part.part_number} · {labels}</h2><p className="mt-1 text-sm text-muted-foreground">{part.part_number === 2 ? 'Une consigne et deux annonces présentées côte à côte pour chaque question.' : 'Ajoutez les textes communs, puis reliez chaque affirmation au bon texte.'}</p><div className="mt-3 space-y-2"><Label htmlFor={`instructions-${part.part_number}`}>Consignes</Label><Textarea id={`instructions-${part.part_number}`} value={part.instructions} onChange={(event) => onChange({ ...part, instructions: event.target.value })} rows={2} /></div></div>
        {part.reading_materials.map((material, index) => <section key={material.id ?? material.position} className="space-y-3 rounded-lg border p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Texte {index + 1}</h3><Button type="button" variant="ghost" size="sm" onClick={() => removeMaterial(index)}><Trash2 className="mr-2 size-4" />Supprimer</Button></div><div className="space-y-2"><Label htmlFor={`material-source-${part.part_number}-${index}`}>Type de document / source</Label><Input id={`material-source-${part.part_number}-${index}`} value={material.source} onChange={(event) => onChange({ ...part, reading_materials: part.reading_materials.map((item, i) => i === index ? { ...item, source: event.target.value } : item) })} placeholder="E-Mail von Karin an Li" /></div><div className="space-y-2"><Label htmlFor={`material-title-${part.part_number}-${index}`}>Titre (facultatif)</Label><Input id={`material-title-${part.part_number}-${index}`} value={material.title ?? ''} onChange={(event) => onChange({ ...part, reading_materials: part.reading_materials.map((item, i) => i === index ? { ...item, title: event.target.value } : item) })} placeholder="Hallo Li," /></div><div className="space-y-2"><Label htmlFor={`material-body-${part.part_number}-${index}`}>Texte affiché à l’étudiant</Label><Textarea id={`material-body-${part.part_number}-${index}`} rows={7} value={material.body} onChange={(event) => onChange({ ...part, reading_materials: part.reading_materials.map((item, i) => i === index ? { ...item, body: event.target.value } : item) })} /></div></section>)}
        {part.part_number !== 2 && <Button type="button" variant="outline" onClick={addMaterial}><Plus className="mr-2 size-4" />Ajouter un texte</Button>}
        {part.tasks.map((task, index) => <TaskEditor key={task.id ?? task.position} partNumber={part.part_number} partIndex={partIndex} taskIndex={index} errors={errors} materialOptions={part.reading_materials} task={task} onChange={(next) => setTask(index, next)} onRemove={() => onChange({ ...part, tasks: renumber(part.tasks.filter((_, i) => i !== index)) })} />)}
        <Button type="button" variant="outline" disabled={part.tasks.length >= 5} onClick={addTask}><Plus className="mr-2 size-4" />Ajouter une question ({part.tasks.length}/5)</Button>
    </div>;
}
