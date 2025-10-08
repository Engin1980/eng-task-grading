export function isStudentNumberValid(number: string): boolean {
  const studentNumberPattern = /^[A-Z]\d{5}$/;
  return studentNumberPattern.test(number);
}