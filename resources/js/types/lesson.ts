export type AttendanceStatus = 'present' | 'absent';

export type LessonAttendance = {
    id: string;
    student_id: string;
    status: AttendanceStatus;
    student: {
        id: string;
        name: string;
    };
};

export type Lesson = {
    id: string;
    held_on: string;
    starts_at: string | null;
    duration_minutes: number;
    present_count: number;
    absent_count: number;
    attendances: LessonAttendance[];
};

export type SessionMetrics = {
    total_minutes: number;
    progress_percent: number;
    remuneration_millimes: number;
};
