import type { CourseSessionStatus } from './course-session';

export type AdminOption = {
    id: string;
    name: string;
};

export type AdminLevelOption = AdminOption & {
    code: string;
};

export type AdminSessionFilters = {
    teacher_id: string | null;
    course_level_id: string | null;
    status: CourseSessionStatus | null;
};

export type AdminCourseSession = {
    id: string;
    label: string;
    target_minutes: number;
    hourly_rate_millimes: number;
    starts_on: string;
    status: CourseSessionStatus;
    students_count: number;
    total_minutes: number;
    progress_percent: number;
    remuneration_millimes: number;
    updated_at: string;
    teacher: AdminOption;
    level: AdminLevelOption;
};

export type AdminCourseSessionDetail = Omit<
    AdminCourseSession,
    | 'students_count'
    | 'total_minutes'
    | 'progress_percent'
    | 'remuneration_millimes'
    | 'updated_at'
> & {
    completed_at: string | null;
};

export type AdminTeacher = {
    id: string;
    name: string;
    active_sessions_count: number;
    completed_sessions_count: number;
    sessions_url: string;
    lessons_count: number;
    total_minutes: number;
    remuneration_millimes: number;
};
