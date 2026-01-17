namespace EngTaskGradingNetBE.Exceptions.BadData.Duplicate
{
  public class DuplicateCourseCodeException : DuplicateItemException
  {
    public string CourseCode { get; set; }

    public DuplicateCourseCodeException(string courseCode)
      : base($"A course with the code '{courseCode}' already exists.", null)
    {
      CourseCode = courseCode;
    }
  }
}
