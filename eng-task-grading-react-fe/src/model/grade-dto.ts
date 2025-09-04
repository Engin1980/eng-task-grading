import type { StudentDto } from "./student-dto";
import type { TaskDto } from "./task-dto";

export interface GradeDto {
  id: number;
  taskId: number;
  studentId: number;
  value: number;
  comment: string | null;
  date: Date;
}

export interface GradeCreateDto {
  taskId: number;
  studentId: number;
  value: number;
  comment: string | null;
}

export interface GradeUpdateDto {
  value?: number;
  comment?: string | null;
}

export interface GradeSet {
  tasks: TaskDto[];
  students: StudentDto[];
  grades: GradeDto[];
}