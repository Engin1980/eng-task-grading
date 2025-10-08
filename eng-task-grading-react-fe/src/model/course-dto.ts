export interface CourseCreateDto {
  code: string;
  name?: string;
}

export interface CourseEditDto {
  code: string;
  name?: string;
}

export interface CourseDto {
  id: number;
  code: string;
  name?: string;
  studentsCount: number;
  tasksCount: number;
  attendancesCount: number;
}