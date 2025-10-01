// --- NewGradeSet DTOs ---
import type { TaskDto } from "./task-dto";
import type { StudentDto } from "./student-dto";

export interface NewGradeSetStudentDto {
  student: StudentDto;
  finalValue: number | null;
  grades: GradeDto[];
}

export interface NewGradeSetTaskDto {
  task: TaskDto;
  students: NewGradeSetStudentDto[];
}

export interface NewGradeSetDto {
  tasks: NewGradeSetTaskDto[];
}

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

