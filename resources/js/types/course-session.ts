export type CourseSessionStatus = 'active' | 'completed';

export type CourseLevelOption = {
    id: string;
    code: string;
    name: string;
    target_minutes: number;
};

export type SessionStudentOption = {
    id: string;
    name: string;
};

export type CourseSession = {
    id: string;
    label: string;
    target_minutes: number;
    hourly_rate_millimes: number;
    starts_on: string;
    status: CourseSessionStatus;
    can_create_next_session: boolean;
    students_count: number;
    level: Pick<CourseLevelOption, 'id' | 'code' | 'name'>;
    created_at: string;
};

export type CourseSessionDetail = Omit<
    CourseSession,
    'students_count' | 'created_at'
> & {
    completed_at: string | null;
};

export type TeacherDashboardSummary = {
    active_sessions: number;
    completed_sessions: number;
    lessons_count: number;
    total_minutes: number;
    remuneration_millimes: number;
};

export type TeacherDashboardSession = {
    id: string;
    label: string;
    target_minutes: number;
    starts_on: string;
    level: Pick<CourseLevelOption, 'id' | 'code' | 'name'>;
    students_count: number;
    total_minutes: number;
    progress_percent: number;
    remuneration_millimes: number;
};

export type TeacherDashboardLesson = {
    id: string;
    held_on: string;
    starts_at: string | null;
    duration_minutes: number;
    session_id: string;
    session_label: string;
};
