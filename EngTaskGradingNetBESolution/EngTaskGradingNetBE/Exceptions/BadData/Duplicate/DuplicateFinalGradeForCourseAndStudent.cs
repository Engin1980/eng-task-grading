
namespace EngTaskGradingNetBE.Exceptions.BadData.Duplicate;

internal class DuplicateFinalGradeForCourseAndStudent(int courseId, int studentId) : DuplicateItemException("Final grade for course and student already exists.")
{
  public int CourseId { get; } = courseId;
  public int StudentId { get; } = studentId;
}