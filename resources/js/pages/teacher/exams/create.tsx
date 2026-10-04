import { Head } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import exams from '@/routes/teacher/exams';
import type { ExamFormData, ExamPart } from '@/types';
import ExamForm from './partials/exam-form';

const choices = (labels: string[]) => labels.map((label, index) => ({ label, body: null, is_correct: index === 0, position: index + 1 }));
const makePart = (part_number: number, taskCount: number, materialCount: number): ExamPart => ({
    part_number,
    instructions: part_number === 2 ? 'Welche Anzeige ist interessant für Sie? Kreuzen Sie an: a oder b.' : 'Sind die Aussagen richtig (+) oder falsch (−)? Kreuzen Sie an.',
    reading_materials: Array.from({ length: materialCount }, (_, index) => ({ source: '', title: null, body: '', position: index + 1 })),
    tasks: Array.from({ length: taskCount }, (_, index) => ({ reading_material_id: null, prompt: '', position: index + 1, choices: choices(part_number === 2 ? ['A', 'B'] : ['richtig', 'falsch']) })),
});
const teil1 = makePart(1, 5, 2);
teil1.tasks = teil1.tasks.map((task, index) => ({ ...task, reading_material_position: index < 2 ? 1 : 2 }));
const initialExam: ExamFormData = { title: 'TELC Deutsch A1 – Lesen', status: 'draft', parts: [teil1, makePart(2, 5, 0)] };

export default function ExamCreate() {
    return <><Head title="Créer un examen" /><ExamForm initial={initialExam} /></>;
}
ExamCreate.layout = { breadcrumbs: [{ title: 'Dashboard', href: teacher.dashboard() }, { title: 'Examens', href: exams.index() }, { title: 'Créer', href: exams.create() }] };
