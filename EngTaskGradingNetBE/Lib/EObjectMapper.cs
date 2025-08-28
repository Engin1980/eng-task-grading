namespace EngTaskGradingNetBE.Lib;

using EngTaskGradingNetBE.Models.DbModel;
using EngTaskGradingNetBE.Models.Dtos;

public static class EObjectMapper
{
  public static TeacherDto To(Teacher teacher)
  {
    return new TeacherDto
    {
      Id = teacher.Id,
      Email = teacher.Email,
      IsAdmin = teacher.IsAdmin
    };
  }

  public static List<TeacherDto> To(IEnumerable<Teacher> teachers)
  {
    return teachers.Select(To).ToList();
  }
}
