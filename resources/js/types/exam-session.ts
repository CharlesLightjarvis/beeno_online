export type ExamSessionStatus = 'scheduled' | 'open' | 'closed';
export type ExamParticipationStatus = 'pending' | 'in_progress' | 'completed';

export type ExamSessionSummary = {
    id: string;
    title: string;
    access_code: string;
    status: ExamSessionStatus;
    participations_count: number;
    created_at: string;
};

export type ExamSessionStudentProgress = {
    id: string;
    student: { id: string; name: string };
    status: ExamParticipationStatus;
    joined_at: string | null;
    progress?: {
        module: string;
        part_number: number;
        answered_task_positions: number[];
        total_tasks: number;
    }[];
    last_seen_at: string | null;
    completed_at: string | null;
};

export type ExamSessionDetail = {
    id: string;
    title: string;
    access_code: string;
    status: ExamSessionStatus;
    opened_at: string | null;
    started_at?: string | null;
    active_module?: string | null;
    closed_at: string | null;
    displayed_material_id?: string | null;
    participations: ExamSessionStudentProgress[];
};

export type ExamSessionLobby = Omit<ExamSessionDetail, 'participations'> & {
    participations: Omit<ExamSessionStudentProgress, 'progress'>[];
};

export type ExamSessionReadingMaterial = {
    id: string;
    part_number: number;
    position: number;
    body: string | null;
    prompt?: string | null;
    announcements?: { label: string; body: string | null }[];
};

export type TeacherExamPart = {
    id: string;
    module: string;
    module_position: number;
    part_number: number;
    instructions: string | null;
    reading_materials: { id: string; position: number; body: string; media_type: string; media_url: string | null }[];
    tasks: {
        id: string;
        position: number;
        prompt: string | null;
        response_type: 'choice' | 'text';
        choices: { label: string; body: string | null }[];
    }[];
};

export type PublishedExamOption = { id: string; title: string };
export type ExamSessionStudentOption = { id: string; name: string };

export type StudentExamParticipationSummary = {
    id: string;
    title: string;
    session_status: ExamSessionStatus;
    status: ExamParticipationStatus;
    joined_at: string | null;
};
export type StudentExamChoice = { id: string; label: string; body?: string | null };
export type StudentExamTask = {
    id: string;
    position: number;
    prompt: string | null;
    response_type: 'choice' | 'text';
    material?: { media_type: string; media_url: string | null; body: string | null } | null;
    choices: StudentExamChoice[];
};
export type StudentExamPart = {
    id: string;
    part_number: number;
    module: 'lesen' | 'hoeren' | 'schreiben' | 'sprechen' | string;
    instructions: string | null;
    tasks: StudentExamTask[];
};
export type StudentExamDelivery = { title: string; parts: StudentExamPart[] };
export type StudentExamParticipation = {
    id: string;
    session_id: string;
    student_id: string;
    status: ExamParticipationStatus;
    completed_at: string | null;
    session_status: ExamSessionStatus;
    started_at: string | null;
};
