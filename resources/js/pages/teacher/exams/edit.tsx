import { Head } from '@inertiajs/react';
import teacher from '@/routes/teacher';
import exams from '@/routes/teacher/exams';
import type { ExamRecord } from '@/types';
import ExamForm from './partials/exam-form';

export default function ExamEdit({ exam }: { exam: ExamRecord }) {
    return <><Head title={`Modifier ${exam.title}`} /><ExamForm initial={exam} examId={exam.id} /></>;
}
ExamEdit.layout = { breadcrumbs: [{ title: 'Dashboard', href: teacher.dashboard() }, { title: 'Examens', href: exams.index() }, { title: 'Modifier', href: '#' }] };
