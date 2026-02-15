namespace EngTaskGradingNetBE.Exceptions.BadData.Common
{
  public class StudentNotInCourseException(string studentNumber, string courseCode) 
    : BadDataException($"Student with study number {studentNumber} is not enrolled in course with code {courseCode}.")
  {
    public string StudentNumber { get; } = studentNumber;
    public string CourseCode { get; } = courseCode;
  }
}
