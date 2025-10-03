export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  keywords: string | null;
  minGrade: number | null;
  aggregation: "min" | "max" | "avg" | "last";
}

export interface TaskCreateDto {
  courseId: number;
  title: string;
  description: string | null;
  keywords: string | null;
  minGrade: number | null;
  aggregation: "min" | "max" | "avg" | "last";
}

export interface TaskUpdateDto {
  title: string;
  description: string | null;
  keywords: string | null;
  minGrade: number | null;
  aggregation: "min" | "max" | "avg" | "last";
}