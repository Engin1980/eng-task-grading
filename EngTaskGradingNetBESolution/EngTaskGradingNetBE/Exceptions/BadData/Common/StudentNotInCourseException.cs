namespace EngTaskGradingNetBE.Exceptions.BadData.Common
{
  public class StudentNotInCourseException(string studentNumber, string courseCode) 
    : BadDataException($"Student with study number {studentNumber} is not enrolled in course with code {courseCode}.")
  {
  }
}
