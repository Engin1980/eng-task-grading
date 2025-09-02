export interface CourseOverviewDto {
  id: number;
  code: string;
  name?: string;
  studentCount: number;
  taskCount: number;
}