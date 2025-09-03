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

export interface GradeSet {
  tasks: TaskDto[];
  students: StudentDto[];
  grades: GradeDto[];
}