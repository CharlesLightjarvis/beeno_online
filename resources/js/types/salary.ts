import type { PaymentStatus } from './payment-status';

export type SessionPayment = {
    id: string;
    amount_millimes: number;
    paid_on: string;
};

export type TeacherSalary = {
    id: string;
    label: string;
    completed_at: string | null;
    lessons_count: number;
    total_minutes: number;
    hourly_rate_millimes: number;
    salary_millimes: number;
    paid_millimes: number;
    remaining_millimes: number;
    payments: SessionPayment[];
    payment_status: PaymentStatus;
};

export type AdminSalary = TeacherSalary & {
    teacher_name: string;
};

export type AdminSalarySummary = {
    total_millimes: number;
    paid_millimes: number;
    remaining_millimes: number;
};
