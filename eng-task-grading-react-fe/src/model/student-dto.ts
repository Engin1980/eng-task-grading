export interface StudentDto {
  id: number;
  number: string;
  email: string;
  name?: string;
  surname?: string;
  userName?: string;
  studyProgram?: string;
  studyForm?: string;
}

export interface StudentCreateDto {
  number: string;
  name: string;
  surname: string;
  userName: string;
  email: string;
  studyProgram: string;
  studyForm: string;
}

export interface StudentAnalysisResultDto {
  students: StudentCreateDto[];
  errors: string[];
}
