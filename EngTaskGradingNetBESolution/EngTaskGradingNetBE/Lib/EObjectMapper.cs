namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher)
  {
    return new TeacherDto(teacher.Id, teacher.Email);
  }

  public static List<TeacherDto> To(IEnumerable<Teacher> teachers)
  {
    return teachers.Select(To).ToList();
  }
}
