import { Head, Link } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import MarkdownContent from '@/components/markdown-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import student from '@/routes/student';
import examSessions from '@/routes/student/exam-sessions';

type ResultChoice = { id: string; label: string; body: string | null; is_correct: boolean };
type ResultTask = { position: number; prompt: string | null; response_type: 'choice' | 'text'; answer_text: string | null; selected_choice_id: string | null; selected_choice_label: string | null; is_correct: boolean | null; choices: ResultChoice[] };
type ResultModule = { module: string; correct: number; scored: number; pending: number; parts: { part_number: number; tasks: ResultTask[] }[] };

const moduleLabels: Record<string, string> = { lesen: 'Lesen', hoeren: 'Hören', schreiben: 'Schreiben', sprechen: 'Sprechen' };

export default function StudentExamSessionResults({ exam, summary, modules }: { exam: { title: string }; summary: { correct: number; scored: number; pending: number }; modules: ResultModule[] }) {
    return <>
        <Head title={`Résultats · ${exam.title}`} />
        <div className="container mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-semibold tracking-tight">Résultats</h1><p className="text-sm text-muted-foreground">{exam.title}</p></div>
                <Button variant="outline" asChild><Link href={examSessions.index()}>Retour à mes examens</Link></Button>
            </div>
            <section className="rounded-md border p-4"><p className="text-lg font-semibold">{summary.correct}/{summary.scored} réponses correctes</p><p className="text-sm text-muted-foreground">{summary.pending > 0 ? `${summary.pending} réponse(s) texte à corriger par le professeur.` : 'Correction automatique terminée.'}</p></section>
            <Separator />
            {modules.map((module) => <section key={module.module} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold">{moduleLabels[module.module] ?? module.module}</h2><Badge variant="secondary">{module.correct}/{module.scored} correctes{module.pending > 0 ? ` · ${module.pending} à corriger` : ''}</Badge></div>
                {module.parts.map((part) => <div key={`${module.module}-${part.part_number}`} className="space-y-4 rounded-md border p-4"><h3 className="font-semibold">Teil {part.part_number}</h3>{part.tasks.map((task) => <article key={task.position} className="space-y-3 rounded-md bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3"><h4 className="font-medium">Question {task.position}</h4>{task.response_type === 'text' ? <Badge variant="secondary">À corriger</Badge> : task.is_correct === null ? <Badge variant="secondary">Sans réponse</Badge> : task.is_correct ? <Badge className="bg-emerald-600"><Check className="mr-1 size-3" />Correcte</Badge> : <Badge variant="destructive"><X className="mr-1 size-3" />Incorrecte</Badge>}</div>
                    {module.module === 'schreiben' ? <MarkdownContent markdown={task.prompt ?? ''} /> : <p>{task.prompt}</p>}
                    {task.response_type === 'text' ? <div className="rounded-md border bg-background p-3 whitespace-pre-wrap">{task.answer_text || 'Aucune réponse.'}</div> : <div className="space-y-2">{task.choices.map((choice) => <div key={choice.id} className={`rounded-md border p-3 ${choice.is_correct ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : choice.id === task.selected_choice_id ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'bg-background'}`}><div className="flex items-start gap-2"><span className="font-semibold">{choice.label}</span><span>{choice.body}</span>{choice.is_correct && <span className="ml-auto text-xs font-semibold text-emerald-700">Bonne réponse</span>}{choice.id === task.selected_choice_id && !choice.is_correct && <span className="ml-auto text-xs font-semibold text-red-700">Votre réponse</span>}</div></div>)}</div>}
                </article>)}</div>)}
            </section>)}
        </div>
    </>;
}

StudentExamSessionResults.layout = { breadcrumbs: [{ title: 'Dashboard', href: student.dashboard() }, { title: 'Mes examens', href: examSessions.index() }, { title: 'Résultats', href: '#' }] };
