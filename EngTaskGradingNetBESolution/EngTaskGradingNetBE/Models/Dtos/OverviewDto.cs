namespace EngTaskGradingNetBE.Models.Dtos
{
  public record OverviewDto(List<CourseDto> Courses, List<StudentDto> Students, List<GradeDto> Grades);
}
