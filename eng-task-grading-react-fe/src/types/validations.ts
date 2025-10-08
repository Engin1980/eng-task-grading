export function isStudentNumberValid(number: string): boolean {
  const studentNumberPattern = /^[A-Z]\d{5}$/;
  return studentNumberPattern.test(number);
}

export function isCourseCodeValid(code: string): boolean {
  return code != null && code.trim().length > 0;
}