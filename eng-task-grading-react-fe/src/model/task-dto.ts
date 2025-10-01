export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  keywords: string | null;
  minGrade: number | null;
  aggregation: string | null;
}

export interface TaskCreateDto {
  courseId: number;
  title: string;
  description?: string;
  keywords?: string;
  minGrade?: number;
}