export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  keywords: string | null;
  minGrade: number | null;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  keywords?: string;
  minGrade?: number;
}