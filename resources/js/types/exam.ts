export type ExamStatus = 'draft' | 'published';

export interface ExamChoice { id?: string; label: string; body: string | null; is_correct: boolean; position: number }
export interface ExamTask { id?: string; reading_material_id: string | null; reading_material_position?: number | null; prompt: string; response_type?: 'choice' | 'text'; position: number; choices: ExamChoice[] }
export interface ExamReadingMaterial { id?: string; source: string; title: string | null; body: string; media_type?: 'text' | 'audio'; media_url?: string | null; position: number }
export interface ExamPart { id?: string; module?: 'lesen' | 'hoeren' | 'schreiben' | 'sprechen' | string; part_number: number; instructions: string; reading_materials: ExamReadingMaterial[]; tasks: ExamTask[] }
export interface ExamFormData { title: string; level?: 'A1' | 'A2' | 'B1' | 'B2'; module_order?: string[]; status: ExamStatus; parts: ExamPart[] }
export interface ExamSummary { id: string; title: string; level: string; status: ExamStatus; parts_count: number; tasks_count: number; updated_at: string }
export type ExamRecord = ExamFormData & { id: string; level: string };
