import InputError from '@/components/input-error';
import MdxContentEditor from '@/components/mdx-content-editor';
import { Label } from '@/components/ui/label';
import type { ExamChoice } from '@/types';

export default function ChoiceCardEditor({ choice, idPrefix, error, onChange }: { choice: ExamChoice; idPrefix: string; error?: string; onChange: (choice: ExamChoice) => void }) {
    const fieldId = `${idPrefix}-${choice.label}`;

    return (
        <fieldset className="min-w-0 space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <legend className="px-2 text-sm font-semibold">Annonce {choice.label} — contenu MDX</legend>
            <Label htmlFor={`choice-body-${fieldId}`}>Contenu affiché à l’étudiant</Label>
            <MdxContentEditor
                id={`choice-${fieldId}`}
                markdown={choice.body ?? ''}
                onChange={(body) => onChange({ ...choice, body })}
            />
            <InputError message={error} />
        </fieldset>
    );
}
